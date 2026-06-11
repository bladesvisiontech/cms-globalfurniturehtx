# CMS Template — Blades Vision Tech

Generic content management panel. Clone once per client, configure with environment variables, deploy to Vercel.

---

## Setup for a new client

### 1. Clone and rename
```bash
git clone https://github.com/bladesvisiontech/cms-template [client-name]-cms
cd [client-name]-cms
```

### 2. Generate a password hash
```bash
node -e "const b = require('bcryptjs'); b.hash('YOUR_PASSWORD', 10).then(console.log)"
```

### 3. Create `.env.local`
```env
JWT_SECRET=             # openssl rand -base64 32
ADMIN_EMAIL=            # client login email
ADMIN_PASSWORD_HASH=    # output from step 2
GITHUB_TOKEN=           # Personal Access Token with 'repo' scope
GITHUB_OWNER=           # GitHub username or org
GITHUB_REPO=            # client website repo name
GITHUB_BRANCH=main
CONTENT_BASE_PATH=src/data
```

### 4. Deploy to Vercel
```bash
vercel --prod
vercel env add JWT_SECRET production
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASSWORD_HASH production
vercel env add GITHUB_TOKEN production
vercel env add GITHUB_OWNER production
vercel env add GITHUB_REPO production
vercel env add GITHUB_BRANCH production
vercel env add CONTENT_BASE_PATH production
```

### 5. Share with client
Give the client the Vercel URL and their email + password.  
They log in → edit content → click "Save & Publish" → site updates in ~60 seconds.

---

## How it works

```
Client edits in /dashboard → POST /api/content
→ GitHub API commits JSON to client repo
→ Vercel detects push → rebuilds client site
→ Live in ~30–60 seconds
```

---

## Adding a new section to the client site

1. Create `src/data/[section].json` in the client website repo
2. Import it in the relevant page component
3. Add a new page in `app/(protected)/[section]/page.tsx` in this CMS
4. Add the route to `Sidebar.tsx`

---

## Project structure

```
app/
  login/            — public login page
  (protected)/
    layout.tsx      — sidebar + main layout
    dashboard/      — overview
    menu/           — menu editor
    pricing/        — pricing editor
    gallery/        — photo gallery
    services/       — services editor
    site/           — contact, hours, social
  api/
    auth/           — POST login / DELETE logout
    content/        — GET/POST JSON files via GitHub
    upload/         — POST image upload to GitHub
lib/
  auth.ts           — JWT sign/verify + session helper
  github.ts         — Octokit read/write/upload
components/
  Sidebar.tsx
  SaveButton.tsx
  Toast.tsx
  PageHeader.tsx
middleware.ts       — route protection
```
