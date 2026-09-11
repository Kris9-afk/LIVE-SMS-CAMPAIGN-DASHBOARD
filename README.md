# NAKRIS 02 Enterprises SMS Campaign Dashboard

A live SMS campaign dashboard built with Vite, React, TypeScript, and Tailwind CSS.

Live site: https://kris9-afk.github.io/LIVE-SMS-CAMPAIGN-DASHBOARD/

## Requirements

- Node.js 20 or newer
- npm

## Project structure

```text
frontend/                    Vite, React, TypeScript, and Tailwind dashboard
.github/workflows/           GitHub Pages deployment workflow
README.md                    Project instructions
```

## Install dependencies

From the project root:

```bash
cd frontend
npm install
```

## Run locally

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Build and verify

Run the checks from `frontend`:

```bash
cd frontend
npm run lint
npm run build
```

To preview the production build locally:

```bash
cd frontend
npm run preview
```

## Deployment

Every push to `main` runs `.github/workflows/deploy-pages.yml`. The workflow installs the frontend dependencies, builds `frontend/dist`, and deploys the result to GitHub Pages.

The Vite base path is configured automatically for the repository URL during GitHub Actions builds.
