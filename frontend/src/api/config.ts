// Where the API and the chat socket live.
// - VITE_API_URL: REST API base. Set it to "" in production when /api is
//   proxied through the frontend's own domain (see vercel.json); that keeps
//   the refresh-token cookie first-party in every browser.
// - VITE_SOCKET_URL: Socket.IO server (proxies like Vercel rewrites don't
//   carry WebSockets, so this always points at the backend directly).
// Both fall back to VITE_BACK_BASE_URL.
const backend = import.meta.env.VITE_BACK_BASE_URL ?? '';

export const API_URL: string = import.meta.env.VITE_API_URL ?? backend;
export const SOCKET_URL: string = import.meta.env.VITE_SOCKET_URL ?? backend;
