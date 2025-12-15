# Khmer Statuary Project – Artifact Upload & Search

Modern Next.js app for collecting, enriching, reviewing, and searching Khmer statuary records. The UI is built with Material UI and Clerk authentication; Supabase powers Postgres, storage, and RPC functions; optional LLM enrichment comes from OpenRouter.

## Background
As part of her master’s thesis at Boston University, archaeology student Hallie Baker is building a machine learning system to identify looted Cambodian artifacts held in museum collections. Cambodia endured extensive cultural looting from the 1960s civil war through the early 2000s, often to satisfy Western museum and collector demand. The Cambodian government is now pursuing repatriations from institutions such as the Metropolitan Museum of Art.

Today, researchers manually search thousands of archival photos to match statues on display—a slow process that can delay red flags about legality and repatriation claims. Hallie’s project automates this work with a searchable image database (currently 600+ images and 200+ verified matches) and a CNN model, ultimately targeting a public site where users can upload an image and get potential matches. The thesis details the need for this infrastructure, the technical steps to build it, and planned expansion to Indian and Nepali artifacts. The project is open-source and aims to advance global heritage preservation.

This application implements the upload, metadata capture (manual or LLM-assisted), admin review, and search workflows that underpin Hallie’s database and future public-facing experience.

## Architecture At A Glance
- **Next.js App Router (app/)** with client-heavy pages: landing (`/`), upload (`/upload`), search (`/search`), and admin review (`/admin/*`).
- **Auth:** Clerk protects everything except the landing and auth routes; `NEXT_PUBLIC_BYPASS_CLERK=true` can disable auth for local debugging. Admin pages require a Clerk session claim `metadata.role === "admin"` (see `middleware.ts`).
- **Uploads:** `/upload` sends images to Supabase Storage `pending_images` via `/api/upload`, logs the internal reference number, and enforces a global in-memory rate limit (`lib/rate-limit/uploadRateLimit.ts`).
- **Metadata pipeline:** `/api/process-metadata` writes uploader-provided descriptions plus either manual metadata or LLM-parsed metadata (OpenRouter) into `temp_artifact_metadata` using the RPC `insert_llm_artifact_metadata_with_timestamp`.
- **Admin review:** `/admin/admin-review` consumes `/api/admin/pending-images`; `/api/admin/approve` promotes a pending upload into normalized tables (`statues`, `images`, lookup tables), moves the asset from `pending_images` to `approved_images`, and preserves the internal reference number. `/api/admin/deny` discards bad uploads.
- **Search:** `/api/statue-search` builds a Supabase query against statues, subjects, attributes, locations, auction history, and images; image URLs are signed from the `spark` bucket before returning to the UI. Download links stream from storage via `/api/download/[imageId]`.

## Tech Stack
- **Frontend:** Next.js 15 (App Router) + React 19, TypeScript, Material UI 7 with Emotion (`app/theme.ts`, `AppThemeProvider`), `@mui/material-nextjs` for server-side styling, lucide/MUI icon sets.
- **Backend/API:** Next.js API routes, Supabase Postgres + RPCs (`supabase/migrations`), Supabase Storage buckets (`pending_images`, `approved_images`, `spark`), in-memory rate limiting, optional OpenRouter LLM metadata extraction.
- **Auth:** Clerk (`@clerk/nextjs`) with middleware-based protection and optional bypass.
- **Tooling:** Jest + React Testing Library, ESLint/Prettier, Husky + lint-staged.

## Prerequisites
- Node 18+ and npm.
- Supabase project with:
  - Postgres + RPCs from `supabase/migrations`
  - Storage buckets: `pending_images`, `approved_images`, and `spark`
  - Service role key (server-side) and public project URL
- Clerk project for auth (or use `NEXT_PUBLIC_BYPASS_CLERK=true` locally).
- OpenRouter API key (only required for AI metadata mode).
- Supabase CLI (optional) for applying migrations locally or to a linked project.

## Environment & Secrets
Create `.env.local` from `.env.example` and fill the values. Never commit real keys.

Required for core flows:
- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL (public).
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role (server-only).
- `SUPABASE_BUCKET_PENDING_IMAGES`, `SUPABASE_BUCKET_APPROVED_IMAGES` – Storage bucket names (defaults: `pending_images`, `approved_images`). `NEXT_PUBLIC_SUPABASE_BUCKET_PENDING_IMAGES`/`...APPROVED...` can also be used.
- `UPLOAD_RATE_LIMIT_MAX`, `UPLOAD_RATE_LIMIT_WINDOW_MS` – Global upload cap and window (minutes) for AI use.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` – Clerk auth keys; set `NEXT_PUBLIC_BYPASS_CLERK=true` to disable auth for local testing.
- `OPENROUTER_API_KEY` (and optional `OPENROUTER_MODEL`) – Enables AI metadata extraction.
- `NEXT_PUBLIC_ADMIN_ID` (optional legacy check; admin access currently tied to Clerk session metadata in `middleware.ts`).
- `NODE_ENV` – `development` for local runs.

> `.env.local` already exists in the repo root for local secrets; `.env.example` documents every variable.

## Run the Project
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Fill in Supabase, Clerk, and OpenRouter keys in .env.local
   ```
   - Set `NEXT_PUBLIC_BYPASS_CLERK=true` if you want to skip auth during local testing.
3. **Provision Supabase**
   - Ensure buckets `pending_images`, `approved_images`, and `spark` exist in Storage.
   - Apply migrations to your project (requires Supabase CLI login/link):
     ```bash
     npx supabase login
     npx supabase link --project-ref <your-project-ref>
     npx supabase db push
     ```
     (See `supabase/MigrationGuide.MD` for the full workflow.)
4. **Start the dev server**
   ```bash
   npm run dev
   ```
   - App runs at http://localhost:3000.
   - Sign in via Clerk, or rely on `NEXT_PUBLIC_BYPASS_CLERK=true` for local no-auth.
5. **Run tests (optional)**
   ```bash
   npm test          # all tests
   npm run test:watch
   npm run test:coverage
   ```

## Key API Routes & Backend Behavior

## Data & Storage Notes
- Supabase Postgres tables used in search/admin flows include `statues`, `images`, `statue_subject`, `statue_attributes`, `materials`, `subjects`, `locations`, `auction_events`, and views such as `image_attribute_overrides`.
- Image lifecycle:
  1. Uploaded to `pending_images` with an internal reference number.
  2. Metadata captured in `temp_artifact_metadata` (AI or manual).
  3. Admin approval moves the asset to `approved_images`, creates/updates the `statues` row, and links the image (plus optional lookup records).
  4. Search signs URLs from the public `spark` bucket for display.

## Tooling & Scripts
- `npm run lint` – ESLint with Prettier.
- `npm run build` / `npm start` – Production build and start.
- Husky + lint-staged run linting/formatting and tests on commit/push.

## Bugs & Errors

## Deployment
- **Build & start**: `npm run build` then `npm start` (Next.js production server).
- **Environment**: Provide all env vars from `.env.example` in your host (Vercel/Render/etc.). Keep `NEXT_PUBLIC_BYPASS_CLERK=false` and set `NODE_ENV=production` for real deployments.
- **Supabase**: Apply migrations to the production project (`npx supabase db push` after `npx supabase link ...`). Ensure Storage buckets `pending_images`, `approved_images`, and `spark` exist and are correctly named.
- **Auth**: Configure Clerk for your production domain and supply `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`.
- **AI**: Add `OPENROUTER_API_KEY` (and optional `OPENROUTER_MODEL`) if you want AI metadata extraction in production; omit to force manual entry only.
