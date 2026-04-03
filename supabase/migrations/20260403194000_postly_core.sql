create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'brand', 'agent');
create type public.content_type as enum ('b_roll_head_explainer', 'organ_talk');
create type public.project_status as enum (
  'draft',
  'planning',
  'queued',
  'rendering',
  'completed',
  'failed'
);
create type public.scene_status as enum (
  'editable',
  'queued',
  'rendering',
  'ready',
  'failed'
);
create type public.job_status as enum (
  'queued',
  'processing',
  'retrying',
  'succeeded',
  'failed'
);
create type public.job_type as enum (
  'topic_hook',
  'storyboard',
  'animation_plan',
  'script',
  'scene_video',
  'scene_voice',
  'merge'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'brand',
  full_name text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  phone text,
  website text,
  facebook_url text,
  address text,
  logo_path text,
  frame_path text,
  outro_video_path text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(user_id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.brand_memberships (
  brand_id uuid not null references public.brands(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  role public.app_role not null,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (brand_id, user_id),
  constraint brand_memberships_role_check check (role in ('brand', 'agent'))
);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  plan_code text not null unique,
  name text not null,
  credits integer not null check (credits > 0),
  price_mnt integer not null check (price_mnt > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.brand_subscriptions (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  status text not null default 'active',
  total_credits integer not null check (total_credits >= 0),
  remaining_credits integer not null check (remaining_credits >= 0),
  starts_at timestamptz not null default timezone('utc', now()),
  renews_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  subscription_id uuid references public.brand_subscriptions(id) on delete set null,
  project_id uuid,
  delta integer not null,
  reason text not null,
  note text,
  created_by uuid references public.profiles(user_id),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.organ_avatars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text not null,
  default_voice_key text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  full_name text not null,
  specialization text not null,
  image_path text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(user_id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.brand_assets (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  asset_type text not null,
  storage_path text not null,
  mime_type text,
  created_by uuid references public.profiles(user_id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint brand_assets_type_check check (
    asset_type in ('logo', 'frame', 'outro', 'audio', 'image')
  )
);

create table public.video_projects (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  created_by uuid references public.profiles(user_id),
  content_type public.content_type not null,
  doctor_id uuid references public.doctors(id) on delete set null,
  organ_avatar_id uuid references public.organ_avatars(id) on delete set null,
  title text not null,
  topic text,
  hook text,
  script_text text,
  cta_text text,
  source_audio_path text,
  status public.project_status not null default 'draft',
  duration_limit_seconds integer not null check (duration_limit_seconds > 0),
  estimated_duration_seconds integer check (estimated_duration_seconds >= 0),
  apply_frame boolean not null default false,
  apply_outro boolean not null default false,
  seed_group_id text,
  final_video_url text,
  error_message text,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint video_projects_mode_check check (
    (
      content_type = 'b_roll_head_explainer'
      and doctor_id is not null
      and organ_avatar_id is null
      and duration_limit_seconds <= 45
    )
    or
    (
      content_type = 'organ_talk'
      and doctor_id is null
      and organ_avatar_id is not null
      and duration_limit_seconds <= 40
    )
  )
);

create table public.project_scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.video_projects(id) on delete cascade,
  scene_index integer not null check (scene_index > 0),
  title text not null,
  narration text,
  visual_prompt text,
  animation_prompt text,
  duration_seconds integer not null check (duration_seconds > 0 and duration_seconds <= 10),
  status public.scene_status not null default 'editable',
  provider_clip_job_id text,
  seed_id text,
  clip_url text,
  preview_url text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  last_generated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (project_id, scene_index)
);

create table public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.video_projects(id) on delete cascade,
  scene_id uuid references public.project_scenes(id) on delete cascade,
  provider text not null,
  job_type public.job_type not null,
  status public.job_status not null default 'queued',
  provider_job_id text,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  error_message text,
  retry_count integer not null default 0,
  available_at timestamptz not null default timezone('utc', now()),
  started_at timestamptz,
  finished_at timestamptz,
  created_by uuid references public.profiles(user_id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint generation_jobs_provider_check check (
    provider in ('openai', 'kie', 'system')
  )
);

alter table public.credit_ledger
  add constraint credit_ledger_project_fk
  foreign key (project_id) references public.video_projects(id) on delete set null;

create index brand_memberships_user_idx on public.brand_memberships(user_id);
create index doctors_brand_idx on public.doctors(brand_id);
create index brand_assets_brand_idx on public.brand_assets(brand_id);
create index subscriptions_brand_idx on public.brand_subscriptions(brand_id);
create index credit_ledger_brand_idx on public.credit_ledger(brand_id, created_at desc);
create index video_projects_brand_idx on public.video_projects(brand_id, created_at desc);
create index video_projects_status_idx on public.video_projects(status, content_type);
create index project_scenes_project_idx on public.project_scenes(project_id, scene_index);
create index generation_jobs_project_idx on public.generation_jobs(project_id, created_at desc);
create index generation_jobs_status_idx on public.generation_jobs(status, available_at);

create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function public.has_brand_access(target_brand_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.brand_memberships
      join public.profiles on public.profiles.user_id = public.brand_memberships.user_id
      where public.brand_memberships.brand_id = target_brand_id
        and public.brand_memberships.user_id = auth.uid()
        and public.profiles.is_active = true
    );
$$;

create or replace function public.has_project_access(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.video_projects
    where id = target_project_id
      and public.has_brand_access(brand_id)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

create or replace function public.consume_video_credit(
  target_project_id uuid,
  final_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_brand_id uuid;
  target_subscription_id uuid;
begin
  select brand_id
  into target_brand_id
  from public.video_projects
  where id = target_project_id;

  if target_brand_id is null then
    raise exception 'Project not found';
  end if;

  select id
  into target_subscription_id
  from public.brand_subscriptions
  where brand_id = target_brand_id
    and status = 'active'
  order by created_at desc
  limit 1;

  if target_subscription_id is null then
    raise exception 'Active subscription not found';
  end if;

  if exists (
    select 1
    from public.credit_ledger
    where project_id = target_project_id
      and reason = 'completed_video'
  ) then
    update public.video_projects
    set status = 'completed',
        final_video_url = final_url,
        completed_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where id = target_project_id;

    return;
  end if;

  update public.brand_subscriptions
  set remaining_credits = remaining_credits - 1,
      updated_at = timezone('utc', now())
  where id = target_subscription_id
    and remaining_credits > 0;

  if not found then
    raise exception 'Insufficient credits';
  end if;

  insert into public.credit_ledger (
    brand_id,
    subscription_id,
    project_id,
    delta,
    reason,
    note
  )
  values (
    target_brand_id,
    target_subscription_id,
    target_project_id,
    -1,
    'completed_video',
    'Final video completed and delivered'
  );

  update public.video_projects
  set status = 'completed',
      final_video_url = final_url,
      completed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = target_project_id;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger brands_set_updated_at
before update on public.brands
for each row execute procedure public.set_updated_at();

create trigger subscription_plans_set_updated_at
before update on public.subscription_plans
for each row execute procedure public.set_updated_at();

create trigger brand_subscriptions_set_updated_at
before update on public.brand_subscriptions
for each row execute procedure public.set_updated_at();

create trigger organ_avatars_set_updated_at
before update on public.organ_avatars
for each row execute procedure public.set_updated_at();

create trigger doctors_set_updated_at
before update on public.doctors
for each row execute procedure public.set_updated_at();

create trigger brand_assets_set_updated_at
before update on public.brand_assets
for each row execute procedure public.set_updated_at();

create trigger video_projects_set_updated_at
before update on public.video_projects
for each row execute procedure public.set_updated_at();

create trigger project_scenes_set_updated_at
before update on public.project_scenes
for each row execute procedure public.set_updated_at();

create trigger generation_jobs_set_updated_at
before update on public.generation_jobs
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.brand_memberships enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.brand_subscriptions enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.organ_avatars enable row level security;
alter table public.doctors enable row level security;
alter table public.brand_assets enable row level security;
alter table public.video_projects enable row level security;
alter table public.project_scenes enable row level security;
alter table public.generation_jobs enable row level security;

create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (user_id = auth.uid() or public.is_platform_admin());

create policy "profiles_update_self_or_admin"
on public.profiles
for update
using (user_id = auth.uid() or public.is_platform_admin())
with check (user_id = auth.uid() or public.is_platform_admin());

create policy "brands_select_for_members"
on public.brands
for select
using (public.has_brand_access(id));

create policy "brands_update_for_members"
on public.brands
for update
using (public.has_brand_access(id))
with check (public.has_brand_access(id));

create policy "brands_insert_admin_only"
on public.brands
for insert
with check (public.is_platform_admin());

create policy "brand_memberships_select"
on public.brand_memberships
for select
using (
  user_id = auth.uid()
  or public.has_brand_access(brand_id)
  or public.is_platform_admin()
);

create policy "brand_memberships_manage"
on public.brand_memberships
for all
using (public.has_brand_access(brand_id) or public.is_platform_admin())
with check (public.has_brand_access(brand_id) or public.is_platform_admin());

create policy "subscription_plans_select_authenticated"
on public.subscription_plans
for select
using (auth.uid() is not null);

create policy "brand_subscriptions_select"
on public.brand_subscriptions
for select
using (public.has_brand_access(brand_id));

create policy "credit_ledger_select"
on public.credit_ledger
for select
using (public.has_brand_access(brand_id));

create policy "organ_avatars_select_authenticated"
on public.organ_avatars
for select
using (auth.uid() is not null);

create policy "doctors_select"
on public.doctors
for select
using (public.has_brand_access(brand_id));

create policy "doctors_manage"
on public.doctors
for all
using (public.has_brand_access(brand_id))
with check (public.has_brand_access(brand_id));

create policy "brand_assets_select"
on public.brand_assets
for select
using (public.has_brand_access(brand_id));

create policy "brand_assets_manage"
on public.brand_assets
for all
using (public.has_brand_access(brand_id))
with check (public.has_brand_access(brand_id));

create policy "video_projects_select"
on public.video_projects
for select
using (public.has_brand_access(brand_id));

create policy "video_projects_manage"
on public.video_projects
for all
using (public.has_brand_access(brand_id))
with check (public.has_brand_access(brand_id));

create policy "project_scenes_select"
on public.project_scenes
for select
using (public.has_project_access(project_id));

create policy "project_scenes_manage"
on public.project_scenes
for all
using (public.has_project_access(project_id))
with check (public.has_project_access(project_id));

create policy "generation_jobs_select"
on public.generation_jobs
for select
using (public.has_project_access(project_id));

insert into public.subscription_plans (plan_code, name, credits, price_mnt)
values
  ('plan_5', 'Эхлэх багц', 5, 350000),
  ('plan_10', 'Өсөлтийн багц', 10, 560000),
  ('plan_15', 'Контент үйлдвэр', 15, 770000),
  ('plan_20', 'Эрчимтэй багц', 20, 980000)
on conflict (plan_code) do update
set name = excluded.name,
    credits = excluded.credits,
    price_mnt = excluded.price_mnt,
    updated_at = timezone('utc', now());

insert into public.organ_avatars (slug, label, description, default_voice_key)
values
  ('heart', 'Зүрх', 'Зүрхний шинж тэмдэг, даралт, эрсдэлийг тайлбарлана.', 'mn-heart'),
  ('liver', 'Элэг', 'Элэгний өөхлөлт, вирус, шинжилгээний зөвлөмж өгнө.', 'mn-liver'),
  ('kidney', 'Бөөр', 'Бөөрний дохио, усны хэрэглээ, шинжилгээг тайлбарлана.', 'mn-kidney'),
  ('lung', 'Уушги', 'Амьсгалын зам, ханиалга, тамхины эрсдэлийг тайлбарлана.', 'mn-lung'),
  ('intestine', 'Гэдэс', 'Хоол боловсруулалт, гэдэсний шинжилгээний зөвлөгөө өгнө.', 'mn-intestine'),
  ('female_reproductive', 'Эмэгтэйчүүд', 'Эмэгтэйчүүдийн урьдчилан сэргийлэх үзлэгийг тайлбарлана.', 'mn-female')
on conflict (slug) do update
set label = excluded.label,
    description = excluded.description,
    default_voice_key = excluded.default_voice_key,
    updated_at = timezone('utc', now());
