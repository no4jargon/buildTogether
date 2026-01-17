# Build Together Protocol v0

A collaboration system for running multiple experiments without chaos. The core unit is an experiment with decision owners, contributors, action items, status logs, journals, and reusable assets.

## What this app is

Build Together helps teams keep ownership explicit, effort visible, and progress legible while running multiple experiments in parallel.

## Local development

### Requirements

- Node.js 18+
- SQLite (default) or Postgres

### Setup

```bash
npm install
cp .env.example .env
```

### Database

By default the app uses SQLite for local development.

```bash
npx prisma migrate dev
npx prisma db seed
```

### Run the app

```bash
npm run dev
```

## Auth (magic link) in development

Magic links are printed to the server console. Visit the link to sign in. No paid email provider is required in development.

### Email provider configuration

To send real magic links, configure SMTP credentials (for example, from a transactional email provider). The app uses NextAuth's email provider and `nodemailer`.

Required environment variables:

- `EMAIL_FROM` — the verified sender address
- `SMTP_HOST` — SMTP server hostname
- `SMTP_PORT` — SMTP server port (typically 587)
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password
- `SMTP_SECURE` — set to `true` for port 465, otherwise `false`

## Switching between SQLite and Postgres

- **SQLite (default):** uses `prisma/schema.prisma` and `DATABASE_URL="file:./dev.db"`.
- **Postgres:** use `prisma/schema.postgres.prisma` and set a Postgres `DATABASE_URL`.

Example for Postgres migrations:

```bash
npx prisma migrate dev --schema prisma/schema.postgres.prisma
```

## Seeding

```bash
npm run seed
```

## Key commands

- `npm run dev` — start development server
- `npm run lint` — run lint
- `npm run test` — run unit tests
- `npx prisma migrate dev` — run migrations
- `npx prisma db seed` — seed sample data

## Notes

- Week start date for journals is computed with Monday as the first day of the week.
