# 🏥 Postly.mn — Agentic Healthcare Video System

## 🎯 Vision

Эмнэлгүүдэд зориулсан **AI маркетингийн систем**
👉 Doctor зураг + audio → 45 сек reel (lip sync + B-roll + subtitle)

---

## Development Setup

1. Install dependencies

```bash
npm install
```

2. Create the local environment file

```bash
cp .env.example .env.local
```

3. Fill these values in `.env.local`

```bash
OPENAI_API_KEY=
HEYGEN_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

4. Start the app

```bash
npm run dev
```

5. Check starter endpoints

* `/api/health`
* `/api/pipeline`

## 🚀 MVP Goal

1 товч → бэлэн видео

* Input: Doctor image + audio
* Output: Lip-sync video (HeyGen)
* (Phase 2: B-roll + scene automation)

---

## 🧠 Core Flow

```
Upload → Transcribe → Analyze → Scene Plan → (Preview Images) → Approve → Generate Video → Deliver
```

---

## 🧩 Features (MVP → V1)

### MVP (Week 1–2)

* [ ] Image upload (doctor)
* [ ] Audio upload (MP3)
* [ ] Whisper → text
* [ ] GPT → script analysis
* [ ] HeyGen → lip sync video
* [ ] Video URL output

### V1 (Week 3–4)

* [ ] Scene planner (3–4 scenes)
* [ ] Image preview (per scene)
* [ ] User approval UI
* [ ] Subtitle overlay
* [ ] Basic B-roll (stock)

### V2 (Later)

* [ ] Full B-roll automation
* [ ] Multi-doctor avatar system
* [ ] Content calendar
* [ ] Auto publishing (FB/IG)

---

## ⚙️ Tech Stack

### Frontend

* Next.js
* TailwindCSS

### Backend

* Node.js (API routes) or FastAPI

### AI

* Speech → text: OpenAI Whisper
* Script analysis: OpenAI GPT
* Lip sync: HeyGen API

### Video

* FFmpeg (compose)
* (Optional) Remotion

### Storage

* Supabase (files + DB)

---

## 🔑 Environment Variables

```
OPENAI_API_KEY=
HEYGEN_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

---

## 🔄 Pipeline (Detailed)

### 1. Upload

* doctor.jpg
* audio.mp3

---

### 2. Transcription

```ts
Whisper → "Зүрх өвдөж байна уу..."
```

---

### 3. Script Analysis (GPT)

Output:

```
Topic: Heart
Tone: Warning
Structure: 3 symptoms + CTA
```

---

### 4. Scene Planner

```
Scene 1: Doctor intro
Scene 2: Heart animation
Scene 3: Risk warning
Scene 4: CTA
```

---

### 5. (V1) Image Preview

Per scene:

* Generate preview image
* User approve / regenerate

---

### 6. Lip Sync (HeyGen)

POST `/v1/video.generate`

```json
{
  "video_inputs": [{
    "character": {
      "type": "avatar",
      "avatar_id": "doctor_avatar_id"
    },
    "voice": {
      "type": "audio",
      "audio_url": "https://audio.mp3"
    }
  }]
}
```

---

### 7. Poll Status

GET `/v1/video.status`

→ returns `video_url`

---

### 8. Compose (V1+)

* Add subtitle
* Overlay B-roll
* Export final mp4

---

## 💰 Cost Model

| Item            | Cost    |
| --------------- | ------- |
| HeyGen (45 sec) | ~$0.5–1 |
| LLM             | ~$0.1   |
| Infra           | ~$0.2   |

👉 Total: **~$1–1.5 / video**

---

## 💵 Pricing Strategy

* Per video: $15–25
* Subscription: $300+/month

👉 Focus: **patients generated, not videos**

---

## 🧠 Architecture (Agents)

* Brand Agent → business ойлгоно
* Idea Agent → hooks
* Scene Agent → visual plan
* Critic Agent → validate
* Video Agent → generate

---

## ⚠️ Known Challenges

* Lip sync sync issue → fix with stable audio
* Avatar quality → clean doctor image
* Render delay → async queue system

---

## 🛠️ Dev Plan

### Week 1

* Upload + Whisper + GPT

### Week 2

* HeyGen integration

### Week 3

* Scene + preview UI

### Week 4

* B-roll + subtitle

---

## 🔥 Differentiation

❌ AI post generator
✅ AI marketing system for hospitals

* Mongolian-native
* Real doctor face + voice
* Visual approval system
* Lead generation focus

---

## 📌 Next Steps

* [ ] Build MVP
* [ ] Test with 1 clinic
* [ ] Generate 20 leads
* [ ] Scale

---

## 💥 Final

This is not a content tool.
This is a **Healthcare Growth Engine**.

---
