alter table public.doctors
  add column if not exists name_mn text,
  add column if not exists specialty_mn text,
  add column if not exists portrait_url text;

update public.doctors
set
  name_mn = coalesce(name_mn, full_name),
  specialty_mn = coalesce(specialty_mn, specialization),
  portrait_url = coalesce(portrait_url, image_path)
where
  name_mn is null
  or specialty_mn is null
  or portrait_url is null;

alter table public.doctors
  alter column name_mn set not null,
  alter column specialty_mn set not null;

create or replace function public.sync_doctor_hospital_fields()
returns trigger
language plpgsql
as $$
begin
  new.name_mn := coalesce(nullif(trim(new.name_mn), ''), nullif(trim(new.full_name), ''));
  new.full_name := coalesce(nullif(trim(new.full_name), ''), new.name_mn);
  new.specialty_mn := coalesce(nullif(trim(new.specialty_mn), ''), nullif(trim(new.specialization), ''));
  new.specialization := coalesce(nullif(trim(new.specialization), ''), new.specialty_mn);
  new.portrait_url := coalesce(nullif(trim(new.portrait_url), ''), nullif(trim(new.image_path), ''));
  new.image_path := coalesce(nullif(trim(new.image_path), ''), new.portrait_url);

  if new.name_mn is null or new.specialty_mn is null then
    raise exception 'Doctor name and specialty are required';
  end if;

  return new;
end;
$$;

drop trigger if exists doctors_sync_hospital_fields on public.doctors;
create trigger doctors_sync_hospital_fields
before insert or update on public.doctors
for each row execute procedure public.sync_doctor_hospital_fields();

create table if not exists public.avatars (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists avatars_doctor_idx
  on public.avatars(doctor_id, created_at desc);

create unique index if not exists avatars_primary_doctor_idx
  on public.avatars(doctor_id)
  where is_primary = true;

create or replace function public.apply_avatar_primary_guard()
returns trigger
language plpgsql
as $$
begin
  if new.is_primary is null then
    new.is_primary := false;
  end if;

  if tg_op = 'INSERT' and not exists (
    select 1
    from public.avatars
    where doctor_id = new.doctor_id
      and id <> new.id
      and is_primary = true
  ) then
    new.is_primary := true;
  end if;

  return new;
end;
$$;

create or replace function public.normalize_primary_avatar()
returns trigger
language plpgsql
as $$
begin
  if new.is_primary then
    update public.avatars
    set is_primary = false
    where doctor_id = new.doctor_id
      and id <> new.id
      and is_primary = true;
  end if;

  return new;
end;
$$;

create or replace function public.restore_primary_avatar_after_delete()
returns trigger
language plpgsql
as $$
begin
  if old.is_primary and exists (
    select 1
    from public.avatars
    where doctor_id = old.doctor_id
  ) then
    update public.avatars
    set is_primary = true
    where id = (
      select id
      from public.avatars
      where doctor_id = old.doctor_id
      order by created_at desc
      limit 1
    );
  end if;

  return old;
end;
$$;

drop trigger if exists avatars_apply_primary_guard on public.avatars;
create trigger avatars_apply_primary_guard
before insert or update on public.avatars
for each row execute procedure public.apply_avatar_primary_guard();

drop trigger if exists avatars_normalize_primary on public.avatars;
create trigger avatars_normalize_primary
after insert or update of is_primary on public.avatars
for each row execute procedure public.normalize_primary_avatar();

drop trigger if exists avatars_restore_primary_after_delete on public.avatars;
create trigger avatars_restore_primary_after_delete
after delete on public.avatars
for each row execute procedure public.restore_primary_avatar_after_delete();

create table if not exists public.brand_settings (
  id uuid primary key references public.brands(id) on delete cascade,
  hospital_name text not null,
  logo_url text,
  frame_url text,
  outro_url text,
  phone text,
  website text,
  facebook text,
  address_mn text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.brand_settings (
  id,
  hospital_name,
  logo_url,
  frame_url,
  outro_url,
  phone,
  website,
  facebook,
  address_mn
)
select
  id,
  name,
  logo_path,
  frame_path,
  outro_video_path,
  phone,
  website,
  facebook_url,
  address
from public.brands
on conflict (id) do update
set
  hospital_name = excluded.hospital_name,
  logo_url = coalesce(public.brand_settings.logo_url, excluded.logo_url),
  frame_url = coalesce(public.brand_settings.frame_url, excluded.frame_url),
  outro_url = coalesce(public.brand_settings.outro_url, excluded.outro_url),
  phone = coalesce(public.brand_settings.phone, excluded.phone),
  website = coalesce(public.brand_settings.website, excluded.website),
  facebook = coalesce(public.brand_settings.facebook, excluded.facebook),
  address_mn = coalesce(public.brand_settings.address_mn, excluded.address_mn);

create or replace function public.create_brand_settings_for_brand()
returns trigger
language plpgsql
as $$
begin
  insert into public.brand_settings (
    id,
    hospital_name,
    logo_url,
    frame_url,
    outro_url,
    phone,
    website,
    facebook,
    address_mn
  )
  values (
    new.id,
    new.name,
    new.logo_path,
    new.frame_path,
    new.outro_video_path,
    new.phone,
    new.website,
    new.facebook_url,
    new.address
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists brands_create_brand_settings on public.brands;
create trigger brands_create_brand_settings
after insert on public.brands
for each row execute procedure public.create_brand_settings_for_brand();

drop trigger if exists brand_settings_set_updated_at on public.brand_settings;
create trigger brand_settings_set_updated_at
before update on public.brand_settings
for each row execute procedure public.set_updated_at();

alter table public.avatars enable row level security;
alter table public.brand_settings enable row level security;

drop policy if exists "avatars_select" on public.avatars;
create policy "avatars_select"
on public.avatars
for select
using (
  exists (
    select 1
    from public.doctors
    where public.doctors.id = avatars.doctor_id
      and public.has_brand_access(public.doctors.brand_id)
  )
);

drop policy if exists "avatars_manage" on public.avatars;
create policy "avatars_manage"
on public.avatars
for all
using (
  exists (
    select 1
    from public.doctors
    where public.doctors.id = avatars.doctor_id
      and public.has_brand_access(public.doctors.brand_id)
  )
)
with check (
  exists (
    select 1
    from public.doctors
    where public.doctors.id = avatars.doctor_id
      and public.has_brand_access(public.doctors.brand_id)
  )
);

drop policy if exists "brand_settings_select" on public.brand_settings;
create policy "brand_settings_select"
on public.brand_settings
for select
using (public.has_brand_access(id));

drop policy if exists "brand_settings_manage" on public.brand_settings;
create policy "brand_settings_manage"
on public.brand_settings
for all
using (public.has_brand_access(id))
with check (public.has_brand_access(id));
