# AI Sales Scout — Melexis

A minimal Next.js (App Router) + Tailwind app that helps you find companies likely working on applications suited for a given Melexis semiconductor, and identify decision-makers.

This repo includes:
- A production-ready, client-side UI with mock data
- CSV export
- Basic dev tests (in-app) for sanity
- Ready for GitHub + Vercel

## Getting Started

```bash
pnpm install   # or npm install / yarn
pnpm dev       # or npm run dev
```

Open `http://localhost:3000`

## Deploy

### 1) Publish to GitHub
- Create a new repo on GitHub (e.g., `melexis-ai-sales-scout`).
- Commit & push this folder.

### 2) Connect to Vercel
- In Vercel, import the GitHub repo.
- Framework preset: **Next.js** (Auto-detected)
- Root directory: `/` (repo root)
- Build command: `next build` (default)
- Output: `.next` (default)
- Add `NEXT_TELEMETRY_DISABLED=1` if you prefer.

Click **Deploy**. Done.

## Customizing

- Edit UI logic in `components/SalesScoutApp.tsx`.
- Replace `mockFindCompanies` and `mockFindDecisionMakers` with real backend endpoints (vector DB + LLM + enrichment providers).
- Tailwind is configured in `tailwind.config.js` and `app/globals.css`.

## License

MIT