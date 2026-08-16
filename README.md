
# EventPix

Collect every photo from your event—instantly. **EventPix** is an open‑source, privacy‑first photo sharing platform with realtime feeds, QR joining, simple social sign‑in (Google/Apple), and optional moderation. Built on **Appwrite** with **React + TypeScript** frontends.

- **Website / Landing (Next.js):** `apps/web` (suggested)
- **Admin / Planner Console (React):** `apps/admin` (suggested)
- **Docs:** `docs/`

> Full Product Requirements: see **[docs/EventPix_PRD_v0.2.md](docs/EventPix_PRD_v0.2.md)**

---

## Features
- ⚡️ **QR join** or **one‑tap social login** (Google / Sign in with Apple)
- 🔴 **Realtime** event feed & slideshow (Appwrite realtime)
- 🛡️ **Moderation** per event (optional) + **AI quarantine** (optional)
- 🎨 **Branding** (logo, theme, overlays/frames)
- 🗂️ **Session folders**, search & duplicate detection
- 📦 **Exports** (ZIP + CSV manifest) & recap page
- 👤 **Roles:** host, staff, guest, **photographer**; **view‑only** mode
- ☁️ **Self‑host** or use hosted SaaS later

---

## Quickstart (Local Dev)

### 0) Prerequisites
- **Node.js** 18+ and **pnpm** or **npm**
- **Appwrite** (self‑hosted, or use Appwrite Cloud) with a project created
- **Git** and **Python** (optional for tooling)

### 1) Backend – Appwrite
1. Set up a self‑hosted Appwrite instance (or an Appwrite Cloud project).
2. Create the project and note the **project ID**.
3. Create an **API key** with full access to databases, storage, users, and auth.
4. Create the database, collections, and buckets:
   ```bash
   pnpm exec node scripts/setup-appwrite-schema.mjs
   ```
5. Configure auth providers (Google/Apple) in the Appwrite Console.

### 2) Frontend – Web (Next.js or React Vite)
1. Install deps and start dev server (example for Next.js in `apps/web`):
   ```bash
   cd apps/web
   pnpm install   # or npm install
   pnpm dev       # or npm run dev
   ```
2. Configure env (see [`.env.example`](.env.example)):
   ```bash
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://dragontek.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   ```
3. Visit the app at the printed local URL. Create an event in Admin UI, scan the QR, and upload a test photo.

### 3) Admin / Planner Console (optional separate app)
If using a separate console in `apps/admin`:
```bash
cd apps/admin
pnpm install
pnpm dev
```

---

## Environment Variables
Create a `.env` (server-side scripts) and `.env.local` (frontends). See **[.env.example](.env.example)**

**Frontend (common):**
```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://dragontek.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APP_NAME=EventPix
```

**OAuth (if enabling social login):**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Sign in with Apple (JWT based)
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

> Keep scopes minimal: basic profile (name), avatar, and email.

---

## Project Structure (suggested)
```
.
├─ apps/
│  ├─ web/            # Guest app (Next.js or Vite React)
│  └─ admin/          # Planner console (React)
├─ libs/
│  └─ db/             # Shared database/provider layer (Appwrite)
├─ scripts/
│  ├─ setup-appwrite-schema.mjs  # Create DB/collections/buckets
│  └─ appwrite-build-web.sh      # Standalone build for Appwrite Sites
├─ docs/
│  └─ EventPix_PRD_v0.2.md
├─ .env.example
└─ README.md
```

---

## Self‑Host Notes (Production)
- Self‑host Appwrite behind a reverse proxy (TLS); configure backups.
- Enable **signed URLs** for original downloads and set **retention** policies per event.
- Use a CDN for thumbnails if hosting the SaaS version.

---

## Contributing
- Use **Conventional Commits** and open PRs against `main`.
- Run lint/tests before pushing. Provide screenshots/GIFs for UI changes.
- See **CODE_OF_CONDUCT.md** and **CONTRIBUTING.md** (to be added).

---

## License
MIT (core). See **LICENSE**.

---

## Security
Please report vulnerabilities privately to **security@eventpix.app** (placeholder). We will coordinate disclosure.

---

## Links
- **Product Requirements:** [docs/EventPix_PRD_v0.2.md](docs/EventPix_PRD_v0.2.md)
- **Issue Tracker / Roadmap:** GitHub Projects (to be added)

