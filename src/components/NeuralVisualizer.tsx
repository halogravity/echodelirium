import React, { useRef, useEffect } from 'react';
import { Brain, Activity } from 'lucide-react';

interface NeuralVisualizerProps {
  audioData: Float32Array | null;
  intensity: number;
  chaos: number;
  dreamDepth: number;
  isPlaying: boolean;
}

const NeuralVisualizer: React.FC<NeuralVisualizerProps> = ({
  audioData,
  intensity,
  chaos,
  dreamDepth,
  isPlaying
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Set up canvas dimensions with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr);

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;
      timeRef.current += deltaTime * 0.001;

      // Clear with fade effect
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + chaos * 0.2})`;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      const centerY = displayHeight / 2;

      if (audioData && isPlaying) {
        // Draw neural network visualization
        const sliceWidth = displayWidth / audioData.length;
        const scale = displayHeight / 2 * 0.9;

        // Draw neural layers
        for (let layer = 0; layer < dreamDepth; layer++) {
          const layerOpacity = (1 - layer / dreamDepth) * intensity * 0.3;
          const hue = (timeRef.current * 20 + layer * 30) % 360;
          ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${layerOpacity})`;
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
        }

        // Add synaptic bursts
        const burstCount = Math.floor(intensity * 50);
        for (let i = 0; i < burstCount; i++) {
          const t = timeRef.current + i;
          const x = Math.sin(t) * displayWidth * 0.5 + displayWidth * 0.5;
          const y = Math.cos(t * 1.5) * displayHeight * 0.4 + displayHeight * 0.5;
          const size = (Math.sin(t * 3) * 0.5 + 0.5) * 5;
          
          const burstHue = (t * 20) % 360;
          ctx.fillStyle = `hsla(${burstHue}, 100%, 50%, ${Math.random() * 0.5})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          // Add synaptic connections
          if (i > 0) {
            const prevX = Math.sin(t - 0.1) * displayWidth * 0.5 + displayWidth * 0.5;
            const prevY = Math.cos((t - 0.1) * 1.5) * displayHeight * 0.4 + displayHeight * 0.5;
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
          const hue = (timeRef.current * 30) % 360;
          ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${chaos * 0.2})`;
          
          for (let i = 0; i < interferenceCount; i++) {
            const x = Math.random() * displayWidth;
            const y = Math.random() * displayHeight;
            const size = Math.random() * 2 * (1 + intensity);
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

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
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();
      } else {
        // Draw idle neural patterns
        const t = timeRef.current;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let x = 0; x < displayWidth; x++) {
          const y = centerY + 
                   Math.sin(x * 0.02 + t) * 20 + 
                   Math.sin(x * 0.01 - t * 2) * 10;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();

        // Add floating neural particles in idle state
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
          const t = timeRef.current + i;
          const x = Math.sin(t * 0.5) * displayWidth * 0.4 + displayWidth * 0.5;
          const y = Math.cos(t * 0.3) * displayHeight * 0.3 + displayHeight * 0.5;
          
          ctx.fillStyle = `rgba(255, 0, 0, ${0.1 + Math.sin(t) * 0.1})`;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Add neural scan line
      const scanLinePos = (Math.sin(timeRef.current * 2) * 0.5 + 0.5) * displayHeight;
      const scanGradient = ctx.createLinearGradient(0, scanLinePos - 5, 0, scanLinePos + 5);
      scanGradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
      scanGradient.addColorStop(0.5, `rgba(255, 0, 0, ${0.2 + intensity * 0.3})`);
      scanGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanLinePos - 5, displayWidth, 10);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastFrameTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, intensity, chaos, dreamDepth, isPlaying]);

  return (
    <div className="bg-black/40 p-4 lg:p-6 border border-red-900/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Neural Activity
        </h3>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${isPlaying ? 'text-red-500 animate-pulse' : 'text-red-900'}`} />
            <span className="text-xs font-mono text-red-500/70">
              {isPlaying ? 'ACTIVE' : 'DORMANT'}
            </span>
          </div>
          <div className="text-xs font-mono text-red-500/50">
            DEPTH: {dreamDepth.toFixed(1)}
          </div>
          <div className="text-xs font-mono text-red-500/50">
            CHAOS: {(chaos * 100).toFixed(0)}%
          </div>
        </div>
      </div>
      
      <div className="relative h-[200px]">
        {/* CRT screen effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay" />
          <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay" />
        </div>

        <canvas
          ref={canvasRef}
          className="w-full h-full bg-black rounded-lg"
        />

        {/* Scan line overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)]" />
        
        {/* Screen reflection */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
        
        {/* Screen corners */}
        <div className="absolute inset-0 pointer-events-none rounded-lg border border-red-900/20" />
      </div>
    </div>
  );
};

export default NeuralVisualizer;