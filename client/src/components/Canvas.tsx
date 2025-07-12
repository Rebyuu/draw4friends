import React, { useRef, useState, useEffect } from 'react';
import { getSocket } from '../socket.ts';

// Canvas component for drawing
const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.addEventListener('open', () => {
      console.log('✅ WebSocket verbunden');
    });

    socket.addEventListener('close', () => {
      console.log('🔴 WebSocket getrennt');
    });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;


    /* --------------- draw incoming messages from the WebSocket ----------------- */
    const handleMessage = async (event: MessageEvent) => {
      const text = await event.data.text();
      const msg = JSON.parse(text);
      
      const ctx = canvasRef.current?.getContext('2d');
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      if (msg.type === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const { fromX, fromY, toX, toY, color: strokeColor, width } = msg;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX + 0.1, toY + 0.1); // Start with a tiny line to ensure the stroke is visible or create a dot from incoming data
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    };

    const messageListener = (event: MessageEvent) => {
      handleMessage(event);
    };

    socket.addEventListener('message', messageListener);
    return () => {
      socket.removeEventListener('message', messageListener);
    };
  }, []);


  /* ---------------- Drawing Logic ---------------- */
  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1); // Start with a tiny line to ensure the stroke is visible or create a dot
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = lineWidth+2;
    ctx.lineCap = 'round';
    ctx.stroke();

    setIsDrawing(true);
    setLastPoint({ x, y });
    //socket connection to send drawing data

    socketRef.current?.send(
      JSON.stringify({
        fromX: x,
        fromY: y,
        toX: x + 0.1,
        toY: y + 0.1,
        color: tool === 'eraser' ? '#FFFFFF' : color,
        width: lineWidth,
      })
    );
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    
    if (!lastPoint) return;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round'; 
    ctx.stroke();
    
    //socket connection to send drawing data
    socketRef.current?.send(
      JSON.stringify({
        fromX: lastPoint.x,
        fromY: lastPoint.y,
        toX: e.nativeEvent.offsetX,
        toY: e.nativeEvent.offsetY,
        color: tool === 'eraser' ? '#FFFFFF' : color,
        width: lineWidth,
      })
    );
    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
  };


  /* ---------------- Tools ---------------- */
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    socketRef.current?.send(JSON.stringify({ type: 'clear' }));
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'zeichnung.png';
    link.click();
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <label>Farbe:</label>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        <label style={{ marginLeft: '10px' }}>Strichstärke:</label>
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={e => setLineWidth(Number(e.target.value))}
        />
        <button onClick={clearCanvas} style={{ marginLeft: '10px' }}>
          Löschen
        </button>
        <button onClick={saveCanvas} style={{ marginLeft: '10px' }}>
          Speichern
        </button>
        <button onClick={() => setTool('pen')} style={{ marginLeft: '10px', backgroundColor: tool === 'pen' ? '#ccc' : undefined }}>
          ✏️ Stift
        </button>
        <button onClick={() => setTool('eraser')} style={{ marginLeft: '5px', backgroundColor: tool === 'eraser' ? '#ccc' : undefined }}>
          🧽 Radiergummi
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{ border: '1px solid black', background: '#fff' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default Canvas;
