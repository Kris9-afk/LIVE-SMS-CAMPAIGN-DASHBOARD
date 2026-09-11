# NAKRIS 02 Enterprises SMS Campaign Dashboard

A live SMS campaign dashboard with a Vite/React frontend and a small Node.js HTTP backend.

## Requirements

- Node.js 20 or newer
- npm

## Project structure

```text
frontend/   Vite, React, TypeScript, and Tailwind dashboard
backend/    Node.js API service
README.md   Project instructions
```

## Install dependencies

From the project root:

```bash
cd frontend
npm install
```

The backend uses only Node.js built-ins, so it does not need a separate install.

## Run locally

Open two terminals from the project root.

### Terminal 1: backend

```bash
node backend/server.js
```

The API runs at `http://localhost:4000`.

### Terminal 2: frontend

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## API endpoints

| Method | Endpoint        | Purpose                           |
| ------ | --------------- | --------------------------------- |
| `GET`  | `/api/health`   | Check that the backend is running |
| `GET`  | `/api/messages` | Return sample campaign messages   |

Example checks from PowerShell:

```powershell
Invoke-RestMethod http://localhost:4000/api/health
Invoke-RestMethod http://localhost:4000/api/messages
```

## Test and verify

The frontend currently uses linting and a production build as its automated checks:

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

There is no dedicated unit-test suite configured yet.
