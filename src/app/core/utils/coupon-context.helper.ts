const KEY = 'kg_applied_coupon';

type StoredCoupon = { code: string; exp: number }; // simple TTL

// 30 minutes default TTL
export function rememberAppliedCoupon(code: string, ttlMs = 30 * 60 * 1000): void {
  const trimmed = (code || '').trim().toUpperCase();
  if (!trimmed) return;
  const data: StoredCoupon = { code: trimmed, exp: Date.now() + ttlMs };
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearAppliedCoupon(): void {
  localStorage.removeItem(KEY);
}

export function getAppliedCouponCode(): string | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const { code, exp } = JSON.parse(raw) as StoredCoupon;
    if (!code || Date.now() > exp) { localStorage.removeItem(KEY); return null; }
    return code;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}
