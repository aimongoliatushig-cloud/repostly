# Postly AI

Монгол хэл дээр ажиллах, эмнэлэг болон агентуудад зориулсан AI видео үйлдвэрлэлийн SaaS scaffold.

## Юу бэлэн болсон бэ

- Supabase core schema, RLS, credit deduction function
- Supabase SSR client helpers болон session refresh proxy
- OpenAI + KIE.ai урсгалд таарсан API contract route-ууд
- Монгол UI-тэй mobile-first page scaffold
- Subscription plan, doctor system, brand settings, scene card workflow

## Хуудаснууд

- `/`
- `/auth`
- `/dashboard`
- `/videos/new/broll`
- `/videos/new/organ-talk`
- `/admin/doctors`
- `/settings/brand`
- `/subscriptions`

## API route-ууд

- `/api/health`
- `/api/pipeline`
- `/api/auth/login`
- `/api/auth/register`
- `/api/plans`
- `/api/organ-avatars`
- `/api/doctors`
- `/api/brand/settings`
- `/api/projects`
- `/api/projects/[projectId]/storyboard`
- `/api/projects/[projectId]/generate`
- `/api/jobs/[jobId]`

## Supabase migration

Core migration:

- `supabase/migrations/20260403194000_postly_core.sql`

Агуулга:

- `profiles`, `brands`, `brand_memberships`
- `subscription_plans`, `brand_subscriptions`, `credit_ledger`
- `doctors`, `organ_avatars`, `brand_assets`
- `video_projects`, `project_scenes`, `generation_jobs`
- `consume_video_credit()` функц
- Row Level Security policies

## Environment variables

`.env.local` файлд:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL_SCRIPT=gpt-4.1-mini
KIE_API_KEY=
KIE_API_BASE_URL=https://api.kie.ai
KIE_CALLBACK_SECRET=
```

Supabase SSR helper файлууд:

- `src/utils/supabase/client.ts`
- `src/utils/supabase/server.ts`
- `src/utils/supabase/middleware.ts`
- `src/proxy.ts`

## Ажиллуулах

```bash
npm install
npm run dev
```

Шалгах командууд:

```bash
npm run lint
npm run typecheck
npm run build
```

## Дараагийн хэрэгжилт

1. Supabase auth callback болон session management
2. Storage upload flow
3. OpenAI planning endpoint-уудын бодит integration
4. KIE.ai async job create/status/callback integration
5. FFmpeg merge worker
