/**
 * Backend API base URL.
 * - Server: from env. Client: from window (injected by layout so it works even if env was set after build).
 * - Set NEXT_PUBLIC_API_URL in Vercel to your Render URL (e.g. https://care-equity-drct.onrender.com).
 */
function getApiBase(): string {
  if (typeof window !== 'undefined' && (window as unknown as { __CARE_EQUITY_API_BASE__?: string }).__CARE_EQUITY_API_BASE__) {
    return (window as unknown as { __CARE_EQUITY_API_BASE__: string }).__CARE_EQUITY_API_BASE__;
  }
  return (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:5001';
}

export const API_BASE = getApiBase();
