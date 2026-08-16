# EventPix

Collect every photo from your event—instantly. **EventPix** is an open‑source, privacy‑first photo sharing platform with realtime feeds, QR joining, simple social sign‑in (Google/Apple), and optional moderation. Built on **Appwrite** with **Next.js + TypeScript**.

- **Web Application & Host Dashboard:** Next.js 16 (`src/`)
- **Appwrite Data Layer:** `src/lib/db/`
- **Docs:** `docs/`

> Full Product Requirements: see **[docs/EventPix_PRD_v0.2.md](docs/EventPix_PRD_v0.2.md)**

---

## Features
- ⚡️ **QR join** or **one‑tap social login** (Google / Sign in with Apple)
- 🔴 **Realtime** event feed & slideshow (Appwrite realtime)
- 🛡️ **Moderation** per event + global moderation queue (`/moderation`)
- 📊 **Host Dashboard** stats (`/dashboard`)
- 🎨 **Branding** (logo, theme, overlays/frames)
- 🗂️ **Session folders**, search & duplicate detection
- 📦 **Exports** (ZIP + CSV manifest) & recap page
- 👤 **Roles:** host, staff, guest, **photographer**; **view‑only** mode
- ☁️ **Self‑host** or use hosted SaaS

---

## Quickstart (Local Dev)

### 0) Prerequisites
- **Node.js** 18+ and **pnpm** or **npm**
- **Appwrite** (self‑hosted, or Appwrite Cloud) with a project created
- **Git**

### 1) Backend – Appwrite
1. Set up a self‑hosted Appwrite instance (or Appwrite Cloud project).
2. Create the project and note the **project ID**.
3. Create an **API key** with full access.
4. Run schema setup:
   ```bash
   pnpm exec node scripts/setup-appwrite-schema.mjs
   ```

### 2) Frontend – Next.js Web App
1. Install dependencies & start dev server:
   ```bash
   pnpm install
   pnpm dev
   ```
2. Configure env (see [`.env.example`](.env.example)):
   ```bash
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://dragontek.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=6a81ca9700213356c019
   ```

---

## Project Structure
```
.
├─ src/
│  ├─ app/            # Next.js App Router (Guest pages, Host Dashboard, Moderation)
│  ├─ components/     # React UI components (PhotoCard, UserProfile, CameraModal)
│  └─ lib/
│     └─ db/          # Appwrite DataProvider & TypeScript models
├─ scripts/
│  ├─ setup-appwrite-schema.mjs  # Create DB/collections/buckets
│  └─ appwrite-build-web.sh      # Build script for Appwrite Sites / Docker
├─ docs/
├─ .env.example
├─ Dockerfile
└─ README.md
```

---

## License
MIT. See **LICENSE**.
