const WebSocket = require('ws');
const fs = require('fs');
const PORT = process.env.PORT || 3001;
const SAVE_PATH = './canvas_data.json';
const wss = new WebSocket.Server({ port: PORT });

console.log('✅ WebSocket-Server läuft auf port ${PORT}');

let clientCounter = 0;

wss.on('connection', (ws) => {
  ws.id = ++clientCounter;
  console.log(`🟢 Client #${ws.id} verbunden`);

  // Beim Verbindungsaufbau: Zeichnungsdaten laden
  ws.send(JSON.stringify({ type: 'init', data: loadCanvasData() }));

  ws.on('message', (message) => {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch (e) {
      return;
    }

    // Optional speichern
    if (parsed.type !== 'clear' && parsed.save) {
      saveCanvasData(parsed);
    }

    // Broadcast an alle (inkl. clear)
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    if (parsed.type === 'clear') {
      clearCanvasData();
    }
  });

  ws.on('close', () => {
    console.log(`🔴 Client #${ws.id} getrennt`);
  });
});

// Speicherung (anhängen an Datei)
function saveCanvasData(entry) {
  const existing = loadCanvasData();
  existing.push(entry);
  fs.writeFileSync(SAVE_PATH, JSON.stringify(existing));
}

function loadCanvasData() {
  if (!fs.existsSync(SAVE_PATH)) return [];
  return JSON.parse(fs.readFileSync(SAVE_PATH));
}

function clearCanvasData() {
  fs.writeFileSync(SAVE_PATH, '[]');
}


