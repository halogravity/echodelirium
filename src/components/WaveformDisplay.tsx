import React, { useRef, useEffect } from 'react';

interface WaveformDisplayProps {
  audioData: Float32Array | null;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  isPlaying?: boolean;
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ 
  audioData, 
  width = 800, // Increased width for better resolution
  height = 120,
  color = '#ff1f1f',
  backgroundColor = '#0a0a0a',
  isPlaying = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  const lastWaveformRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create offscreen canvas for persistence effect
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = width;
      offscreenCanvasRef.current.height = height;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    const offscreenCtx = offscreenCanvasRef.current.getContext('2d', { alpha: false });
    if (!ctx || !offscreenCtx) return;

    // Configure canvas for crisp lines
    ctx.imageSmoothingEnabled = false;
    offscreenCtx.imageSmoothingEnabled = false;

    const drawGrid = (context: CanvasRenderingContext2D) => {
      // Clear with base color
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);

      // Draw grid lines
      const drawGridLines = (spacing: number, color: string, lineWidth: number) => {
        context.strokeStyle = color;
        context.lineWidth = lineWidth;

        // Vertical lines
        for (let x = 0; x <= width; x += spacing) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x, height);
          context.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= height; y += spacing) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(width, y);
          context.stroke();
        }
      };

      // Draw minor grid
      drawGridLines(20, '#0d0808', 0.5);
      
      // Draw major grid
      drawGridLines(100, '#1a0f0f', 1);

      // Center lines
      context.strokeStyle = '#2a1515';
      context.lineWidth = 1;
      
      // Vertical center
      context.beginPath();
      context.moveTo(width / 2, 0);
      context.lineTo(width / 2, height);
      context.stroke();

      // Horizontal center
      context.beginPath();
      context.moveTo(0, height / 2);
      context.lineTo(width, height / 2);
      context.stroke();
    };

    const drawWaveform = (context: CanvasRenderingContext2D, data: Float32Array) => {
      context.strokeStyle = color;
      context.lineWidth = 1.5;
      context.shadowColor = color;
      context.shadowBlur = 8;
      context.beginPath();

      const sliceWidth = width / data.length;
      const centerY = height / 2;
      const scale = height / 2 * 0.9; // Scale to 90% of half height

      let x = 0;
      context.moveTo(0, centerY);

      for (let i = 0; i < data.length; i++) {
        const y = centerY + data[i] * scale;
        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
        x += sliceWidth;
      }

      context.stroke();
    };

    const animate = () => {
      if (!ctx || !offscreenCtx) return;

      // Draw base grid
      drawGrid(ctx);

      if (isPlaying && audioData) {
        // Update offscreen canvas with new waveform
        drawGrid(offscreenCtx);
        drawWaveform(offscreenCtx, audioData);
        lastWaveformRef.current = audioData;
      } else if (lastWaveformRef.current) {
        // Keep showing last waveform with fade effect
        const imageData = offscreenCtx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Apply fade effect
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, data[i] - 1);     // R
          data[i + 1] = Math.max(0, data[i + 1] - 1); // G
          data[i + 2] = Math.max(0, data[i + 2] - 1); // B
        }
        
        offscreenCtx.putImageData(imageData, 0, 0);
      }

      // Copy offscreen canvas to main canvas
      ctx.drawImage(offscreenCanvasRef.current, 0, 0);

      // Add scan line effect
      const scanLinePos = (Date.now() % 1000) / 1000 * height;
      ctx.fillStyle = `rgba(255, 31, 31, 0.1)`;
      ctx.fillRect(0, scanLinePos, width, 2);

      // Add CRT edge effect
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 1.5
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, width, height, color, backgroundColor, isPlaying]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black/40 p-4">
      {/* CRT screen effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay" />
        <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay" />
      </div>

      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full bg-[#0a0a0a] rounded-lg"
      />

      {/* Scan line overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)]" />
      
      {/* Screen reflection */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
      
      {/* Screen corners */}
      <div className="absolute inset-0 pointer-events-none rounded-lg border border-red-900/20" />
    </div>
  );
};

export default WaveformDisplay;