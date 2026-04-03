# Postly AI

Монгол хэл дээр ажиллах, эмнэлэг болон агентуудад зориулсан AI reel production SaaS.

## Одоо бодитоор ажиллаж буй зүйлс

- Supabase core schema, RLS, credit deduction function, brand bootstrap function
- Supabase SSR auth, protected routing, current brand context resolution
- Dashboard, doctors, brand settings, projects, B-roll, Organ Talk protected pages
- Real doctors CRUD, brand settings persistence, storage upload flow
- Real project draft creation, storyboard planning, scene editing, per-scene generation jobs
- KIE polling + callback wiring
- FFmpeg дээр суурилсан final merge pipeline

## Гол route-ууд

- `/auth`
- `/dashboard`
- `/dashboard/broll`
- `/dashboard/organ`
- `/dashboard/doctors`
- `/dashboard/settings`
- `/dashboard/projects`
- `/dashboard/projects/[projectId]`

Legacy scaffold route-ууд redirect хийнэ:

- `/admin/doctors`
- `/settings/brand`
- `/videos/new/broll`
- `/videos/new/organ-talk`

## Supabase migration-ууд

- `supabase/migrations/20260403194000_postly_core.sql`
- `supabase/migrations/20260403223000_postly_bootstrap_and_storage.sql`
- `supabase/migrations/20260403234500_postly_kie_callback.sql`

## Environment variables

`.env.local` файлд дор хаяж:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
APP_URL=http://localhost:3000
OPENAI_API_KEY=
OPENAI_MODEL_SCRIPT=gpt-4.1-mini
KIE_API_KEY=
KIE_API_BASE_URL=https://api.kie.ai
KIE_CALLBACK_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
```

Тайлбар:

- `OPENAI_API_KEY` байхгүй бол storyboard planning template fallback руу орно.
- `KIE_API_KEY` байхгүй бол scene generation failed state-ээр бууна, mock success хийхгүй.
- `APP_URL` нь KIE callback URL үүсгэхэд хэрэглэгдэнэ.
- `SUPABASE_SERVICE_ROLE_KEY` одоогийн кодын үндсэн урсгалд заавал биш, гэхдээ цаашдын worker/background automation-д ашигтай.

## Ажиллуулах

```bash
npm install
npm run dev
```

Шалгах:

```bash
npm run lint
npm run typecheck
npm run build
```

## Нэмэлт note

- Scene clip generation нь KIE Runway endpoint дээр суурилсан.
- Final merge нь local `ffmpeg` ашиглана.
- Credit deduction зөвхөн final merge амжилттай дууссаны дараа `consume_video_credit()` RPC-ээр хийгдэнэ.
