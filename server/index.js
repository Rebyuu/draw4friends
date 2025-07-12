const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });
console.log('✅ WebSocket-Server läuft auf ws://localhost:3001');

let clientCounter = 0;

wss.on('connection', (ws) => {
  // 🔢 Eindeutige ID zuweisen
  ws.id = ++clientCounter;
  console.log(`🟢 Client #${ws.id} verbunden`);

  ws.on('message', (message) => {
    console.log(`📨 Nachricht von Client #${ws.id}: ${message}`);

    // 🔁 Broadcast an alle anderen Clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log(`🔴 Client #${ws.id} getrennt`);
  });
});

