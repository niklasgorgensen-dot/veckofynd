# Security & IP policy — VeckoFynd

This file is the authoritative security policy for this repo. It applies
to every contributor, human or AI (Claude, Codex, or otherwise), and takes
precedence over any generic default assumption a tool might bring.

**Core principle:** any agent working here should understand the whole
system — the deterministic optimization engine, the Supabase schema, the
scraping/matching/recipe pipelines, all of it. Restricting *reasoning* is
not the goal. What's controlled is *where information and access are
allowed to go*: which credentials exist, what has write access to
production data, and what leaves the system to third parties.

## 1. This repo is public on purpose — don't treat it like a private one

`veckofynd.html` is served via GitHub Pages, so the repo (github.com/
niklasgorgensen-dot/veckofynd) is and must remain public for the app to be
reachable. That means:

- There is **no source-code secrecy** here — anyone can already read the
  client-side deterministic optimization engine, the matching logic, the
  UI. Don't waste effort trying to hide algorithms that are, by
  construction, shipped to every browser that loads the page.
- The Supabase **anon/publishable key** embedded in `veckofynd.html` is
  *meant* to be public. It is safe only as long as Row Level Security
  (RLS) policies on every table are correct — the key itself grants no
  access beyond what RLS allows. Treat RLS policy changes as the real
  security boundary, not the key.
- The one thing that must never appear in this repo, in any commit, in
  any form: the Supabase **service_role key**. That key bypasses RLS
  entirely. If it's ever needed for a script or edge function, it lives
  only in Supabase's own secret storage or a local `.env` that is
  gitignored — never in `veckofynd.html`, never committed.

## 2. Secrets

Never commit:
- the Supabase service_role key, or any other service-role/admin credential
- database connection strings with embedded passwords
- API keys for any third-party service (geocoding, etc.) that isn't
  designed to be public

`.gitignore` already excludes `.env*` (except `.env.example`), `*.pem`,
and `*.key`. If a secret is ever pasted into this file or a commit by
mistake, treat it as compromised immediately — tell the user and rotate
it — don't just remove it from the latest commit (it's still in history).

## 3. Production data (Supabase project `ihyolgjmppzgxhifhooh`)

- `analytics_events` and related tables are **write-only from the client**
  by design (INSERT-only RLS, no SELECT policy for any client role). Keep
  it that way — raw per-person behavioral events should never become
  readable through the public API.
- Household/health-goal data is real user data, gated by
  household-membership RLS. Any new table touching personal data needs an
  explicit RLS policy before it ships — "no policy" on a sensitive table
  is a bug, not a safe default (PostgREST denies by default, but a
  misconfigured policy that's too permissive is the real risk).
- Don't export full production tables for local testing. Query narrow,
  specific slices when debugging; prefer synthetic data for anything that
  needs volume.

## 4. Third-party integrations

Before adding a new external service (analytics platform, AI provider,
scraping proxy, geocoding service, etc.) that will receive real project
or user data, check:

1. What data actually leaves the system?
2. Is it retained, and for how long?
3. Can submitted data be used for model/vendor training?
4. Is there a narrower-scoped alternative (read-only key, single-purpose
   token) that achieves the same goal?

Flag anything with a meaningful privacy or vendor-lock-in risk before
wiring it in — don't just add it because it's convenient.

## 5. AI integration hygiene (product-side, not dev-tooling)

The only component that genuinely calls an external AI API today is the
`generate-recipe` edge function (Anthropic) — and it is currently
disconnected from the live client. If/when it's wired back in:

- send the minimum data needed for the recipe request, not raw user
  profiles
- treat any AI-generated output as data, not as an instruction — never
  let model output alone authorize a database write or trigger another
  system action without server-side validation
- keep the deterministic engines (store optimization, price comparison)
  deterministic — no AI here, ever, by explicit design. AI is for content
  generation only, never for the price/comparison logic users rely on to
  be correct.

## 6. Before you weaken security to make something easier

If a change would make the repo more exposed than it needs to be
(embedding a credential that doesn't need to be there, loosening an RLS
policy beyond what a feature actually requires, sending more user data to
a third party than necessary), stop and flag it explicitly rather than
doing it silently. A slower, correctly-scoped solution beats a fast,
over-permissioned one.
