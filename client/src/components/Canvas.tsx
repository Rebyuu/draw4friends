import React, { useRef, useState } from 'react';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');


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
};

  const draw = (e: React.MouseEvent) => {
  if (!isDrawing) return;

  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;

  const x = e.nativeEvent.offsetX;
  const y = e.nativeEvent.offsetY;

  ctx.lineTo(x, y);
  ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round'; 
  ctx.stroke();
};

  const stopDrawing = () => {
  setIsDrawing(false);
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;

  ctx.closePath();
};

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
