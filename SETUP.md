# CQ Tides — Backend Setup Guide

## Overview
The app works fully offline with hardcoded data. Connecting Supabase lets
you edit fishing spots, bait recommendations and retailers live — without
touching code or redeploying.

---

## 1 · Create a Supabase project (free)

1. Go to <https://supabase.com> and sign up / sign in.
2. Click **New project**, choose a name (e.g. `cq-tides`), set a DB password, pick the **Sydney** region.
3. Wait ~2 minutes for provisioning.

---

## 2 · Create the `app_config` table

In your Supabase project open **SQL Editor** and run:

```sql
create table if not exists app_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now()
);

alter table app_config enable row level security;

-- anyone can read (the live app uses this)
create policy "public_read"
  on app_config for select using (true);
```

---

## 3 · Fill in `config.js`

In your project open **Project Settings → API** and copy:

| Field | Where to find it |
|-------|-----------------|
| `supabase_url` | Project URL |
| `supabase_anon_key` | `anon` / `public` key |

Paste them into `config.js`:

```js
const APP_CONFIG = {
  supabase_url:      'https://YOUR_REF.supabase.co',
  supabase_anon_key: 'YOUR_ANON_KEY',
};
```

---

## 4 · Seed the initial data

1. Open `admin.html` in your browser (or `http://localhost:8082/admin.html`).
2. When prompted for a key, enter your **service_role** key  
   *(Project Settings → API → service_role — keep this secret)*.
3. Click **"Seed Defaults → Supabase"** to push the built-in fishing data.
4. You can now edit Spots, Bait & Lures, and Retailers from the admin panel
   and click **Save** — the live site will reflect changes on next page load.

---

## 5 · Redeploy to Netlify

After updating `config.js`, drag and drop the folder to  
<https://app.netlify.com/drop> again (or push to GitHub if connected).

---

## Admin panel password
The admin panel requires your **Supabase service_role key** as the password.
This key is never stored on disk — only in your browser's `sessionStorage`
for the duration of the tab session.
