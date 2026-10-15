# ASCII_CAM — Full Stack (React · Express · MongoDB)

Convert your camera, videos and images to live ASCII art, then **save it to a MongoDB-backed gallery**, share it publicly, and keep your favourite settings as presets.

```
React.js (client)  →  REST API (Node.js + Express)  →  MongoDB (Mongoose)
```

## Quick start

**Needs:** Node.js 18+ and MongoDB (local, Docker, or a free MongoDB Atlas cluster).

```bash
# 1. MongoDB (pick one)
docker compose up -d                 # local MongoDB on port 27017
#    or put your Atlas connection string in server/.env  (copy server/.env.example)

# 2. Install everything
npm run install:all

# 3. Run API (http://localhost:5000) and React app (http://localhost:5173) together
npm run dev
```
Open http://localhost:5173, create an account, go to **Explore**, make some art and press **Save**.

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | API + React dev servers together |
| `npm test` | API tests (validation/auth tests run anywhere; the CRUD test runs when `MONGO_URI_TEST` is set) |
| `npm run build` | Type-check and build the React app |

## Folders
- `client/` — React 18 + TypeScript + Tailwind (Vite)
- `server/` — Node.js + Express REST API + Mongoose models
- `docs/PROJECT_DOCUMENTATION.md` — architecture diagram, database design, API details, team roles, demo script, viva questions
- `docs/screenshots/` — put your application screenshots here (checklist inside the documentation)

## Environment variables (`server/.env`)
`PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES`, `CLIENT_ORIGIN` — see `server/.env.example`. Defaults work for local development.
