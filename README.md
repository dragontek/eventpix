# EventPix

Collect every photo from your event—instantly. **EventPix** is an open‑source, privacy‑first photo sharing platform featuring realtime feeds, QR joining, desktop & mobile camera capture, guest avatars, and host moderation. Built on **Appwrite** with **Next.js 16 (React 19, TypeScript, Tailwind CSS v4)**.

---

## Key Features

- ⚡️ **Instant Join:** QR code scanning or 6-letter join codes (e.g. `SLAUGHTER`).
- 🔴 **Realtime Photo Stream:** Instant live updates powered by Appwrite Realtime.
- 📺 **Fullscreen Live Slideshow:** Auto-advancing realtime slideshow for event displays (`/event/[id]/slideshow`).
- 📸 **Universal Camera Capture:**
  - Mobile PWAs: Native camera capture via HTML5 `<input capture="environment">`.
  - Desktop & Laptops: Built-in live **Camera Modal** (`CameraModal.tsx`) with video preview, mirror flipping, and multi-camera selection.
- 🖼️ **Avatar & Guest Resolution:** Automatic owner avatar resolution, guest badges, and fallback initials.
- 🛡️ **Host Moderation Queue:** Global moderation dashboard (`/moderation`) to approve or reject pending uploads across events.
- 📊 **Host Analytics Dashboard:** Platform stats (`/dashboard`) displaying total events, photos, users, and pending reviews.
- 📱 **Progressive Web App (PWA):** Built-in web app manifest (`src/app/manifest.ts`), service worker caching (`public/sw.js`), and install prompts.
- 📱 **Mobile Native Ready:** Decoupled Appwrite data model (`src/lib/db/`) ready for future **Flutter** or **React Native** mobile apps.

---

## App Router Structure

| Route | Description |
| :--- | :--- |
| `/` | Landing page, join code input, event creation modal, and user event history. |
| `/event/[id]` | Event album feed, realtime photo updates, photo upload, and host settings. |
| `/event/[id]/slideshow` | Fullscreen, live-updating slideshow for venue displays. |
| `/join/[code]` | Direct event join page via code or shareable URL. |
| `/dashboard` | Host analytics overview (total events, photos, users, pending moderation). |
| `/moderation` | Global photo moderation queue for approving/rejecting guest uploads. |
| `/profile` | User profile overview and avatar management. |
| `/search` | Event search and discovery. |

---

## Architecture & Data Layer

EventPix uses a clean, unified single-package architecture:

```
.
├── src/
│   ├── app/                 # Next.js 16 App Router (pages & API routes)
│   ├── components/          # UI components (PhotoCard, UserProfile, CameraModal, etc.)
│   └── lib/
│       └── db/              # Appwrite DataProvider & TypeScript type definitions
│           ├── index.ts     # Unified exports and helper bindings
│           ├── types.ts     # Data models (User, Event, Photo, Invitation, Stats)
│           └── providers/
│               └── appwrite.ts # Appwrite Web SDK integration
├── scripts/
│   └── setup-appwrite-schema.mjs # Database, collection, and storage initializer
├── public/                  # Static assets & PWA service worker (sw.js)
├── Dockerfile               # Production container definition
├── .env.example             # Environment variable template
└── README.md
```

---

## Quickstart (Local Development)

### 1) Prerequisites
- **Node.js** 20+ and **pnpm** (or `npm`)
- An active **Appwrite** instance (self-hosted or Appwrite Cloud)

### 2) Database Setup
1. Create an Appwrite project and note the **Project ID**.
2. Create an **API Key** with full scope (databases, storage, users, auth).
3. Initialize collections and storage buckets:
   ```bash
   pnpm exec node scripts/setup-appwrite-schema.mjs
   ```

### 3) Environment Variables
Create `.env` and `.env.local` based on [`.env.example`](.env.example):
```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://dragontek.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6a81ca9700213356c019
NEXT_PUBLIC_APPWRITE_DATABASE_ID=eventpix
NEXT_PUBLIC_APPWRITE_BUCKET_ID=photos
NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID=avatars
```

### 4) Run Dev Server
```bash
pnpm install
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Common Commands

- `pnpm dev`: Start local Next.js development server.
- `pnpm run build`: Compile Next.js production build (`.next/standalone`).
- `pnpm run typecheck`: Run TypeScript type checking (`tsc --noEmit`).
- `pnpm run lint`: Run ESLint checks (`eslint .`).

---

## License
MIT. See **LICENSE**.
