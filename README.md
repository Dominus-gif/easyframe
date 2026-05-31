# EasyFrame

A Next.js mockup design app for creating clean screenshots, social frames, and device mockups for EasyFrame.app.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.local.example .env.local
```

3. Generate the Prisma client and create the Supabase/Postgres tables:

```bash
npm run db:generate
npm run db:push
```

4. Start the local app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## GitHub Push

This repository is ready to push after the first local commit:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Do not commit `.env`, `.env.local`, `.next`, `node_modules`, local SQLite databases, or the copied `tokokino_source` folder. These are already covered by `.gitignore`.

## Deployment Checklist

For a hosted domain such as `https://easyframe.app`, configure these environment variables in the hosting provider:

- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL=https://your-domain.com`
- `DODO_WEBHOOK_SECRET`
- `DODO_MONTHLY_PRODUCT_ID`
- `DODO_LIFETIME_PRODUCT_ID`
- `DODO_MONTHLY_CHECKOUT_URL`
- `DODO_LIFETIME_CHECKOUT_URL`

Set `ALLOW_LOCAL_MOCK_SESSION=false` or omit it in production.

EasyFrame now expects a Postgres database. Supabase is the recommended production database.

Google OAuth also needs the production callback URL:

```text
https://your-domain.com/api/auth/callback/google
```

Dodo webhook URL:

```text
https://your-domain.com/api/dodo/webhook
```

## Supabase + OAuth Setup

Create one Supabase project for production, then copy the pooled Postgres connection string into `DATABASE_URL` in Vercel. Run:

```bash
npm run db:push
```

Prisma creates the required tables automatically. Do not create them by hand unless we are debugging a migration. The schema creates:

- `User`: account profile, Google user link, trial flags, and high-level plan state.
- `Account`: NextAuth OAuth account connection.
- `Session`: NextAuth session storage compatibility.
- `VerificationToken`: NextAuth token support.
- `Subscription`: active plan, trial export count, Dodo customer/subscription IDs, expiration, and renewal status.
- `PaymentEvent`: Dodo webhook audit trail.
- `MockupProject`: saved mockup project data.

Google OAuth needs:

- Authorized JavaScript origin: `https://easyframe.app`
- Authorized redirect URI: `https://easyframe.app/api/auth/callback/google`
- Local redirect URI while developing: `http://localhost:3000/api/auth/callback/google`

Trial behavior:

- First Google sign-in creates the user.
- Starting the trial creates a one-time 24-hour trial with 5 exports.
- When the trial expires or export limit is reached, `/studio` redirects to `/pricing?reason=trial-ended`.
- Paid Dodo webhook events update the user's `Subscription` row and unlock monthly or lifetime access.

## Environment

`.env.local.example` includes placeholders for:

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google OAuth.
- `NEXTAUTH_SECRET` and `NEXTAUTH_URL=http://localhost:3000`.
- `ALLOW_LOCAL_MOCK_SESSION=true` for local premium-gate bypass while developing.
- Dodo Payments sandbox API key, product IDs, and webhook secret.

## Application Architecture

- `app/page.tsx`: Public landing page.
- `app/studio/page.tsx`: Studio route.
- `components/MockupStudio.tsx`: Main three-column interface and mockup editor.
- `store/useMockupStore.ts`: Zustand editor state, including future AI state fields.
- `lib/mockup-data.ts`: Device, template, background, and edge-style presets.
- `prisma/schema.prisma`: Supabase/Postgres SaaS schema for users, sessions, projects, trials, subscriptions, and payment events.
- `app/api/auth/[...nextauth]/route.ts`: Google OAuth through NextAuth.
- `app/api/dodo/webhook/route.ts`: Dodo sandbox webhook receiver.
- `app/api/generate-ai-mockup/route.ts`: Reserved future AI endpoint.
- `middleware.ts`: Premium route gate with local bypass support.

## Subscription Model

The schema supports:

- Monthly recurring plan: `DODO_MONTHLY_PRODUCT_ID`
- One-time lifetime plan: `DODO_LIFETIME_PRODUCT_ID`

The Dodo webhook updates `User.subscriptionStatus`, `User.subscriptionPlan`, `User.dodoCustomerId`, and `User.lifetimeAccess` for paid events such as `subscription.created`, `subscription.active`, and `payment.successful`.

## Local Dodo Webhook Testing

1. Start the app with `npm run dev`.
2. Expose localhost with ngrok:

```bash
ngrok http 3000
```

3. In Dodo sandbox settings, set the webhook URL to:

```text
https://your-ngrok-domain.ngrok-free.app/api/dodo/webhook
```

4. Trigger sandbox checkout events and confirm rows appear in the `PaymentEvent` table.

## Product Scope

This build intentionally avoids complex animation controls. It is optimized for simple, beautiful digital-device mockups:

- Upload a normal photo.
- Pick one phone or laptop screen.
- Apply a template mockup.
- Select gradients/backgrounds.
- Adjust edge style, corner radius feel, perspective, zoom, and padding.
- Export a clean PNG.
