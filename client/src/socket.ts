let socket: WebSocket;

export const getSocket = () => {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    const url =
      import.meta.env.MODE === "production"
        ? "wss://draw4friends-backend.onrender.com" // Render-Backend
        : "ws://localhost:3001"; // local Backend

    socket = new WebSocket(url);
  }
  return socket;
};

