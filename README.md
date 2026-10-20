# voidstart

A starter kit for full-stack apps on [Void](https://void.cloud): a Vite framework for Cloudflare Workers with file-based API routing, typed backend services, and a React front end. It ships with a complete authentication and account system, role-based access control, an admin area, and a UI kit, so you can start building product features right away.

## Stack

- **Runtime:** Cloudflare Workers via Void (`void`), with D1 (SQLite) for the database and object storage for uploads
- **Server:** Hono handlers through `defineHandler`, validated with `zod`
- **Auth:** [Better Auth](https://www.better-auth.com) with many plugins (see below)
- **Front end:** React 19, TanStack Router (file-based routes, auto code splitting), TanStack Query, TanStack Form, TanStack Table
- **UI:** Tailwind CSS 4, shadcn/ui on Base UI, lucide icons, Recharts, `nuqs` for URL state
- **Tooling:** Vite+ (`vp`) for dev, build, format, lint and type checks, TypeScript, pnpm

## Features

### Authentication

Configured in `auth.ts`, with the toggles in `void.config.ts`.

- Email and password sign-up and sign-in, with required email verification and password reset
- Magic link sign-in
- Email one-time-code (OTP) sign-in
- Google OAuth, with account linking
- Passkeys (WebAuthn), including autofill on the sign-in form
- Two-factor authentication: TOTP with a QR code, email OTP, backup codes, trusted devices and account lockout
- Usernames
- Bearer tokens
- "Last used" login method badge
- Email change with confirmation from the old address, and account deletion with an emailed confirmation link
- Sign-up can be turned off with the `signUpEnabled` constant in `auth.ts`

Sign-in pages live under `src/routes/auth/` (sign-in, sign-up, forgot and reset password, magic link, OTP, verify email, two-factor, and an error page).

### Account area (`/account`)

Profile (name, avatar upload and removal), username, email, password, two-factor setup, passkeys, connected accounts, active sessions, granted permissions, and a danger zone for deleting the account.

### Admin area (`/admin`)

For users with an admin role: a data table of users with search, filters, sorting, pagination and bulk actions, user stats, creating users, changing roles, banning and unbanning, deleting users, and impersonating a user (with a "stop impersonating" action in the user menu).

### Access control

Roles and permissions are defined in `src/lib/auth/access-data.ts` (`admin` and `user`, with `user` as the default). The module is split on purpose:

- `src/lib/auth/access-utils.ts` has client-safe helpers such as `can`, `hasAdminRole` and `getRoleLabel`.
- `src/lib/auth/access-server.ts` has the server-only `requirePermission(c, permissions)` for route handlers. It is a separate file so `void/auth` (which needs `node:async_hooks`) never gets bundled for the browser.

To add a resource to the permission model, add it to `statement` and to the role definitions in `access-data.ts`, then guard routes with `requirePermission`.

### Other

- Avatar upload, serving and deletion through `routes/api/avatars` (PNG, JPG, WebP or GIF, 2 MB maximum)
- Transactional emails through `void/email`, with a local dev inbox
- Authenticated app shell with a floating sidebar, module switcher, breadcrumbs and user dropdown
- Reusable data table components in `src/components/data-table`
- Dark and light themes and a responsive layout

## Project structure

```
auth.ts                 Better Auth configuration (plugins, emails, sessions)
env.ts                  Typed environment schema
void.config.ts          Void config (auth providers, email sender, worker settings)
db/schema.ts            Your database tables (empty by default)
db/migrations/          Generated SQL migrations
routes/api/             Void server routes (avatars, hello)
src/routes/             TanStack Router pages
  auth/                 Sign-in, sign-up, recovery and two-factor pages
  account/              Profile, security, sessions and connections
  admin/                User management
  home/                 Authenticated home
src/components/         auth, account, admin, layouts, data-table, ui
src/hooks/              Reusable hooks (user, sign-out, impersonation, passkeys, ...)
src/lib/                App name, auth helpers, formatting, data table utilities
```

## Getting started

Requirements: Node.js and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

The app runs at http://localhost:5173.

### Environment

Create a `.env` file in the project root.

| Variable                   | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `AUTH_GOOGLE_CLIENT_ID`    | Google OAuth client ID (needed for Google login) |
| `AUTH_GOOGLE_CLIENT_SECRET`| Google OAuth client secret                       |
| `APP_NAME`                 | Optional. App name shown in emails and as the passkey and 2FA issuer. Defaults to `voidstart`. |

If you don't want Google login, remove `"google"` from `auth.providers` in `void.config.ts`. Validate the environment with `pnpm exec void env check`.

### Database

The database schema is `db/schema.ts`, and it starts empty. Better Auth's own tables are created by the initial migration in `db/migrations`.

```bash
pnpm db generate    # create a migration after changing the schema
pnpm db push        # apply the schema directly, without migration files
pnpm db status      # show local and remote migration status
pnpm db reset       # drop and re-apply all migrations
pnpm db studio      # open Drizzle Studio
```

### Email

Emails (verification, password reset, magic links, OTPs, account changes) are sent with `sendEmail` from `void/email`. In development they go to a local inbox. Before deploying, change the sender in `void.config.ts` (`email.from`) to an address on a domain you own and have verified.

## Scripts

| Command        | What it does                                        |
| -------------- | --------------------------------------------------- |
| `pnpm dev`     | Start the dev server                                |
| `pnpm build`   | Build for production                                |
| `pnpm preview` | Preview the production build                        |
| `pnpm check`   | Format, lint and type check                         |
| `pnpm fmt`     | Format the code                                     |
| `pnpm lint`    | Lint the code                                       |
| `pnpm db ...`  | Database commands (see above)                       |

## Deploying

```bash
pnpm exec void deploy
```

Set production secrets with `pnpm exec void secret put NAME=value` (for example the Google OAuth credentials), or bulk upload a dotenv file with `void secret sync`. See `node_modules/void/docs/guide/deployment.md` for platform details.

## Working with Void

Void's documentation ships in the package. Read the relevant pages in `node_modules/void/docs/` before changing framework-level code, starting with `guide/quickstart.md` and `reference/cli.md`. `void gen route <path>` scaffolds an API route and `void gen model <name>` scaffolds a table with routes.
