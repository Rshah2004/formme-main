import { estimateCost } from './pricing.ts';

interface Grant { tokenHash: string; expiresAt: string; label: string }

export function createHandler(getGrants: () => string, now = () => Date.now()) {
  return async (req: Request): Promise<Response> => {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    };
    const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (req.method === 'OPTIONS') return new Response(null, { headers });
    if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
    try {
      let body;
      try { body = await req.json(); } catch { return reply({ error: 'Invalid request' }, 400); }
      const { token, garment, decoration, quantity } = body ?? {};
      if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
        return reply({ status: 'denied' }, 403);
      }
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
      const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      const grants: Grant[] = JSON.parse(getGrants());
      const grant = grants.find(g => g.tokenHash === hash);
      if (!grant) return reply({ status: 'denied' }, 403);
      const expires = Date.parse(grant.expiresAt);
      if (!Number.isFinite(expires) || now() >= expires) return reply({ status: 'expired' }, 403);
      if (!['tshirt', 'hoodie'].includes(garment) || !['printing', 'printing-embroidery'].includes(decoration)
        || !Number.isSafeInteger(quantity) || quantity < 1) return reply({ error: 'Invalid configuration' }, 400);
      const result = estimateCost(garment, decoration, quantity);
      // Return only customer-facing prices; never expose commissions or the rate table.
      return reply({ status: result.status, expiresAt: grant.expiresAt, label: grant.label,
        ...(result.status === 'ok' ? { unitPrice: result.estimate.unitPrice, totalPrice: result.estimate.totalPrice } : {}) });
    } catch {
      return reply({ error: 'Cost predictor is temporarily unavailable' }, 503);
    }
  };
}
