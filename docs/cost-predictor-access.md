# Temporary Cost Predictor link

The `/cost-predictor` route checks the URL fragment against the allowlist in `src/data/costPredictorAccess.ts`. A matching token opens the existing calculator; missing or incorrect tokens show the public request-access page. Calculations run in the frontend without Supabase requests, secrets, or database access.

To remove club access on Monday, remove the token from `CLUB_ACCESS_TOKENS` and redeploy the frontend. There is no automatic expiry. This is a convenience gate: the token and pricing are inspectable in the downloaded JavaScript, and removal cannot recall an already downloaded copy.

The displayed unit price is the spreadsheet's customer-facing rate, with commission already included. Total price is exactly `unitPrice * quantity`; commission is never added on top. For example, 50 printed T-shirts cost $12.00 each and $600.00 total; 100 cost $8.50 each and $850.00 total.

The earlier Supabase function and grant scripts are unused by this temporary frontend flow.
