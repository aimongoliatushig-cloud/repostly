import type {
  ApiGroup,
  ContentType,
  DashboardMetric,
  DatabaseSection,
  Doctor,
  OrganAvatar,
  PageLink,
  ProjectSummary,
  QueueJob,
  SceneCard,
  SubscriptionPlan,
} from "@/lib/postly-types";

export const appName = "Postly AI";

export const primaryNavigation: PageLink[] = [
  {
    href: "/",
    label: "Ерөнхий зураглал",
    description: "Schema, API болон page map.",
  },
  {
    href: "/dashboard",
    label: "Хяналтын самбар",
    description: "Кредит, queue, төслүүд.",
  },
  {
    href: "/dashboard/broll",
    label: "B-roll студи",
    description: "Эмч + MP3 урсгал.",
  },
  {
    href: "/dashboard/organ",
    label: "Орган студи",
    description: "Avatar тайлбарлагч урсгал.",
  },
  {
    href: "/dashboard/doctors",
    label: "Эмчийн сан",
    description: "Админ эмчийн удирдлага.",
  },
  {
    href: "/dashboard/settings",
    label: "Брэнд тохиргоо",
    description: "Лого, frame, outro.",
  },
  {
    href: "/dashboard/projects",
    label: "Төслүүд",
    description: "B-roll, Organ talk төслүүд.",
  },
  {
    href: "/auth",
    label: "Нэвтрэх",
    description: "Brand account нэвтрэлт.",
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan_5",
    credits: 5,
    priceMnt: 350000,
    label: "Эхлэх багц",
    description: "Сард 5 бэлэн reel. Туршилт эхлүүлэх эмнэлэгт.",
  },
  {
    id: "plan_10",
    credits: 10,
    priceMnt: 560000,
    label: "Өсөлтийн багц",
    description: "Сарын тогтмол сурталчилгаанд тэнцвэртэй сонголт.",
    recommended: true,
  },
  {
    id: "plan_15",
    credits: 15,
    priceMnt: 770000,
    label: "Контент үйлдвэр",
    description: "Олон эмч, олон чиглэлтэй эмнэлэгт.",
  },
  {
    id: "plan_20",
    credits: 20,
    priceMnt: 980000,
    label: "Эрчимтэй багц",
    description: "Агент болон том брэндийн өндөр эргэлттэй хэрэглээнд.",
  },
];

export const organAvatars: OrganAvatar[] = [
  {
    id: "heart",
    label: "Зүрх",
    tone: "Яаралтай анхааруулга",
    description: "Даралт, өвдөлт, зүрхний эрсдэлийг энгийнээр тайлбарлана.",
  },
  {
    id: "liver",
    label: "Элэг",
    tone: "Сэрэмжлүүлэх",
    description: "Өөхлөлт, вирус, шинжилгээний ач холбогдлыг тайлбарлана.",
  },
  {
    id: "kidney",
    label: "Бөөр",
    tone: "Тайван зөвлөмж",
    description: "Шээсний өөрчлөлт, хавдар, усны хэрэглээг онцолно.",
  },
  {
    id: "lung",
    label: "Уушги",
    tone: "Нөлөөлөлтэй hook",
    description: "Ханиалга, амьсгал давчдах шинжийг visual хэлбэрт оруулна.",
  },
  {
    id: "intestine",
    label: "Гэдэс",
    tone: "Боловсролын",
    description: "Гэдэсний хямрал, дурангийн хэрэглээг тайлбарлана.",
  },
  {
    id: "female_reproductive",
    label: "Эмэгтэйчүүд",
    tone: "Итгэл төрүүлэх",
    description: "Урьдчилан сэргийлэх үзлэг, дааврын тэнцвэрийг тайлбарлана.",
  },
];

export const doctors: Doctor[] = [
  {
    id: "doc-01",
    fullName: "Д. Мөнхтуяа",
    specialization: "Зүрх судасны эмч",
    brandName: "Сэргээн Клиник",
    initials: "ДМ",
    availability: "Видео нүүр царай бэлэн",
  },
  {
    id: "doc-02",
    fullName: "П. Тэмүүлэн",
    specialization: "Дотрын эмч",
    brandName: "Сэргээн Клиник",
    initials: "ПТ",
    availability: "Шинэ зураг шаардлагатай",
  },
  {
    id: "doc-03",
    fullName: "Б. Энхжин",
    specialization: "Эмэгтэйчүүдийн эмч",
    brandName: "Энэрэл эмнэлэг",
    initials: "БЭ",
    availability: "Видео нүүр царай бэлэн",
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Үлдсэн кредит",
    value: "8",
    helper: "1 дууссан видео = 1 кредит хасна",
  },
  {
    label: "Queue дээрх ажил",
    value: "6",
    helper: "OpenAI, KIE, merge шатуудаар зэрэг явж байна",
  },
  {
    label: "Энэ сарын дууссан reel",
    value: "12",
    helper: "Нийт 3 брэнд, 2 агент ашиглаж байна",
  },
  {
    label: "Дундаж turnaround",
    value: "11 мин",
    helper: "Сценыг давтан засварлах хурдан циклтэй",
  },
];

export const databaseSections: DatabaseSection[] = [
  {
    title: "Нэвтрэлт ба эрх",
    description:
      "Supabase Auth дээр суурилсан хэрэглэгч, брэнд, агентын эрхийн давхарга.",
    tables: [
      {
        name: "profiles",
        purpose: "Auth user бүрийн үндсэн profile, global role, идэвхийн төлөв.",
        columns: [
          { name: "user_id", type: "uuid pk", notes: "auth.users-тэй 1:1 холбоно." },
          { name: "role", type: "app_role", notes: "admin, brand, agent." },
          { name: "full_name", type: "text", notes: "UI дээр харагдах нэр." },
          { name: "phone", type: "text", notes: "Login ба холбоо барих утас." },
        ],
      },
      {
        name: "brands",
        purpose: "Эмнэлэг эсвэл компанийн бүх тохиргоо, assets, subscription context.",
        columns: [
          { name: "id", type: "uuid pk", notes: "Brand key." },
          { name: "name", type: "text", notes: "Брэндийн нэр." },
          { name: "website", type: "text", notes: "Сайт, landing URL." },
          { name: "logo_path", type: "text", notes: "Supabase Storage path." },
          { name: "frame_path", type: "text", notes: "PNG frame overlay." },
          { name: "outro_video_path", type: "text", notes: "Optional outro video." },
        ],
      },
      {
        name: "brand_memberships",
        purpose: "Хэрэглэгчийг брэндтэй холбож, brand эсвэл agent эрхийг өгнө.",
        columns: [
          { name: "brand_id", type: "uuid fk", notes: "brands.id." },
          { name: "user_id", type: "uuid fk", notes: "profiles.user_id." },
          { name: "role", type: "app_role", notes: "brand эсвэл agent." },
          { name: "is_default", type: "boolean", notes: "Login дараах default context." },
        ],
      },
    ],
  },
  {
    title: "Контентын эх үүсвэр",
    description:
      "Эмч, organ avatar, upload хийсэн asset, brand media-гийн master data.",
    tables: [
      {
        name: "doctors",
        purpose: "Админ удирдах эмчийн сан, зураг, мэргэжил, идэвх.",
        columns: [
          { name: "brand_id", type: "uuid fk", notes: "Тухайн эмчийн брэнд." },
          { name: "full_name", type: "text", notes: "Эмчийн нэр." },
          { name: "specialization", type: "text", notes: "Мэргэжлийн ангилал." },
          { name: "image_path", type: "text", notes: "Portrait зураг." },
          { name: "is_active", type: "boolean", notes: "Сонгогдох эсэх." },
        ],
      },
      {
        name: "organ_avatars",
        purpose: "Урьдчилан тодорхойлсон organ talk avatar-ууд.",
        columns: [
          { name: "slug", type: "text unique", notes: "heart, liver гэх мэт." },
          { name: "label", type: "text", notes: "UI label." },
          { name: "description", type: "text", notes: "Scene prompt-ийн суурь." },
          { name: "default_voice_key", type: "text", notes: "KIE доторх voice preset." },
        ],
      },
      {
        name: "brand_assets",
        purpose: "Brand түвшний давтагдах upload asset, version history.",
        columns: [
          { name: "brand_id", type: "uuid fk", notes: "Ownership." },
          { name: "asset_type", type: "text", notes: "logo, frame, outro, audio, image." },
          { name: "storage_path", type: "text", notes: "Bucket path." },
          { name: "mime_type", type: "text", notes: "Validation." },
        ],
      },
    ],
  },
  {
    title: "Видео үйлдвэрлэл",
    description:
      "Нэг video project-ийн бүх төлөв, scenes, jobs, credit deduction энд хадгалагдана.",
    tables: [
      {
        name: "video_projects",
        purpose: "Нэг reel-ийн master record. Hook, script, limit, final output metadata.",
        columns: [
          { name: "brand_id", type: "uuid fk", notes: "Төслийн эзэмшигч." },
          { name: "content_type", type: "content_type", notes: "B-roll эсвэл organ talk." },
          { name: "status", type: "project_status", notes: "draft-с completed хүртэл." },
          { name: "topic", type: "text", notes: "OpenAI-оос гарсан topic." },
          { name: "hook", type: "text", notes: "Эхний мөр hook." },
          { name: "script_text", type: "text", notes: "Final narration script." },
          { name: "duration_limit_seconds", type: "integer", notes: "45 эсвэл 40." },
          { name: "final_video_url", type: "text", notes: "Download хийх mp4." },
        ],
      },
      {
        name: "project_scenes",
        purpose: "Scene card бүрийн editable storyboard, prompt, preview, seed, clip URL.",
        columns: [
          { name: "project_id", type: "uuid fk", notes: "video_projects.id." },
          { name: "scene_index", type: "integer", notes: "Display дараалал." },
          { name: "visual_prompt", type: "text", notes: "Scene visual prompt." },
          { name: "animation_prompt", type: "text", notes: "Motion direction." },
          { name: "clip_url", type: "text", notes: "KIE generated scene clip." },
          { name: "seed_id", type: "text", notes: "Organ talk continuity." },
          { name: "status", type: "scene_status", notes: "editable, ready, failed." },
        ],
      },
      {
        name: "generation_jobs",
        purpose: "Async queue, retry, provider payload, failure reason-ийг мөр бүрээр бүртгэнэ.",
        columns: [
          { name: "project_id", type: "uuid fk", notes: "Төслөө заана." },
          { name: "scene_id", type: "uuid fk", notes: "Scene-level ажил бол заана." },
          { name: "provider", type: "text", notes: "openai, kie, system." },
          { name: "job_type", type: "job_type", notes: "script, scene_video, merge гэх мэт." },
          { name: "status", type: "job_status", notes: "queued, retrying, failed..." },
          { name: "provider_job_id", type: "text", notes: "KIE task id." },
          { name: "retry_count", type: "integer", notes: "Автомат retry тоо." },
        ],
      },
    ],
  },
  {
    title: "Биллинг ба аудит",
    description:
      "Subscription plan, credit үлдэгдэл, видео дуусах үед хийх хасалтын хөдөлгөөн.",
    tables: [
      {
        name: "subscription_plans",
        purpose: "Үнэ, кредитийн master plan.",
        columns: [
          { name: "plan_code", type: "text unique", notes: "plan_5, plan_10..." },
          { name: "credits", type: "integer", notes: "Сарын кредит." },
          { name: "price_mnt", type: "integer", notes: "Үнэ MNT." },
          { name: "is_active", type: "boolean", notes: "UI дээр харагдах эсэх." },
        ],
      },
      {
        name: "brand_subscriptions",
        purpose: "Brand-ийн идэвхтэй багц, cycle, үлдэгдэл кредит.",
        columns: [
          { name: "brand_id", type: "uuid fk", notes: "Owner." },
          { name: "plan_id", type: "uuid fk", notes: "subscription_plans.id." },
          { name: "remaining_credits", type: "integer", notes: "Realtime credit." },
          { name: "renews_at", type: "timestamptz", notes: "Cycle boundary." },
        ],
      },
      {
        name: "credit_ledger",
        purpose: "Кредит нэмэх, хасах, refund, audit trail.",
        columns: [
          { name: "brand_id", type: "uuid fk", notes: "Ownership." },
          { name: "project_id", type: "uuid fk", notes: "Видео дууссан бол холбоно." },
          { name: "delta", type: "integer", notes: "-1 completed video, +credits renewal." },
          { name: "reason", type: "text", notes: "completed_video, manual_adjustment..." },
        ],
      },
    ],
  },
];

export const apiGroups: ApiGroup[] = [
  {
    title: "Auth ба брэнд context",
    description: "Supabase Auth, membership resolution, active brand switching.",
    routes: [
      {
        method: "POST",
        path: "/api/auth/register",
        title: "Брэнд бүртгүүлэх",
        purpose: "Brand account, default membership, initial subscription record үүсгэнэ.",
        request: ["email", "password", "brandName", "phone"],
        response: ["user", "brand", "membership", "nextStep"],
      },
      {
        method: "POST",
        path: "/api/auth/login",
        title: "Нэвтрэх",
        purpose: "Supabase session авч, default brand context-ийг resolve хийнэ.",
        request: ["emailOrPhone", "password"],
        response: ["session", "activeBrand", "role"],
      },
    ],
  },
  {
    title: "Контент үйлдвэр",
    description: "OpenAI planning, KIE generation, storyboard edit, merge queue.",
    routes: [
      {
        method: "GET",
        path: "/api/projects",
        title: "Төслийн жагсаалт",
        purpose: "Brand-ийн draft, queued, completed төслүүдийг татна.",
        request: ["contentType?", "status?"],
        response: ["projects", "pagination"],
      },
      {
        method: "POST",
        path: "/api/projects",
        title: "Шинэ төсөл эхлүүлэх",
        purpose: "B-roll эсвэл organ talk draft record үүсгэнэ.",
        request: ["contentType", "doctorId? or organAvatarId", "audioPath?"],
        response: ["project", "creditCheck", "durationLimitSeconds"],
      },
      {
        method: "GET",
        path: "/api/projects/:projectId/storyboard",
        title: "Storyboard картууд",
        purpose: "Editable scene картуудын одоогийн төлөв.",
        request: ["projectId"],
        response: ["project", "scenes"],
      },
      {
        method: "PATCH",
        path: "/api/projects/:projectId/storyboard",
        title: "Scene засвар хадгалах",
        purpose: "Visual prompt, animation plan, narration-ийг update хийнэ.",
        request: ["sceneId", "visualPrompt", "animationPrompt", "narration"],
        response: ["scene", "savedAt"],
      },
      {
        method: "POST",
        path: "/api/projects/:projectId/generate",
        title: "Генерац эхлүүлэх",
        purpose: "Credit шалгаад OpenAI, KIE, merge job-уудыг queue-д оруулна.",
        request: ["projectId", "regenerateSceneId?"],
        response: ["accepted", "queuedJobs", "creditReservation"],
      },
    ],
  },
  {
    title: "Мастер өгөгдөл ба billing",
    description: "Doctors, brand settings, plans, credit ledger.",
    routes: [
      {
        method: "GET",
        path: "/api/doctors",
        title: "Эмчийн жагсаалт",
        purpose: "Admin болон brand UI-д doctor picker-д зориулсан жагсаалт.",
        request: ["brandId?"],
        response: ["doctors"],
      },
      {
        method: "PATCH",
        path: "/api/brand/settings",
        title: "Брэнд тохиргоо шинэчлэх",
        purpose: "Logo, frame, outro болон contact мэдээлэл хадгална.",
        request: ["name", "phone", "website", "facebook", "address"],
        response: ["brand", "assets"],
      },
      {
        method: "GET",
        path: "/api/plans",
        title: "Багцын жагсаалт",
        purpose: "Үнэ, кредит, current subscription summary.",
        request: [],
        response: ["plans", "currentSubscription", "creditLedger"],
      },
    ],
  },
];

export const recentProjects: ProjectSummary[] = [
  {
    id: "proj-broll-001",
    contentType: "b_roll_head_explainer",
    title: "Зүрх өвдөхөд анзаарах 3 дохио",
    status: "rendering",
    doctorName: "Д. Мөнхтуяа",
    creditsUsed: 1,
    durationLimitSeconds: 45,
    scenes: 7,
    updatedAt: "2026-04-03 19:20",
  },
  {
    id: "proj-organ-002",
    contentType: "organ_talk",
    title: "Элэг яагаад өвддөг вэ?",
    status: "planning",
    organAvatar: "Элэг",
    creditsUsed: 1,
    durationLimitSeconds: 40,
    scenes: 5,
    updatedAt: "2026-04-03 18:55",
  },
  {
    id: "proj-broll-003",
    contentType: "b_roll_head_explainer",
    title: "Үзлэгээ хойшлуулахын эрсдэл",
    status: "completed",
    doctorName: "Б. Энхжин",
    creditsUsed: 1,
    durationLimitSeconds: 45,
    scenes: 7,
    updatedAt: "2026-04-03 17:10",
  },
];

export const queueJobs: QueueJob[] = [
  {
    id: "job-001",
    projectId: "proj-broll-001",
    title: "Hook ба topic гаргах",
    jobType: "topic_hook",
    provider: "openai",
    status: "succeeded",
    retryCount: 0,
  },
  {
    id: "job-002",
    projectId: "proj-broll-001",
    title: "Scene 4 клип үүсгэх",
    jobType: "scene_video",
    provider: "kie",
    status: "processing",
    retryCount: 1,
    sceneId: "scene-b4",
  },
  {
    id: "job-003",
    projectId: "proj-organ-002",
    title: "Орган script үүсгэх",
    jobType: "script",
    provider: "openai",
    status: "queued",
    retryCount: 0,
  },
  {
    id: "job-004",
    projectId: "proj-broll-003",
    title: "Финал merge хийх",
    jobType: "merge",
    provider: "system",
    status: "succeeded",
    retryCount: 0,
  },
];

export const bRollFlow = [
  "Эмч сонгоно",
  "MP3 upload хийнэ",
  "OpenAI topic + hook гаргана",
  "7 scene storyboard засварлана",
  "Animation plan картуудаа шалгана",
  "KIE 5 секундын clip-үүд үүсгэнэ",
  "Frame болон outro-г optional нэмнэ",
  "Финал video-г merge хийгээд татна",
];

export const organTalkFlow = [
  "Organ avatar сонгоно",
  "40 секундээс ихгүй script гаргана",
  "5 scene storyboard үүсгэнэ",
  "Seed ID ашиглан үргэлжилсэн clip-үүд рүү render хийнэ",
  "Scene бүр preview хийнэ",
  "Merge хийгээд финал reel татна",
];

export const bRollScenes: SceneCard[] = [
  {
    id: "scene-b1",
    order: 1,
    title: "Hook opener",
    durationSeconds: 5,
    status: "ready",
    visualPrompt:
      "Эмч камер руу харж, turquoise студи гэрэлтэй, зүрх атгасан gesture.",
    animationPrompt: "Эхний 1 секунд zoom-in, дараа нь тогтвортой close shot.",
    narration: "Зүрх өвдөх үед бие тань ийм дохио өгдөг шүү.",
  },
  {
    id: "scene-b2",
    order: 2,
    title: "Шинж тэмдэг 1",
    durationSeconds: 5,
    status: "ready",
    visualPrompt: "Цээжний даралт, тайлбар overlay, hospital corridor b-roll.",
    animationPrompt: "Slow pan left to right, subtle text entrance.",
    narration: "Цээж базлах, амьсгаа давчдах бол анзаарах хэрэгтэй.",
  },
  {
    id: "scene-b3",
    order: 3,
    title: "Шинж тэмдэг 2",
    durationSeconds: 5,
    status: "rendering",
    visualPrompt: "Суулттай өвчтөн, гар ба мөр рүү дамжих өвдөлт visual.",
    animationPrompt: "Tilt transition, shoulder highlight pulse.",
    narration: "Өвдөлт мөр, гар луу дамжиж байвал үзлэгээ хойшлуулж болохгүй.",
  },
  {
    id: "scene-b4",
    order: 4,
    title: "Шинж тэмдэг 3",
    durationSeconds: 5,
    status: "rendering",
    visualPrompt: "Шат өгсөхөд ядрах, зүрхний хэм overlay.",
    animationPrompt: "Forward motion, cardio lines animate in.",
    narration: "Ядаргаа, зүрх дэлсэх нь энгийн стресс биш байж болно.",
  },
  {
    id: "scene-b5",
    order: 5,
    title: "Эрсдэлийн тайлбар",
    durationSeconds: 5,
    status: "editable",
    visualPrompt: "Зүрхний 3D дүрслэл, blocked artery warning style.",
    animationPrompt: "Rotate heart model, red warning flare at center.",
    narration: "Эдгээр дохио нь судасны нарийсалтай холбоотой байх эрсдэлтэй.",
  },
  {
    id: "scene-b6",
    order: 6,
    title: "Шийдэл",
    durationSeconds: 5,
    status: "editable",
    visualPrompt: "ECG үзлэг, эмч зөвлөж буй visual.",
    animationPrompt: "Cross-dissolve to consultation room.",
    narration: "Эрт үзлэг хийлгэвэл эмчилгээ илүү хялбар, зардал ч бага.",
  },
  {
    id: "scene-b7",
    order: 7,
    title: "CTA",
    durationSeconds: 5,
    status: "editable",
    visualPrompt: "Брэндийн logo, утас, цаг авах CTA card.",
    animationPrompt: "Logo reveal with turquoise glow.",
    narration: "Сэргээн клиникт урьдчилан сэргийлэх үзлэгээ өнөөдөр захиалаарай.",
  },
];

export const organScenes: SceneCard[] = [
  {
    id: "scene-o1",
    order: 1,
    title: "Hook intro",
    durationSeconds: 8,
    status: "ready",
    visualPrompt: "Элэг avatar камераас гарч ирэн шууд асуулт тавина.",
    animationPrompt: "Character pop-in, confident lip movement.",
    narration: "Би өдөр бүр ачаалалтай ажилладаг ч намайг та мартчихдаг.",
  },
  {
    id: "scene-o2",
    order: 2,
    title: "Эрсдэлийн шалтгаан",
    durationSeconds: 8,
    status: "ready",
    visualPrompt: "Fast food, sugar, stress icon-ууд элгэн дээр бууна.",
    animationPrompt: "Icons drop with elastic motion.",
    narration: "Өөх тос, архи, хэт ачаалал намайг чимээгүй гэмтээдэг.",
  },
  {
    id: "scene-o3",
    order: 3,
    title: "Шинж тэмдэг",
    durationSeconds: 8,
    status: "editable",
    visualPrompt: "Ядаргаа, дотор муухайрах, арьсны өөрчлөлт infographic.",
    animationPrompt: "Three symptom cards slide upward.",
    narration: "Ядаргаа, хоолны дуршил буурах, арьсны өнгө өөрчлөгдөхийг бүү тоо.",
  },
  {
    id: "scene-o4",
    order: 4,
    title: "Шийдэл",
    durationSeconds: 8,
    status: "editable",
    visualPrompt: "Лабораторийн шинжилгээ, хэт авиа, эмчийн зөвлөгөө.",
    animationPrompt: "Continuous camera move using same seed.",
    narration: "Элэгний үзүүлэлтээ шалгуулснаар та асуудлыг эрт илрүүлж чадна.",
  },
  {
    id: "scene-o5",
    order: 5,
    title: "CTA финал",
    durationSeconds: 8,
    status: "editable",
    visualPrompt: "Avatar тухайн эмнэлгийн CTA-г хэлж дуусгана.",
    animationPrompt: "Seed continuity, slow push-in at close.",
    narration: "Өнөөдөр цаг аваад элгээ тайван байлгаарай.",
  },
];

export const uiPages = [
  {
    title: "Нэвтрэлт",
    path: "/auth",
    purpose: "Нэвтрэх, бүртгүүлэх, brand context, role тайлбар.",
  },
  {
    title: "Хяналтын самбар",
    path: "/dashboard",
    purpose: "Кредит, queue, recent projects, хурдан action.",
  },
  {
    title: "B-roll студи",
    path: "/dashboard/broll",
    purpose: "Doctor + MP3 суурьтай reel builder.",
  },
  {
    title: "Organ студи",
    path: "/dashboard/organ",
    purpose: "Avatar, seed continuity, 5 scene builder.",
  },
  {
    title: "Эмчийн сан",
    path: "/dashboard/doctors",
    purpose: "Admin doctor CRUD болон specialization management.",
  },
  {
    title: "Брэнд тохиргоо",
    path: "/dashboard/settings",
    purpose: "Logo, frame, outro, холбоо барих мэдээлэл.",
  },
  {
    title: "Төслүүд",
    path: "/dashboard/projects",
    purpose: "B-roll, Organ talk төслүүдийн жагсаалт ба workflow detail.",
  },
];

export const brandSettings = {
  name: "Сэргээн Клиник",
  phone: "7707-1100",
  website: "https://sergeen.mn",
  facebook: "facebook.com/sergeenclinic",
  address: "Хан-Уул дүүрэг, 15-р хороо, Улаанбаатар",
  logoStatus: "PNG logo бэлэн",
  frameStatus: "1080x1920 transparent frame бэлэн",
  outroStatus: "8 секундын outro video upload хийгдсэн",
};

export function formatMnt(value: number) {
  return `${new Intl.NumberFormat("mn-MN").format(value)}₮`;
}

export function contentTypeLabel(type: ContentType) {
  return type === "b_roll_head_explainer"
    ? "B-roll + эмч тайлбар"
    : "Organ тайлбар";
}

export function providerLabel(provider: string) {
  switch (provider) {
    case "openai":
      return "OpenAI";
    case "kie":
      return "KIE.ai";
    case "system":
      return "Систем";
    default:
      return provider;
  }
}

export function jobTypeLabel(jobType: string) {
  switch (jobType) {
    case "topic_hook":
      return "Сэдэв + hook";
    case "storyboard":
      return "Scene storyboard";
    case "animation_plan":
      return "Хөдөлгөөний төлөвлөгөө";
    case "script":
      return "Script";
    case "scene_video":
      return "Scene видео";
    case "scene_voice":
      return "Scene voice";
    case "merge":
      return "Финал merge";
    default:
      return jobType;
  }
}

export function findProject(projectId: string) {
  return recentProjects.find((project) => project.id === projectId);
}

export function getScenesForProject(projectId: string) {
  const project = findProject(projectId);

  if (!project) {
    return [];
  }

  return project.contentType === "b_roll_head_explainer" ? bRollScenes : organScenes;
}

export function getJob(jobId: string) {
  return queueJobs.find((job) => job.id === jobId);
}
