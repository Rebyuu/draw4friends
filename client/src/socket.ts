let socket: WebSocket;


export const getSocket = () => {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket('wss://draw4friends-backend.onrender.com:3001');
  }
  return socket;
};
