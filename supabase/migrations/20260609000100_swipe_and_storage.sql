-- ============================================================================
-- Swipe scaling, duplicate-application guard, and avatar storage
-- ----------------------------------------------------------------------------
--   1. Unique (candidate_id, job_id) on applications  — a candidate can only
--      apply to a given job once (swipe-apply and the Apply modal could both
--      insert before this).
--   2. get_unswiped_jobs() RPC — returns a candidate's next batch of jobs with
--      the already-swiped ones filtered out IN THE DATABASE, instead of sending
--      every swiped id back in the URL (which eventually 414s the request).
--   3. Public `avatars` storage bucket — so profile photos use a permanent
--      public URL instead of a signed URL that expires after a year.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. De-dupe existing applications, then add the unique constraint
-- ----------------------------------------------------------------------------
begin;

-- Keep the earliest application per (candidate, job); drop the rest.
delete from public.applications
where id in (
  select id from (
    select id,
           row_number() over (
             partition by candidate_id, job_id
             order by applied_at asc nulls last, id asc
           ) as rn
    from public.applications
  ) ranked
  where ranked.rn > 1
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'applications_candidate_job_unique'
  ) then
    alter table public.applications
      add constraint applications_candidate_job_unique unique (candidate_id, job_id);
  end if;
end $$;

commit;

-- ----------------------------------------------------------------------------
-- 2. Server-side "jobs this candidate hasn't swiped yet"
-- ----------------------------------------------------------------------------
-- p_exclude lets the client pass the ids currently sitting in the deck (not yet
-- swiped) so a refill doesn't hand back the same cards. Runs as the caller
-- (security invoker) so the jobs RLS SELECT policy still applies.
create or replace function public.get_unswiped_jobs(
  p_candidate_id uuid,
  p_limit int default 20,
  p_exclude uuid[] default '{}'
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  from (
    select
      j.id, j.company_id, j.title, j.type, j.description, j.skills_required,
      j.location, j.mode, j.stipend_min, j.stipend_max, j.is_active, j.posted_at,
      jsonb_build_object(
        'company_name', cp.company_name,
        'industry',     cp.industry,
        'logo_url',     cp.logo_url
      ) as company_profiles
    from public.jobs j
    left join public.company_profiles cp on cp.id = j.company_id
    where j.is_active = true
      and j.id <> all (p_exclude)
      and not exists (
        select 1 from public.job_swipes s
        where s.candidate_id = p_candidate_id
          and s.job_id = j.id
      )
    order by j.posted_at desc
    limit greatest(p_limit, 1)
  ) t;
$$;

grant execute on function public.get_unswiped_jobs(uuid, int, uuid[]) to authenticated;

-- ----------------------------------------------------------------------------
-- 3. Public avatars bucket + policies  --  OPTIONAL (storage infra)
-- ----------------------------------------------------------------------------
-- Skip this block if you manage storage buckets/policies elsewhere. It is
-- idempotent and safe to re-run.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars owner insert" on storage.objects;
create policy "avatars owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
