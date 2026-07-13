# Cosmic Portfolio — website + CMS + analytics

A personal portfolio with a **black / deep-red cosmic theme**, an **animated hero scene** (planet, lens-flare star, orbiting swirl rings, drifting red nebula), a **built-in admin panel (CMS)** and **first-party analytics** — all in one Next.js app that deploys on Vercel.

## Features

- **Public site** — animated hero (Canvas 2D, 60fps, `prefers-reduced-motion` static fallback), about/bio with skills, project grid with detailed case pages, contact form, scroll reveals and red-glow hover effects, fully responsive.
- **Admin panel at `/admin`** — email + password login (bcrypt-hashed, JWT session in an httpOnly cookie, middleware-protected routes):
  - Projects: create, edit, delete, **reorder**, publish/unpublish; title, date, summary, description, problems, solution, outcomes, note, cover image, gallery, tags, external links.
  - Settings: name, title, tagline, bio, profile photo, skills, contact email, social links, SEO description.
  - Media library: upload images (Vercel Blob) or paste any image URL.
  - Messages: contact-form submissions land here.
- **Analytics dashboard** — page views (per page + site-wide), clicks on project cards / contact buttons / external links, daily / weekly / monthly time-series charts. Events are stored in **your own Postgres database**: no third-party service, no cookies, no IPs, no personal data.

## Tech stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS · Drizzle ORM · PostgreSQL (Neon / Supabase / Vercel Postgres) · `jose` + `bcryptjs` auth · Vercel Blob (uploads) · Recharts (dashboard).

## Project structure

```
├── drizzle/                     # generated SQL migrations
├── public/images/               # hero fallback + seeded project covers
├── scripts/
│   ├── migrate.ts               # apply migrations (alternative to db:push)
│   └── seed.ts                  # admin user + settings + 6 projects
├── src/
│   ├── app/
│   │   ├── (site)/              # public pages (home, /projects/[slug])
│   │   ├── admin/
│   │   │   ├── login/           # sign-in page (public)
│   │   │   └── (panel)/         # dashboard, projects, messages, media, settings
│   │   └── api/                 # auth, projects, settings, upload, images,
│   │                            # messages, contact, track, analytics
│   ├── components/              # CosmicHero, ProjectCard, admin forms…
│   ├── db/                      # drizzle schema + client
│   ├── lib/                     # auth, data helpers, analytics client
│   └── middleware.ts            # protects /admin/*
└── .env.example
```

## 1 · Local setup

Requirements: **Node.js ≥ 20** and a PostgreSQL database (a free [Neon](https://neon.tech) or [Supabase](https://supabase.com) project is perfect; local Postgres also works).

```bash
npm install
cp .env.example .env        # then fill in the values (see below)
npm run db:push             # create the tables
npm run db:seed             # admin user + placeholder content + 6 projects
npm run dev                 # http://localhost:3000
```

Sign in at **http://localhost:3000/admin/login** with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres connection string. Use the **pooled** string on serverless (Neon "pooled", Supabase "Session pooler"). |
| `AUTH_SECRET` | ✅ | Signs admin session tokens. Generate: `openssl rand -base64 32` |
| `ADMIN_EMAIL` | ✅ (seed) | Admin login email — read by `npm run db:seed`. |
| `ADMIN_PASSWORD` | ✅ (seed) | Admin password — hashed by the seed, never stored in plain text. |
| `BLOB_READ_WRITE_TOKEN` | optional | Enables file uploads (created automatically when you add a Vercel Blob store). Without it, paste image URLs instead. |

**Changing the admin password later:** set a new `ADMIN_PASSWORD` and run `npm run db:seed` again — it updates the hash in place and never overwrites content you've edited in the CMS.

## 2 · Using the admin panel

Everything the site shows is editable without touching code:

- **Settings** → your name, title, tagline, bio (blank line = new paragraph), profile photo, skills, contact email, social links (`Label | https://url`, one per line).
- **Projects** → the six seeded projects are normal CMS entries: edit, reorder with the arrows, unpublish, or delete them. Lists (problems/outcomes) are one item per line; links use `Label | https://url`.
- **Media** → upload an image, click **Copy URL**, paste it into any image field. If uploads are not configured yet, external image URLs work everywhere.
- **Dashboard** → analytics (see below). **Messages** → contact-form submissions.

## 3 · Analytics — what is tracked

| Event | When | Stored as |
| --- | --- | --- |
| `view` | every public page load / navigation | path + timestamp |
| `click` | project cards, hero CTAs, contact buttons, social links, project external links, form submit | element id + path + timestamp |

Only those fields are stored — no cookies, no IP addresses, no user agents. Admin pages are never tracked. Events post to `/api/track` (uses `sendBeacon` so clicks on outbound links are not lost) and the dashboard aggregates them with range (7d/30d/90d/1y/all) and granularity (daily/weekly/monthly) controls.

## 4 · Deploy: GitHub → Vercel

1. **Push to GitHub**
   ```bash
   git init && git add -A && git commit -m "Initial commit"
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. **Create the database** (pick one):
   - *Neon via Vercel:* Vercel Dashboard → your project → **Storage → Create Database → Neon (Postgres)** — `DATABASE_URL` is added automatically.
   - *Supabase:* create a project → **Connect** → copy the **Session pooler** connection string → you'll add it as `DATABASE_URL` in step 4.
3. **Import the repo in Vercel** — [vercel.com/new](https://vercel.com/new) → select the repo → framework auto-detects Next.js. Don't deploy yet if you still need env vars.
4. **Add environment variables** (Project → Settings → Environment Variables): `DATABASE_URL` (if not auto-added), `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
5. **Enable uploads (optional):** Project → **Storage → Create → Blob** — this injects `BLOB_READ_WRITE_TOKEN` automatically.
6. **Create tables + seed** — run once from your machine against the production DB:
   ```bash
   # temporarily put the PRODUCTION DATABASE_URL (+ your admin creds) in .env
   npm run db:push
   npm run db:seed
   ```
   (Or use `npm run db:migrate` to apply the tracked SQL in `drizzle/` instead of `db:push`.)
7. **Deploy** — Vercel builds on every push to `main`. Your site is live at `https://<project>.vercel.app`, admin at `/admin`.

## 5 · Custom domain via TheHost

1. In **Vercel → Project → Settings → Domains**, add `yourdomain.com` (and `www.yourdomain.com`). Vercel shows the exact records it expects.
2. In your **TheHost** control panel, open DNS management for the domain and add:
   - `A` record — host `@` → `76.76.21.21`
   - `CNAME` record — host `www` → `cname.vercel-dns.com`
   *(Alternative: switch the domain's nameservers to `ns1.vercel-dns.com` / `ns2.vercel-dns.com` and manage DNS inside Vercel.)*
3. Wait for propagation (minutes → a few hours). Vercel verifies the records and issues SSL automatically.

## 6 · Extending

- **New project field** → add the column in `src/db/schema.ts`, run `npm run db:generate` + `db:push`, whitelist it in `src/lib/project-payload.ts`, add the input in `src/components/admin/ProjectForm.tsx`, render it in `src/app/(site)/projects/[slug]/page.tsx`.
- **New tracked element** → call `trackClick("your:element-id")` from `@/lib/track` — it appears in the dashboard automatically.
- **Hero tuning** → all scene parameters (ring count, colors, speeds, nebula placement) live at the top of `src/components/CosmicHero.tsx`.

## Security notes

- Sessions are signed JWTs in an `httpOnly`, `SameSite=Lax`, `Secure` cookie; every `/admin` route is checked in middleware and every mutating API re-checks the session server-side.
- Passwords are bcrypt-hashed (cost 12). Login responses don't reveal whether the email exists.
- The contact form has a honeypot field and length limits; the tracking endpoint validates and caps every field and never stores personal data.
- Keep `AUTH_SECRET` long and random, and never commit `.env`.
