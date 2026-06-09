-- ============================================================================
-- Auth role integrity
-- ----------------------------------------------------------------------------
-- Defense-in-depth for the dual-account bug: a single auth user must have ONE
-- role, and that role is final once chosen. The app-level `.is('role', null)`
-- guards stop honest clients, but a direct API/SQL call could still flip a role
-- or create the opposite profile. These constraints make that impossible.
--
-- Two guarantees:
--   1. profiles.role is immutable once set (null -> value is allowed; value ->
--      different value or value -> null is rejected).
--   2. A user_id can own a row in candidate_profiles XOR company_profiles,
--      never both — and that table must match profiles.role.
--
-- Trigger functions are SECURITY DEFINER so the cross-table integrity checks
-- see every row regardless of the caller's RLS policies (otherwise RLS could
-- hide a conflicting row and let the check pass).
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. profiles.role is write-once
-- ----------------------------------------------------------------------------
create or replace function public.enforce_role_immutable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is not null and new.role is distinct from old.role then
    raise exception
      'profiles.role is immutable once set (user %, % -> %)',
      old.id, old.role, new.role
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_role_immutable on public.profiles;
create trigger trg_profiles_role_immutable
  before update of role on public.profiles
  for each row
  execute function public.enforce_role_immutable();

-- ----------------------------------------------------------------------------
-- 2. A user can be a candidate XOR a company, never both
-- ----------------------------------------------------------------------------
-- Candidate profile: reject if a company profile already exists, and require
-- the parent profiles.role to be 'candidate'.
create or replace function public.enforce_candidate_exclusive()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.company_profiles c where c.user_id = new.user_id) then
    raise exception
      'user % already has a company profile; cannot also be a candidate', new.user_id
      using errcode = 'unique_violation';
  end if;

  if exists (
    select 1 from public.profiles p
    where p.id = new.user_id and p.role is distinct from 'candidate'
  ) then
    raise exception
      'user % role does not match candidate_profiles (expected role = candidate)', new.user_id
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_candidate_profiles_exclusive on public.candidate_profiles;
create trigger trg_candidate_profiles_exclusive
  before insert or update of user_id on public.candidate_profiles
  for each row
  execute function public.enforce_candidate_exclusive();

-- Company profile: mirror of the above.
create or replace function public.enforce_company_exclusive()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.candidate_profiles c where c.user_id = new.user_id) then
    raise exception
      'user % already has a candidate profile; cannot also be a company', new.user_id
      using errcode = 'unique_violation';
  end if;

  if exists (
    select 1 from public.profiles p
    where p.id = new.user_id and p.role is distinct from 'company'
  ) then
    raise exception
      'user % role does not match company_profiles (expected role = company)', new.user_id
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_company_profiles_exclusive on public.company_profiles;
create trigger trg_company_profiles_exclusive
  before insert or update of user_id on public.company_profiles
  for each row
  execute function public.enforce_company_exclusive();

commit;

-- ============================================================================
-- 3. Existing dirty-data cleanup  --  REVIEW BEFORE RUNNING
-- ----------------------------------------------------------------------------
-- The triggers above only police FUTURE writes. Accounts that already own both
-- a candidate_profiles and a company_profiles row are untouched. Resolve them
-- explicitly — this is destructive, so it is intentionally left commented out.
--
-- Step 3a — INSPECT first. Surface every conflicted account and its current role:
--
--   select p.id as user_id, p.role,
--          (cp.user_id is not null) as has_candidate,
--          (comp.user_id is not null) as has_company
--   from public.profiles p
--   join public.candidate_profiles cp on cp.user_id = p.id
--   join public.company_profiles  comp on comp.user_id = p.id;
--
-- Step 3b — RESOLVE. Default policy: profiles.role is the source of truth, so
-- delete the sub-profile that contradicts it. Accounts with role = null are
-- ambiguous and are deliberately skipped here — decide those by hand (e.g. keep
-- the earliest-created row) before re-running, or the triggers will reject the
-- next write to them.
--
--   -- role says candidate -> drop the stray company profile
--   delete from public.company_profiles comp
--   using public.profiles p
--   where comp.user_id = p.id
--     and p.role = 'candidate'
--     and exists (select 1 from public.candidate_profiles cp where cp.user_id = p.id);
--
--   -- role says company -> drop the stray candidate profile
--   delete from public.candidate_profiles cp
--   using public.profiles p
--   where cp.user_id = p.id
--     and p.role = 'company'
--     and exists (select 1 from public.company_profiles comp where comp.user_id = p.id);
-- ============================================================================
