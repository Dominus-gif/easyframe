# Supabase email auth + Resend: one-time setup

EasyFrame signs users in with Supabase Auth (email + password, or an emailed
one-time code). Accounts are matched to our database **by email**, so
purchases (Dodo checkouts are opened with the signed-in email) and existing
users carry over automatically.

Project: `rkzvojnatyakpmgpzrta` (Supabase dashboard → this project).

---

## 1. Public key → `.env.production`

Supabase → **Project Settings → API Keys** → copy the **anon / publishable** key
into `.env.production` as `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and into
`.env.development.local` for local dev). It is public by design. **Never** use
the `service_role` / secret key here.

## 2. Authentication settings

**Authentication → Sign In / Providers → Email**
- Enable Email provider: **on**
- **Confirm email: ON** ← required. Without it anyone could sign up with
  someone else's address and inherit that person's Premium purchases.
- Minimum password length: **8**
- Email OTP length: **6**

Disable **Google** here if it was enabled; the site no longer offers it.

**Authentication → URL Configuration**
- Site URL: `https://www.easyframe.app`
- Redirect URLs:
  - `https://www.easyframe.app/**`
  - `http://localhost:3943/**` (local development)

## 3. Email templates (Authentication → Emails)

These make links work across devices (sign up on a laptop, confirm on a phone)
and put the 6-digit code in the sign-in email.

**Magic Link** (used for "Email code" sign-in). Subject: `Your EasyFrame sign-in code`
```html
<h2>Your EasyFrame code</h2>
<p>Enter this code to sign in:</p>
<p style="font-size:30px;font-weight:700;letter-spacing:8px;margin:18px 0">{{ .Token }}</p>
<p>It expires soon. If you didn't try to sign in, you can ignore this email.</p>
```

**Confirm signup**. Subject: `Confirm your EasyFrame account`
```html
<h2>Confirm your email</h2>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/editor">Confirm my account</a></p>
```

**Reset password**. Subject: `Reset your EasyFrame password`
```html
<h2>Reset your password</h2>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Choose a new password</a></p>
<p>If you didn't ask for this, ignore this email; your password won't change.</p>
```

## 4. Resend as the email sender

Supabase's built-in email only reaches your own team members, so real users
need a custom sender.

1. Create an account at resend.com → **Domains → Add domain** → `easyframe.app`.
2. Resend shows DNS records (SPF/`MX` + `TXT`, DKIM `TXT`). Add each one in
   **Cloudflare → easyframe.app → DNS → Records** exactly as shown (DNS-only /
   grey cloud). Resend's "Auto configure" with Cloudflare can do this for you.
   Wait until Resend shows the domain as **Verified**.
3. Resend → **API Keys → Create** (permission: *Sending access*).
4. Supabase → **Project Settings → Authentication → SMTP Settings** → enable
   custom SMTP:
   - Sender email: `noreply@easyframe.app`
   - Sender name: `EasyFrame`
   - Host: `smtp.resend.com`   Port: `465`
   - Username: `resend`   Password: *the Resend API key*
5. Supabase → **Authentication → Rate Limits**: raise "emails sent per hour"
   to suit your traffic (the default is low).

## 5. Existing users

People who used "Continue with Google" before sign in with **Email code** using
the same address. They land in the same account with the same plan and
purchase history, and can set a password under **Account**.

## Test checklist

- Create account (password) → confirmation email arrives → link opens
  `/editor` signed in.
- Sign out → sign in with **Email code** → 6-digit code arrives → works.
- **Forgot password** → email → link opens `/account?reset=1` → new password works.
- `/account` shows the plan; a test checkout appears under Purchases.
