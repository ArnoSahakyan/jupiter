// The refresh token lives in an httpOnly cookie, so page scripts (and any
// XSS) can't read it. It is only sent to /api/auth/* routes.

const REFRESH_COOKIE = 'jupiter_rt';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const cookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  // "lax" works when the frontend and API share a site: localhost in
  // development, or a same-domain proxy in production (see the frontend's
  // vercel.json). Set REFRESH_COOKIE_SAMESITE=none for a cross-site setup.
  const sameSite = (process.env.REFRESH_COOKIE_SAMESITE || 'lax').toLowerCase();
  const secure = process.env.REFRESH_COOKIE_SECURE
    ? process.env.REFRESH_COOKIE_SECURE === 'true'
    : isProduction || sameSite === 'none';
  return { httpOnly: true, secure, sameSite, path: '/api/auth' };
};

const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE, token, { ...cookieOptions(), maxAge: ONE_DAY_MS });

const clearRefreshCookie = (res) => res.clearCookie(REFRESH_COOKIE, cookieOptions());

const readRefreshCookie = (req) => req.cookies?.[REFRESH_COOKIE];

module.exports = { setRefreshCookie, clearRefreshCookie, readRefreshCookie };
