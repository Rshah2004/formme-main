import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Quote = { status: string; expiresAt?: string; unitPrice?: number; totalPrice?: number };

export function useCostPredictorAccess(garment: string, decoration: string, quantity: number) {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('access'));
  const [result, setResult] = useState<Quote | null>(null);
  const [resultKey, setResultKey] = useState('');
  const key = `${garment}:${decoration}:${quantity}`;
  useEffect(() => {
    if (!token) return;
    let active = true;
    let expiryTimer: ReturnType<typeof setTimeout>;
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('cost-predictor', {
          body: { token, garment, decoration, quantity },
        });
        let response: Quote = data;
        if (error) {
          response = { status: 'error' };
          if (error.context instanceof Response) {
            const body = await error.context.json();
            if (['expired', 'denied'].includes(body.status)) response = body;
          }
        }
        if (!active) return;
        setResult(response ?? { status: 'error' });
        setResultKey(key);
        if (response?.expiresAt) {
          const clearAtExpiry = () => {
            const delay = Date.parse(response.expiresAt!) - Date.now();
            if (delay <= 0) setResult({ status: 'expired' });
            else expiryTimer = setTimeout(clearAtExpiry, Math.min(delay, 2147483647));
          };
          clearAtExpiry();
        }
      } catch {
        if (active) { setResult({ status: 'error' }); setResultKey(key); }
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); clearTimeout(expiryTimer); };
  }, [token, garment, decoration, quantity, key]);
  return { hasAccessLink: Boolean(token), quote: resultKey === key ? result : null };
}
