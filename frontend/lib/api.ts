/**
 * Backend API base URL.
 * - Local: http://localhost:5001
 * - Production: set NEXT_PUBLIC_API_URL in Vercel to your Render backend URL (e.g. https://your-app.onrender.com)
 */
export const API_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:5001';
