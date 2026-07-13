# Niyo_Task

A REST API for simple task management, built with Express, TypeScript, Sequelize (Postgres), Zod validation, JWT auth, and a Socket.IO channel for real-time task-creation notifications.

## Tech stack

- **Runtime**: Node.js + TypeScript
- **HTTP**: Express
- **Database**: PostgreSQL via `sequelize-typescript`
- **Validation**: Zod
- **Auth**: JWT (`jsonwebtoken`) + `bcrypt` password hashing
- **Realtime**: Socket.IO (emits `taskcreated` when a task is created)

## Getting started

### Prerequisites

- Node.js 18+
- A running PostgreSQL instance

### Setup

```bash
npm install
cp .env.sample .env   # then fill in real values — see below
npm run build          # compiles src/ -> dist/ and copies the client assets
npm run start:dev       # build, then run with nodemon watching src/
```

The server connects to the database and runs `sequelize.sync()` before it starts accepting HTTP traffic — if the database is unreachable or `JWT_SECRET` is missing, the process logs the error and exits rather than serving requests against a broken connection.

### Environment variables

See [`.env.sample`](.env.sample) for the full list. All are required unless noted:

| Variable      | Description                                              |
|---------------|------------------------------------------------------------|
| `API_PORT`    | Port the HTTP server listens on (defaults to `3000`)       |
| `DB_HOST`     | Postgres host                                               |
| `DB_PORT`     | Postgres port (defaults to `5432`)                          |
| `DB_NAME`     | Postgres database name                                       |
| `DB_USER`     | Postgres user                                                |
| `DB_PASSWORD` | Postgres password                                             |
| `JWT_SECRET`  | Secret used to sign/verify auth tokens. **Required** — the app refuses to boot without it. |

**Never commit `.env`.** It's gitignored; if you ever see it tracked in `git status`, that's a bug — see [Security notes](#security-notes).

## API overview

All endpoints are prefixed with `/api/v1`. Authenticated routes require an `Authorization: Bearer <token>` header, obtained from `POST /users/login`.

### Users (`/api/v1/users`)

| Method | Path         | Auth | Notes                                                              |
|--------|--------------|------|---------------------------------------------------------------------|
| POST   | `/`          | —    | Register a new user. `409` if the email is already taken.           |
| POST   | `/login`     | —    | Returns a JWT (also set as an `accessToken` cookie).                |
| POST   | `/logout`    | —    | Clears the auth cookie.                                              |
| GET    | `/`          | ✅    | List all users.                                                     |
| GET    | `/:id`       | ✅    | Get a user by id.                                                    |
| PATCH  | `/:id`       | ✅    | Update a user. **Self only** — `403` if `:id` isn't the caller's own id. |
| DELETE | `/:id`       | ✅    | Delete a user. **Self only** — `403` otherwise.                     |

Password hashes are never returned in any response (enforced at the model level, not per-endpoint).

### Tasks (`/api/v1/tasks`)

All task routes require auth. There is no admin role in this system, so every route is scoped to the caller's own tasks — a request for a task you don't own returns `403`.

| Method | Path                        | Notes                                                        |
|--------|------------------------------|----------------------------------------------------------------|
| POST   | `/`                          | Create a task, owned by the caller.                             |
| GET    | `/`                          | List the caller's own tasks.                                    |
| GET    | `/:id`                       | Get a task by id. `403` if it belongs to another user.          |
| GET    | `/users-tasks/:userId`       | List tasks for `:userId`. `403` unless `:userId` is the caller. |
| PATCH  | `/:id`                       | Update a task. `403` if it belongs to another user.              |
| DELETE | `/:id`                       | Delete a task. `403` if it belongs to another user.               |

Task `status` is one of `Open`, `InProgress`, `Completed`, `Cancelled`.

## Scripts

| Script            | Description                                                  |
|-------------------|----------------------------------------------------------------|
| `npm run build`   | Compile TypeScript to `dist/` and copy `src/client` assets.    |
| `npm run dev`     | Run the compiled app with nodemon (watches `src/`, rebuild required for changes to take effect — use `start:dev` instead during active development). |
| `npm run start:dev` | `build` then `dev` — the usual local dev command.            |

There is currently no automated test suite (`npm test` is a stub). Manual verification is done by building, running the server against a local Postgres instance, and exercising the endpoints (e.g. with `curl`).

## Architecture notes

- **Layering**: `Router → Controller → Repository → Model`. Controllers handle HTTP concerns (status codes, request/response shape) and ownership checks; repositories own persistence logic and field-level update semantics; models define schema and cross-cutting rules (e.g. password never serializes).
- **Auth**: `authorizationMiddleware` validates the JWT and attaches `_userId`/`_user` to `req.body`. Every ownership check in this codebase compares a resource's `userId` against `req.body._userId`.
- **Password safety**: `User` has a `defaultScope` that excludes `password` from all normal queries, a `withPassword` scope used only by login, and a `toJSON()` override that strips `password` unconditionally as a last line of defense (covers instances built via `create()` that bypass scopes).
- **Schema sync vs. migrations**: the app calls `sequelize.sync({ alter: true })` outside production so local/dev databases pick up model changes automatically. Production deployments should apply the files in `migrations/` via `sequelize-cli` instead of relying on `alter: true` against live data.

## Security notes

- Rotate your database password and `JWT_SECRET` if you ever suspect `.env` was committed or shared — check `git log --all --full-history -- .env` for past commits.
- There is no role-based access control; every authenticated user has the same permissions over their own resources, and no user can read, modify, or delete another user's resources (users or tasks).
