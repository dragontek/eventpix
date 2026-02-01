
# EventPix

Collect every photo from your event—instantly. **EventPix** is an open‑source, privacy‑first photo sharing platform with realtime feeds, QR joining, simple social sign‑in (Google/Apple), and optional moderation. Built on **PocketBase** with **React + TypeScript** frontends.

- **Website / Landing (Next.js):** `apps/web` (suggested)
- **Admin / Planner Console (React):** `apps/admin` (suggested)
- **Backend (PocketBase + migrations):** `backend/`
- **Docs:** `docs/`

> Full Product Requirements: see **[docs/EventPix_PRD_v0.2.md](docs/EventPix_PRD_v0.2.md)**

---

## Features
- ⚡️ **QR join** or **one‑tap social login** (Google / Sign in with Apple)
- 🔴 **Realtime** event feed & slideshow (PocketBase subscriptions)
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
- **PocketBase** (download the binary for your OS)
- **Git** and **Python** (optional for tooling)

### 1) Backend – PocketBase
1. Create folders:
   ```bash
   mkdir -p backend/pb_data backend/pb_migrations
   ```
2. Place your PocketBase binary at `backend/pocketbase` (or in PATH).
3. (If migrations are provided) copy migration files into `backend/pb_migrations/`.
4. Run migrations and start the server:
   ```bash
   cd backend
   ./pocketbase migrate
   ./pocketbase serve --http=0.0.0.0:8090
   ```
5. Open **Admin UI** at `http://localhost:8090/_/` and create your admin account.

### 2) Frontend – Web (Next.js or React Vite)
1. Install deps and start dev server (example for Next.js in `apps/web`):
   ```bash
   cd apps/web
   pnpm install   # or npm install
   pnpm dev       # or npm run dev
   ```
2. Configure env (see [`.env.example`](.env.example)):
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8090
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
Create a `.env.local` (frontend) and `.env` (backend worker if any). See **[.env.example](.env.example)**

**Frontend (common):**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8090
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
├─ backend/
│  ├─ pb_data/        # PocketBase data (gitignored)
│  ├─ pb_migrations/  # PocketBase migrations
│  └─ pocketbase      # PocketBase binary (local dev)
├─ docs/
│  └─ EventPix_PRD_v0.2.md
├─ .env.example
└─ README.md
```

---

## Self‑Host Notes (Production)
- Place PocketBase behind a reverse proxy (TLS); configure backups for `pb_data/`.
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

