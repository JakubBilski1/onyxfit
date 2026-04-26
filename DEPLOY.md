# Deploy on Vercel — onyxcoach

Vercel CLI is already installed locally (`devDependencies.vercel`). Two
commands and you're live.

## 1. Login (one-time)

```bash
npx vercel login
```

Choose how you want to log in (GitHub / Google / Email). It opens a browser
tab — confirm there.

## 2. Link the project (one-time)

From this directory:

```bash
npx vercel link
```

Answer:
- **Set up and deploy?** → `Y`
- **Which scope?** → your personal account (or team if you have one)
- **Link to existing project?** → `N` (first deploy creates one)
- **Project name?** → `onyxcoach` (or whatever you want)
- **Directory?** → `./` (default)
- **Override settings?** → `N` — Vercel auto-detects Next.js

This writes `.vercel/project.json` (gitignored).

## 3. Push env vars

The list is in `.env.production.example`. Easiest path: **paste them in
the Vercel dashboard** → Project → Settings → Environment Variables. Add
each one for **Production, Preview, Development**.

Or one-by-one via CLI:

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
# (paste value, repeat for every var)
```

Or in bulk from a local file:

```bash
# rename .env.production.example to .env.production with real values, then:
npx vercel env pull .env.production   # download what's already there
# (CLI doesn't bulk-upload — paste in dashboard for first time)
```

## 4. Deploy

Preview deploy (per-branch URL):

```bash
npx vercel
```

Production deploy:

```bash
npx vercel --prod
```

Both print the URL when done. Subsequent deploys reuse the link, so
just `npx vercel --prod` from any branch.

## 5. (Optional) Hook up GitHub auto-deploy

If you push this repo to GitHub, in the Vercel dashboard:
**Project → Settings → Git → Connect Git Repository** → pick your repo.
From then on every push to `main` triggers a production deploy and every
PR gets a preview URL.

## After deploy — fixup

1. **Update `NEXT_PUBLIC_APP_URL`** in Vercel env to your real domain
   (the `vercel.app` URL, or a custom one). Required for KYC email links.
2. **Update Supabase Auth redirect URLs**:
   Supabase Studio → Authentication → URL Configuration → add the Vercel URL
   to "Redirect URLs" (otherwise auth callback breaks):
   `https://<your-vercel-url>/auth/callback`
3. **Set `Site URL`** in the same place to your Vercel URL.
4. After first real coach signup, run in Supabase SQL Editor:
   ```sql
   update public.profiles set role='admin', verification_status='active'
   where email='orvana.group@gmail.com';
   ```
5. **Comment out `MAIL_TEST_OVERRIDE_TO`** in Vercel env once you want
   real recipients to actually get their emails.

## Troubleshooting

**Build fails with "Module not found":** make sure `package-lock.json` is
committed (Vercel uses `npm ci`).

**Signup works but callback 404s:** Supabase redirect URL not whitelisted
(see fixup #2).

**KYC submit returns 401 from edge function:** the function expects a
fresh JWT. If you used `MAIL_TEST_OVERRIDE_TO` to inspect mails to a
"fake" coach, the JWT in browser is for the real account. Re-test with a
real new signup.
