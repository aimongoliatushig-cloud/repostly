# Hospital AI Content Generation System

Phase 1 суурь систем. Next.js App Router, TypeScript, Tailwind CSS v4, Supabase дээр ажиллана.

## Хийсэн зүйл

- `/dashboard` хянах самбар
- Sidebar navigation
- `/dashboard/doctors` эмчийн CRUD
- `/dashboard/doctors/[id]` avatar management
- `/dashboard/settings` брэндийн тохиргоо
- `/dashboard/topics` placeholder хуудас
- Supabase migration, storage upload flow, Mongolian UI

## Route-ууд

- `src/app/dashboard/page.tsx`
- `src/app/dashboard/doctors/page.tsx`
- `src/app/dashboard/doctors/[id]/page.tsx`
- `src/app/dashboard/settings/page.tsx`
- `src/app/dashboard/topics/page.tsx`

## Гол бүтэц

- `src/components/dashboard-shell.tsx`
- `src/components/dashboard-metric-card.tsx`
- `src/components/asset-preview.tsx`
- `src/lib/doctors/service.ts`
- `src/lib/brands/service.ts`
- `src/lib/dashboard/service.ts`
- `src/lib/storage/service.ts`
- `src/lib/supabase/database.types.ts`
- `src/types/hospital.ts`
- `supabase/migrations/20260407173000_hospital_phase1.sql`

## Supabase schema

Phase 1 дээр дараах хүснэгтүүд ашиглагдана:

- `doctors`
  - `id`
  - `name_mn`
  - `specialty_mn`
  - `portrait_url`
  - `created_at`
- `avatars`
  - `id`
  - `doctor_id`
  - `image_url`
  - `is_primary`
  - `created_at`
- `brand_settings`
  - `id`
  - `hospital_name`
  - `logo_url`
  - `frame_url`
  - `outro_url`
  - `phone`
  - `website`
  - `facebook`
  - `address_mn`

Тэмдэглэл:

- Repo дээр өмнөх multi-tenant `brands` schema хэвээр байгаа.
- `brand_settings.id` нь `brands.id`-тай 1:1 холбоотой.
- `doctors` хүснэгт дээр хуучин `full_name`, `specialization`, `image_path` талбарууд compatibility зорилгоор хадгалагдсан.

## Storage

Supabase storage bucket: `postly-private`

Ашиглагдах folder-ууд:

- `brands/<brand-id>/doctors/portrait/*`
- `brands/<brand-id>/doctors/avatar/*`
- `brands/<brand-id>/brand/logo/*`
- `brands/<brand-id>/brand/frame/*`
- `brands/<brand-id>/brand/outro/*`

## Environment

`.env.local` файлд доорх утгуудыг оруулна:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
APP_URL=http://localhost:3000
```

Дараагийн шатны workflow-д хэрэг болох optional хувьсагчууд:

```bash
OPENAI_API_KEY=
OPENAI_MODEL_SCRIPT=gpt-4.1-mini
KIE_API_KEY=
KIE_API_BASE_URL=https://api.kie.ai
KIE_CALLBACK_SECRET=
```

## Ажиллуулах

### 1. Dependency суулгах

```bash
npm install
```

### 2. Supabase migration ажиллуулах

Local Supabase ашиглаж байгаа бол:

```bash
npx supabase start
npx supabase db reset
```

Cloud project руу холбоод push хийх бол:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

### 3. Next.js app асаах

```bash
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## Шалгах команд

```bash
npm run typecheck
npm run lint
npm run build
```

## Phase 1 UI урсгал

1. Dashboard дээр нийт эмч, placeholder төслүүд, сүүлийн нэмсэн эмч харагдана.
2. Doctors хуудсан дээр эмч нэмнэ, жагсаалтыг харна, edit/delete хийнэ.
3. Doctor detail хуудсан дээр avatar зураг upload хийнэ, primary avatar сонгоно.
4. Settings хуудсан дээр logo, frame, outro болон contact мэдээллийг хадгална.

## Тайлбар

- UI нь Монгол хэл дээр хийгдсэн.
- Doctor/avatar/brand asset upload бүх урсгал Supabase Storage ашиглана.
- Sidebar navigation зөвхөн Phase 1 хэсгүүдийг харуулна.
