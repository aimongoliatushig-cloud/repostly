create or replace function public.apply_kie_scene_callback(
  target_project_id uuid,
  target_scene_id uuid,
  target_provider_job_id text,
  job_state text,
  video_url text default null,
  fail_message text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_job_id uuid;
  next_scene_status public.scene_status;
  next_job_status public.job_status;
begin
  next_scene_status := case
    when job_state = 'success' then 'ready'::public.scene_status
    when job_state = 'fail' then 'failed'::public.scene_status
    when job_state = 'generating' then 'rendering'::public.scene_status
    else 'queued'::public.scene_status
  end;

  next_job_status := case
    when job_state = 'success' then 'succeeded'::public.job_status
    when job_state = 'fail' then 'failed'::public.job_status
    when job_state = 'generating' then 'processing'::public.job_status
    else 'queued'::public.job_status
  end;

  select id
  into target_job_id
  from public.generation_jobs
  where project_id = target_project_id
    and scene_id = target_scene_id
    and provider = 'kie'
    and provider_job_id = target_provider_job_id
  order by created_at desc
  limit 1;

  if target_job_id is not null then
    update public.generation_jobs
    set status = next_job_status,
        response_payload = jsonb_build_object(
          'state', job_state,
          'videoUrl', video_url,
          'failMessage', fail_message
        ),
        error_message = fail_message,
        finished_at = case
          when next_job_status in ('succeeded', 'failed') then timezone('utc', now())
          else finished_at
        end,
        updated_at = timezone('utc', now())
    where id = target_job_id;
  end if;

  update public.project_scenes
  set status = next_scene_status,
      provider_clip_job_id = target_provider_job_id,
      clip_url = coalesce(video_url, clip_url),
      preview_url = coalesce(video_url, preview_url),
      error_message = fail_message,
      last_generated_at = case
        when next_scene_status in ('ready', 'rendering') then timezone('utc', now())
        else last_generated_at
      end,
      updated_at = timezone('utc', now())
  where id = target_scene_id
    and project_id = target_project_id;

  if next_job_status = 'failed' then
    update public.video_projects
    set status = 'failed',
        error_message = coalesce(fail_message, error_message),
        updated_at = timezone('utc', now())
    where id = target_project_id;
  end if;
end;
$$;

grant execute on function public.apply_kie_scene_callback(uuid, uuid, text, text, text, text)
to anon, authenticated, service_role;
