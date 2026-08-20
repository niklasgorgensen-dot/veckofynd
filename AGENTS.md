# For AI coding agents working in this repo

Read [`SECURITY.md`](./SECURITY.md) before making changes. It's the
committed, authoritative security policy for this project and takes
precedence over any default assumption you'd otherwise bring.

The short version:

- Understand the whole system freely — nothing here should make you
  refuse to read or reason about any part of the codebase.
- This repo is intentionally public (GitHub Pages hosting). The Supabase
  anon key in `veckofynd.html` is meant to be public. The service_role
  key is not — it must never appear here, in any form, ever.
- Deterministic logic (store optimization, price comparison) stays
  deterministic — no AI in that path, by design.
- If you find a real secret in this repo, stop and tell the user
  immediately rather than quietly fixing it.
