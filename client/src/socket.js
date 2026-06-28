import { io } from 'socket.io-client';

const socket = io({
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
});

// Auto-reconnect when tab becomes visible again (mobile tab switch)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && socket.connected === false) {
      socket.connect();
    }
  });
}

export default socket;
