import React, { useRef, useEffect } from 'react';
import { Brain } from 'lucide-react';

interface HallucinationViewerProps {
  audioData: Float32Array | null;
  intensity: number;
  chaos: number;
  dreamDepth: number;
  isPlaying: boolean;
}

const HallucinationViewer: React.FC<HallucinationViewerProps> = ({
  audioData,
  intensity,
  chaos,
  dreamDepth,
  isPlaying
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    const drawFrame = (timestamp: number) => {
      timeRef.current = timestamp * 0.001; // Convert to seconds

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      if (audioData && audioData.length > 0) {
        const sliceWidth = width / audioData.length;
        const scale = height / 2 * 0.9;

        // Draw main waveform with dynamic color
        const hue = (timeRef.current * 20) % 360;
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${0.3 + intensity * 0.7})`;
        ctx.lineWidth = 2;
        ctx.beginPath();

        audioData.forEach((sample, i) => {
          const x = i * sliceWidth;
          const t = timeRef.current + i * 0.01;
          
          // Add chaos modulation
          const chaosModulation = Math.sin(t * chaos * 5) * chaos * 20;
          const intensityModulation = Math.sin(t * 2) * intensity * 10;
          
          const y = centerY + (sample * scale * (1 + intensity * 0.5)) + 
                   chaosModulation + intensityModulation;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Add dynamic curve tension based on chaos
            const tension = 0.3 + chaos * 0.7;
            const prevX = (i - 1) * sliceWidth;
            const prevY = centerY + audioData[i-1] * scale;
            const cpx = prevX + (x - prevX) * tension;
            const cpy = prevY + (y - prevY) * tension;
            ctx.quadraticCurveTo(cpx, cpy, x, y);
          }
        });

        ctx.stroke();

        // Draw neural activity layers
        for (let layer = 1; layer <= dreamDepth; layer++) {
          const layerOpacity = (1 - layer / dreamDepth) * intensity * 0.3;
          const layerHue = (hue + layer * 30) % 360;
          ctx.strokeStyle = `hsla(${layerHue}, 100%, 50%, ${layerOpacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();

          audioData.forEach((sample, i) => {
            const x = i * sliceWidth;
            const t = timeRef.current + i * 0.01 + layer * 0.2;
            
            // Create neural-like patterns
            const neuralOffset = Math.sin(t * 2 + layer) * layer * 5 * intensity;
            const chaosOffset = Math.cos(t * chaos * 3) * chaos * 15;
            const y = centerY + 
                     (sample * scale * 0.5) + 
                     neuralOffset + 
                     chaosOffset;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });

          ctx.stroke();
        }

        // Add synaptic bursts
        const burstCount = Math.floor(intensity * 50);
        for (let i = 0; i < burstCount; i++) {
          const t = timeRef.current + i;
          const x = Math.sin(t) * width * 0.5 + width * 0.5;
          const y = Math.cos(t * 1.5) * height * 0.4 + height * 0.5;
          const size = (Math.sin(t * 3) * 0.5 + 0.5) * 5;
          
          const burstHue = (hue + i * 20) % 360;
          ctx.fillStyle = `hsla(${burstHue}, 100%, 50%, ${Math.random() * 0.5})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          // Add synaptic connections
          if (i > 0) {
            const prevX = Math.sin(t - 0.1) * width * 0.5 + width * 0.5;
            const prevY = Math.cos((t - 0.1) * 1.5) * height * 0.4 + height * 0.5;
            ctx.strokeStyle = `hsla(${burstHue}, 100%, 50%, ${Math.random() * 0.3})`;
            ctx.lineWidth = Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }

        // Add chaos interference patterns
        if (chaos > 0) {
          const interferenceCount = Math.floor(chaos * 100);
          ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${chaos * 0.2})`;
          
          for (let i = 0; i < interferenceCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 * (1 + intensity);
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Add neural scan line
      const scanLinePos = (Math.sin(timeRef.current * 2) * 0.5 + 0.5) * height;
      const scanGradient = ctx.createLinearGradient(0, scanLinePos - 5, 0, scanLinePos + 5);
      scanGradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
      scanGradient.addColorStop(0.5, `rgba(255, 0, 0, ${0.2 + intensity * 0.3})`);
      scanGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanLinePos - 5, width, 10);

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    if (isPlaying) {
      drawFrame(0);
    } else {
      // Draw idle state
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw idle neural patterns
      const t = Date.now() * 0.001;
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < width; i++) {
        const x = i;
        const y = centerY + 
                 Math.sin(i * 0.02 + t) * 20 + 
                 Math.sin(i * 0.01 - t * 2) * 10;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, intensity, chaos, dreamDepth, isPlaying]);

  return (
    <div className="bg-black/40 p-4 lg:p-6 border border-red-900/20">
      <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4" />
        Neural Activity
      </h3>
      
      <div className="relative">
        {/* CRT screen effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay" />
          <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay" />
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-full bg-black rounded-lg"
        />

        {/* Scan line overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)]" />
        
        {/* Screen reflection */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
        
        {/* Screen corners */}
        <div className="absolute inset-0 pointer-events-none rounded-lg border border-red-900/20" />

        {/* Status indicators */}
        <div className="absolute bottom-4 left-4 flex gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-red-900'}`} />
            <span className="text-red-500/70">
              {isPlaying ? 'ACTIVE' : 'DORMANT'}
            </span>
          </div>
          <div className="text-red-500/50">
            DEPTH: {dreamDepth.toFixed(1)}
          </div>
          <div className="text-red-500/50">
            CHAOS: {(chaos * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallucinationViewer;