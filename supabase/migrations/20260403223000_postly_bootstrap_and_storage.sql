create or replace function public.storage_brand_id(object_name text)
returns uuid
language plpgsql
immutable
as $$
declare
  path_parts text[];
begin
  path_parts := string_to_array(object_name, '/');

  if array_length(path_parts, 1) < 2 or path_parts[1] <> 'brands' then
    return null;
  end if;

  begin
    return path_parts[2]::uuid;
  exception
    when others then
      return null;
  end;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'postly-private',
  'postly-private',
  false,
  157286400,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'audio/mpeg',
    'video/mp4',
    'video/quicktime'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "postly_private_object_select" on storage.objects;
create policy "postly_private_object_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'postly-private'
  and public.has_brand_access(public.storage_brand_id(name))
);

drop policy if exists "postly_private_object_insert" on storage.objects;
create policy "postly_private_object_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'postly-private'
  and public.has_brand_access(public.storage_brand_id(name))
);

drop policy if exists "postly_private_object_update" on storage.objects;
create policy "postly_private_object_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'postly-private'
  and public.has_brand_access(public.storage_brand_id(name))
)
with check (
  bucket_id = 'postly-private'
  and public.has_brand_access(public.storage_brand_id(name))
);

drop policy if exists "postly_private_object_delete" on storage.objects;
create policy "postly_private_object_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'postly-private'
  and public.has_brand_access(public.storage_brand_id(name))
);

drop policy if exists "generation_jobs_manage" on public.generation_jobs;
create policy "generation_jobs_manage"
on public.generation_jobs
for all
using (public.has_project_access(project_id))
with check (public.has_project_access(project_id));

create index if not exists brand_memberships_default_lookup_idx
  on public.brand_memberships(user_id, is_default desc, created_at asc);

create index if not exists doctors_active_brand_idx
  on public.doctors(brand_id, created_at desc)
  where is_active = true;

create index if not exists brand_subscriptions_active_idx
  on public.brand_subscriptions(brand_id, created_at desc)
  where status = 'active';

create unique index if not exists credit_ledger_completed_video_unique_idx
  on public.credit_ledger(project_id, reason)
  where project_id is not null and reason = 'completed_video';

create or replace function public.bootstrap_brand_account(
  target_user_id uuid,
  brand_name text,
  brand_phone text default null,
  initial_plan_code text default 'plan_5',
  requested_slug text default null
)
returns table (
  brand_id uuid,
  subscription_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_user_id uuid;
  selected_plan record;
  generated_slug text;
  existing_brand_id uuid;
begin
  caller_user_id := auth.uid();

  if target_user_id is null then
    raise exception 'Target user is required';
  end if;

  if coalesce(trim(brand_name), '') = '' then
    raise exception 'Brand name is required';
  end if;

  if caller_user_id is not null
    and caller_user_id <> target_user_id
    and not public.is_platform_admin()
  then
    raise exception 'Not allowed to bootstrap another user';
  end if;

  if not exists (
    select 1
    from public.profiles
    where user_id = target_user_id
  ) then
    raise exception 'Profile not found for target user';
  end if;

  select bm.brand_id
  into existing_brand_id
  from public.brand_memberships bm
  where bm.user_id = target_user_id
  order by bm.is_default desc, bm.created_at asc
  limit 1;

  if existing_brand_id is not null then
    return query
    select
      existing_brand_id,
      (
        select bs.id
        from public.brand_subscriptions bs
        where bs.brand_id = existing_brand_id
          and bs.status = 'active'
        order by bs.created_at desc
        limit 1
      );
    return;
  end if;

  select *
  into selected_plan
  from public.subscription_plans
  where plan_code = initial_plan_code
    and is_active = true
  limit 1;

  if selected_plan is null then
    raise exception 'Subscription plan not found';
  end if;

  generated_slug := lower(coalesce(nullif(trim(requested_slug), ''), trim(brand_name)));
  generated_slug := regexp_replace(generated_slug, '[^a-z0-9]+', '-', 'g');
  generated_slug := trim(both '-' from generated_slug);

  if generated_slug = '' then
    generated_slug := 'brand-' || substr(replace(target_user_id::text, '-', ''), 1, 10);
  end if;

  while exists (
    select 1
    from public.brands
    where slug = generated_slug
  ) loop
    generated_slug := generated_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  end loop;

  insert into public.brands (
    name,
    slug,
    phone,
    created_by
  )
  values (
    trim(brand_name),
    generated_slug,
    nullif(trim(brand_phone), ''),
    target_user_id
  )
  returning id into brand_id;

  insert into public.brand_memberships (
    brand_id,
    user_id,
    role,
    is_default
  )
  values (
    brand_id,
    target_user_id,
    'brand',
    true
  );

  insert into public.brand_subscriptions (
    brand_id,
    plan_id,
    status,
    total_credits,
    remaining_credits
  )
  values (
    brand_id,
    selected_plan.id,
    'active',
    selected_plan.credits,
    selected_plan.credits
  )
  returning id into subscription_id;

  insert into public.credit_ledger (
    brand_id,
    subscription_id,
    delta,
    reason,
    note,
    created_by
  )
  values (
    brand_id,
    subscription_id,
    selected_plan.credits,
    'plan_allocation',
    'Initial plan allocation during registration',
    target_user_id
  );

  return next;
end;
$$;

grant execute on function public.bootstrap_brand_account(uuid, text, text, text, text)
to anon, authenticated, service_role;
