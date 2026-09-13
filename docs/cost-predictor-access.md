# Cost Predictor access

Public visitors see the access request. A private link carries a random 256-bit token in its URL fragment (not in the URL sent to the web host). The Edge Function hashes the token and checks its grant and expiry on every calculation. Rates and commissions are kept in the Edge Function; only the requested customer-facing unit price and total are returned. Anyone holding a link can use it until expiry or revocation.

## Issue and deploy

Keep the grants file outside the repository. Reuse the same file for subsequent grants: setting this secret replaces the entire registry. If another operator already manages grants, obtain their current registry first.

```sh
node scripts/cost-predictor-access.mjs issue /private/tmp/club-grants.env "Club trial" 2026-09-15T07:00:00Z
supabase secrets set --project-ref vesanimmcimrbbrgjuun --env-file /private/tmp/club-grants.env
supabase functions deploy cost-predictor --project-ref vesanimmcimrbbrgjuun
```

This expiry allows all of Monday, September 14, 2026 in Vancouver; access stops at midnight starting Tuesday. Deploy the frontend through the site's usual Vercel deployment process, then verify the generated link before sharing it. No database migration is needed. The function is configured without Supabase JWT verification because the club token is its authorization; it grants no other application access.

## Revoke early

```sh
node scripts/cost-predictor-access.mjs revoke /private/tmp/club-grants.env "Club trial"
supabase secrets set --project-ref vesanimmcimrbbrgjuun --env-file /private/tmp/club-grants.env
```

Revocation blocks subsequent estimates. Already viewed prices cannot be recalled. The page clears its current estimate at expiry, and the server independently enforces the cutoff. Refresh after a temporary connection error to retry.

## Verify

```sh
node scripts/test-cost-predictor.mjs
npm run build
```

Before sharing, check the live link and the public page, change quantity and garment, and test a separate short-lived grant to verify expiry. Keep the grants registry and generated links private.
