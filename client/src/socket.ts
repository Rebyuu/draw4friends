let socket: WebSocket;

export const getSocket = () => {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket('ws://localhost:3001');
  }
  return socket;
};
