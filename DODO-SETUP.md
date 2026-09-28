# Dodo Payments setup

Checkout creates a **Dodo checkout session** from your product IDs
(`app/api/billing/checkout/route.ts`), redirects the user to Dodo's hosted
page with their email locked in, and grants access two ways:

- **Webhook** (`/api/dodo/webhook`) — the source of truth, verified with your
  signing secret; grants access by matching the customer email to the account.
- **Return page** (`/billing/return`) — confirms the payment via
  `/api/billing/confirm` and polls entitlement so the user sees Premium quickly.

## 1. Set the secrets on Cloudflare

Checkout is failing right now because **no secrets are set on the Worker**. Run:

```bash
powershell -ExecutionPolicy Bypass -File scripts/setup-secrets.ps1
```

It asks for (get these from the Dodo dashboard):

| Secret | Where |
| --- | --- |
| `DODO_API_KEY` | Developer → API keys (**Live** key for production) |
| `DODO_WEBHOOK_SECRET` | Developer → Webhooks → your endpoint's signing secret (`whsec_…`) |
| `DODO_ENVIRONMENT` | `live` (or `test` while testing) |
| `DODO_MONTHLY_PRODUCT_ID` | your monthly product id |
| `DODO_YEARLY_PRODUCT_ID` | yearly product id (blank if none) |
| `DODO_LIFETIME_PRODUCT_ID` | your lifetime product id |

Then redeploy: `npm run cf:deploy` (secrets take effect immediately, but a
redeploy is harmless).

> Use **test** mode first: set `DODO_ENVIRONMENT=test`, use your **test** API
> key + test product ids, and pay with a Dodo test card. Switch all of them to
> live together.

## 2. Point the Dodo webhook at the site

Dodo dashboard → Developer → Webhooks → add endpoint:

```
https://www.easyframe.app/api/dodo/webhook
```

Subscribe to at least: `payment.succeeded`, `subscription.active`,
`subscription.cancelled`. Copy its signing secret into `DODO_WEBHOOK_SECRET`.

## 3. Test the flow

1. Sign in on the site, open **/pricing**, click **Get Premium**.
2. You should land on Dodo's checkout with your email pre-filled.
3. Pay (test card in test mode). You return to `/billing/return`, which flips
   you to the editor once access is granted.
4. Check **/account** — the plan and the purchase should appear.

If checkout bounces back to `/pricing?checkout=missing`, the API key or product
id for that plan isn't set. `?checkout=error` means Dodo rejected the request —
check `npx wrangler tail easyframe` for the logged reason.

## Change a plan by hand (testing / support)

No payment needed — grant or revoke directly in the DB with the session-pooler
connection string:

```bash
# PowerShell
$env:DATABASE_URL="postgresql://postgres.<ref>:<pw>@aws-1-<region>.pooler.supabase.com:5432/postgres"
node scripts/set-plan.mjs someone@example.com lifetime   # grant
node scripts/set-plan.mjs someone@example.com free       # revoke
```

`plan` = `free | monthly | yearly | lifetime`. The user must have signed in at
least once (so the account exists). You can also do this in the Supabase SQL
editor, but the script also writes the Subscription row that entitlement checks.
