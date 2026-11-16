// Keeps users' online status in sync with whether they actually have the app
// open. The frontend holds one socket connection while you're logged in.
//
// - When your last connection closes (closed tab, lost network) and stays
//   closed for OFFLINE_DELAY_MS, you're marked offline. The delay covers page
//   reloads, which briefly disconnect.
// - When you connect again you're marked online, but only if it was this code
//   that marked you offline. Choosing "offline" yourself is respected.
//
// State is in memory, so it assumes a single server process.

const OFFLINE_DELAY_MS = 10 * 1000;

module.exports = function registerPresence(io, db, { offlineDelayMs = OFFLINE_DELAY_MS } = {}) {
  const connections = new Map();   // userId -> number of open sockets
  const offlineTimers = new Map(); // userId -> pending "mark offline" timer
  const autoOffline = new Set();   // users this code marked offline

  const setStatus = (userId, onlineStatus) =>
    db.user.update({ onlineStatus }, { where: { id: userId } });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    connections.set(userId, (connections.get(userId) || 0) + 1);
    clearTimeout(offlineTimers.get(userId));
    offlineTimers.delete(userId);

    socket.on('disconnect', () => {
      const remaining = (connections.get(userId) || 1) - 1;
      if (remaining > 0) {
        connections.set(userId, remaining);
        return;
      }
      connections.delete(userId);
      offlineTimers.set(userId, setTimeout(async () => {
        offlineTimers.delete(userId);
        if (connections.has(userId)) return;
        try {
          const user = await db.user.findByPk(userId, { attributes: ['onlineStatus'] });
          if (user && user.onlineStatus !== 'offline') {
            await setStatus(userId, 'offline');
            autoOffline.add(userId);
          }
        } catch (error) {
          console.error('Error updating presence:', error);
        }
      }, offlineDelayMs));
    });

    try {
      if (autoOffline.has(userId)) {
        autoOffline.delete(userId);
        await setStatus(userId, 'online');
      }
      const user = await db.user.findByPk(userId, { attributes: ['onlineStatus'] });
      if (user) socket.emit('presence', { onlineStatus: user.onlineStatus });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  });
};
