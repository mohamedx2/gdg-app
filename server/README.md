# GDG on Campus EPI — Backend API

Express + Supabase (Postgres) backend for the Expo/React Native app.

The server talks to Supabase with the **service_role** key (Row Level Security is
enabled with no policies, so only this trusted server can read/write). It issues
its own JWTs — Supabase Auth is **not** used.

## Stack

- **Express 4** + **TypeScript** (NodeNext, CommonJS output)
- **@supabase/supabase-js** — Postgres access
- **jsonwebtoken** + **bcryptjs** — auth
- **zod** — request validation

## Setup

1. Create a Supabase project, then run `supabase/schema.sql` in the SQL editor.
2. Copy `.env.example` to `.env` and fill in `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API).
3. Install and seed:

   ```bash
   npm install
   npm run seed      # loads the demo data + demo accounts
   npm run dev       # http://localhost:4000
   ```

### Demo accounts (password `gdgepi2026`)

| Email              | Role         | Name             |
| ------------------ | ------------ | ---------------- |
| `admin@epi.dev`    | `super-admin`| Maram Belgacem   |
| `organizer@epi.dev`| `core-team`  | Meriem Trabelsi  |
| `member@epi.dev`   | `student`    | Mohamed Salah    |

## Scripts

| Script             | Does                                            |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Start with hot reload (`tsx watch`)             |
| `npm run build`    | Compile to `dist/`                              |
| `npm start`        | Run the compiled server                         |
| `npm run seed`     | Upsert seed data + demo accounts                |
| `npm run typecheck`| Type-check without emitting                     |

## Connecting the app

The mobile app's HTTP client prefixes every request with `EXPO_PUBLIC_API_URL`.
Routes are mounted under `/api/v1`, so point the app at the full prefix. In the
app's `.env`:

```bash
EXPO_PUBLIC_API_MODE=production
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:4000/api/v1
```

Use your machine's LAN IP (not `localhost`) when running on a device/emulator.
`GET /health` is available at the root (no `/api/v1` prefix).

## Auth

All routes except `/login`, `/register`, `/google` and `/health` require a
`Authorization: Bearer <token>` header. The token is returned from those auth
routes as `{ token, user }`.

Role gating: `core-team` and `super-admin` are organizers; organizer-only routes
(admin CRUD, presence roster) are enforced by middleware. `super-admin` is
required for changing member roles.

## Layout

```
server/
  supabase/schema.sql      # full DDL + RLS + counter RPCs — run first
  src/
    index.ts               # Express bootstrap, error handler
    env.ts, supabase.ts    # config + trusted DB client
    routes/                # one router per resource (see routes/index.ts)
    http/                  # async wrapper, error types, query + db helpers
    auth/                  # password hashing, JWT, middleware, request context
    services/              # points + achievement/badge evaluation
    mappers.ts, db-types.ts# snake_case rows -> domain models
    types.ts               # domain types (copied from the app)
    seed/                  # seed data (from the app) + seed runner
```
