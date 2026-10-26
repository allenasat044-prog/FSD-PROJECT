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

# 3. Run API (http://localhost:5001) and React app (http://localhost:5173) together
npm run dev
```
Open http://localhost:5173, create an account, go to **Explore**, make some art and press **Save**.
Want demo art in the public gallery straight away? `npm --prefix server run seed:gallery`

## Connecting the database
1. `cp server/.env.example server/.env`
2. Set `MONGO_URI` in `server/.env`:
   - **Local:** `mongodb://127.0.0.1:27017/ascii_cam` (start it with `docker compose up -d`)
   - **Atlas:** create a free M0 cluster → *Database Access*: add a user + password → *Network Access*: add your IP → *Connect → Drivers*: copy the `mongodb+srv://…` string, insert the password and the database name (`…mongodb.net/ascii_cam?retryWrites=true&w=majority`). URL-encode special characters in the password (`@` → `%40`).
3. `npm --prefix server run dev` — you should see `MongoDB connected: …`. Check `http://localhost:5001/api/health` → `"db":"connected"`.

Collections (`users`, `artworks`, `presets`, `faqs`) are created automatically on first use; FAQs are seeded on first start.

## Sign-in
Email + password works out of the box (bcrypt-hashed, JWT). Google / GitHub buttons appear on `/login` · `/signup` and `/signup` once their keys are in `server/.env` — see the comments in `server/.env.example` for where to create the keys and which callback URL to use. Social accounts are stored in the same `users` collection (accounts with the same email are linked).

## Pages
`/` home · `/explore` converter · `/gallery` community + your art (search, source filter, sort, likes) · `/gallery/:id` full-size piece · `/faq` · `/login` · `/signup`

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
`PORT` (default 5001), `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES`, `CLIENT_ORIGIN` — see `server/.env.example`. Defaults work for local development.
