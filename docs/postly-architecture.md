# Postly AI Architecture

## 1. Supabase schema

Core entities:

- `profiles`: Supabase хэрэглэгчийн global role, утас, идэвх.
- `brands`: Эмнэлэг эсвэл компанийн master profile болон visual assets.
- `brand_memberships`: Brand, agent, admin access model.
- `subscription_plans`, `brand_subscriptions`, `credit_ledger`: Billing ба credit хөдөлгөөн.
- `doctors`, `organ_avatars`, `brand_assets`: Контентын эх үүсвэр.
- `video_projects`, `project_scenes`, `generation_jobs`: Async video pipeline.

Design rules:

- `content_type = b_roll_head_explainer` үед doctor шаардлагатай, limit `<= 45`.
- `content_type = organ_talk` үед organ avatar шаардлагатай, limit `<= 40`.
- Дууссан video бүр `credit_ledger` дээр `-1` movement үлдээнэ.
- RLS нь `is_platform_admin`, `has_brand_access`, `has_project_access` helper функцээр хэрэгжинэ.

## 2. API structure

Internal modules:

- `auth`: Register, login, brand context.
- `projects`: Draft project үүсгэх, storyboard унших, scene update, generate queue.
- `jobs`: Async status polling, retry UI.
- `doctors`, `organ-avatars`, `brand/settings`, `plans`: Picker болон dashboard master data.

Provider orchestration:

- OpenAI: topic, hook, script, storyboard, animation plan.
- KIE.ai: clip render, voice task, task status polling, callback.
- System worker: merge, frame apply, outro append, credit consume.

## 3. UI pages

Implemented scaffold:

- `/`
- `/auth`
- `/dashboard`
- `/videos/new/broll`
- `/videos/new/organ-talk`
- `/admin/doctors`
- `/settings/brand`
- `/subscriptions`

Shared UX rules:

- Бүх page card-based layout.
- Mobile-first spacing, horizontal scroll nav chips.
- Scene бүр edit, preview, regenerate action-тай.
- Turquoise green visual direction.

## 4. Next build phase

Recommended implementation order:

1. Supabase client + auth callbacks
2. Storage upload flow for doctor portrait, MP3, frame, outro
3. OpenAI planning endpoints
4. KIE async clip generation worker
5. FFmpeg merge pipeline
6. Webhook/callback verification and credit deduction
