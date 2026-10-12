# The Practice Room — Cloudflare Pages Deployment

This is your Practice Room app, adapted to run on Cloudflare Pages instead of
Claude. The app itself is unchanged — same metronome, tuner, practice log,
streaks, mascots, scales, classrooms, everything. Only the storage layer
changed under the hood: it now uses Cloudflare KV (via a small Pages
Function) for shared class data, and the browser's own local storage for
each device's personal login. No separate backend service to manage.

## What's in this folder
- `index.html` — the whole app (open this locally to preview, though shared
  data won't work until deployed — more on that below)
- `functions/api/storage.js` — a Cloudflare Pages Function that reads/writes
  a KV namespace for all the shared data (rosters, practice logs,
  assignments, classrooms)

## One-time setup (about 10 minutes)

### 1. Create a free Cloudflare account
If you don't already have one: https://dash.cloudflare.com/sign-up

### 2. Create a KV namespace
1. In the Cloudflare dashboard's left sidebar, look for **Workers KV**
   (it's usually grouped under a "Storage & Databases" section — it's its
   own page now, not nested inside Workers & Pages).
2. Click **Create instance**.
3. Name it something like `practice_room_kv` and click **Create**.

### 3. Create the Pages project
1. Still in **Workers & Pages**, click **Create application** → **Pages**.
2. Choose **Upload assets** (no GitHub needed).
3. Upload this whole folder (the one with `index.html` and the `functions`
   folder inside it) — make sure `index.html` ends up at the top level.
4. Give the project a name (this becomes part of your URL, e.g.
   `practice-room.pages.dev`) and deploy.

### 4. Bind the KV namespace to the project
This is the step that makes shared data actually work — skipping it means
the app runs but nothing saves.
1. Open your new Pages project → **Settings** → **Bindings**.
2. Click **Add** → **KV namespace**.
3. Variable name: `PRACTICE_KV` (must match exactly — this is what the code
   looks for).
4. KV namespace: select the one you created in step 2.
5. Save.
6. **Redeploy the project** (bindings only take effect on a fresh
   deployment — retry the last deployment or re-upload).

### 5. Test it
Visit your `*.pages.dev` URL. Try:
- Entering as the teacher, creating a class, copying the invite code
- Opening the link in a different browser/private window as a student,
  joining, logging a practice session
- Confirming the teacher view sees that student show up

If a student joining doesn't show up for the teacher, double check the KV
binding's variable name is exactly `PRACTICE_KV` and that you redeployed
after adding it.

## Optional: custom domain
Once it's working on the `.pages.dev` URL, you can attach your own domain
under the Pages project's **Custom domains** tab, if you have one through
Cloudflare or elsewhere.

## A couple of real differences from the Claude version
- **No login wall.** This was actually the point — Cloudflare Pages has no
  concept of a Claude account, so there's nothing to prompt anyone to sign
  into. The class code is still the only thing gating access.
- **Personal login is now per-device, not per-account.** Since there's no
  Claude account to tie a "logged in as" state to, that now lives in the
  browser's local storage instead. Practically: if a student uses the app
  on their phone and then later opens it on a school iPad, they'll need to
  pick their name again there — it won't remember them across devices the
  way it might have before. Their practice history is untouched either way,
  since that's still stored centrally in KV.
- **Microphone (tuner) and everything else works the same** — Cloudflare
  Pages serves over HTTPS by default, which is what the tuner needs.
