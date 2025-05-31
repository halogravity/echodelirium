import React, { useRef, useEffect } from 'react';
import { Brain, Activity } from 'lucide-react';

interface OscilloscopeProps {
  audioData: Float32Array | null;
  intensity: number;
  chaos: number;
  dreamDepth: number;
  isPlaying: boolean;
}

const Oscilloscope: React.FC<OscilloscopeProps> = ({
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas dimensions with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;
      timeRef.current += deltaTime * 0.001;

      // Clear with fade effect
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + chaos * 0.2})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.height / 2;

      if (audioData && isPlaying) {
        // Draw active waveform
        const sliceWidth = canvas.width / audioData.length;
        const scale = canvas.height / 2 * 0.9;

        // Main waveform
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 40, 40, ${0.5 + intensity * 0.5})`;
        ctx.lineWidth = 2;

        audioData.forEach((sample, i) => {
          const x = i * sliceWidth;
          const t = timeRef.current + i * 0.01;
          const chaosOffset = Math.sin(t * chaos * 5) * chaos * 20;
          const intensityMod = Math.sin(t * 2) * intensity * 10;
          
          const y = centerY + 
                   (sample * scale * (1 + intensity * 0.5)) + 
                   chaosOffset + 
                   intensityMod;

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

        // Neural layers
        for (let layer = 0; layer < dreamDepth; layer++) {
          const layerOpacity = (1 - layer / dreamDepth) * intensity * 0.3;
          ctx.strokeStyle = `rgba(255, ${40 + layer * 20}, ${40 + layer * 20}, ${layerOpacity})`;
          ctx.beginPath();

          audioData.forEach((sample, i) => {
            const x = i * sliceWidth;
            const t = timeRef.current + i * 0.01 + layer * 0.2;
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

        // Neural particles
        const particleCount = Math.floor(intensity * 50);
        for (let i = 0; i < particleCount; i++) {
          const t = timeRef.current + i;
          const x = Math.sin(t) * canvas.width * 0.5 + canvas.width * 0.5;
          const y = Math.cos(t * 1.5) * canvas.height * 0.4 + canvas.height * 0.5;
          const size = (Math.sin(t * 3) * 0.5 + 0.5) * 5;
          
          ctx.fillStyle = `rgba(255, 40, 40, ${Math.random() * 0.5})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          // Neural connections
          if (i > 0) {
            const prevX = Math.sin(t - 0.1) * canvas.width * 0.5 + canvas.width * 0.5;
            const prevY = Math.cos((t - 0.1) * 1.5) * canvas.height * 0.4 + canvas.height * 0.5;
            ctx.strokeStyle = `rgba(255, 40, 40, ${Math.random() * 0.3})`;
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
          ctx.fillStyle = `rgba(255, 40, 40, ${chaos * 0.2})`;
          
          for (let i = 0; i < interferenceCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 2 * (1 + intensity);
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        // Draw idle animation
        const t = timeRef.current;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.beginPath();

        for (let x = 0; x < canvas.width; x++) {
          const y = centerY + 
                   Math.sin(x * 0.02 + t) * 20 + 
                   Math.sin(x * 0.01 - t * 2) * 10 +
                   Math.cos(x * 0.005 + t * 0.5) * 15;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();

        // Add floating particles in idle state
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
          const t = timeRef.current + i;
          const x = Math.sin(t * 0.5) * canvas.width * 0.4 + canvas.width * 0.5;
          const y = Math.cos(t * 0.3) * canvas.height * 0.3 + canvas.height * 0.5;
          
          ctx.fillStyle = `rgba(255, 0, 0, ${0.1 + Math.sin(t) * 0.1})`;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Add scan line
      const scanLinePos = (Math.sin(timeRef.current * 2) * 0.5 + 0.5) * canvas.height;
      const scanGradient = ctx.createLinearGradient(0, scanLinePos - 5, 0, scanLinePos + 5);
      scanGradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
      scanGradient.addColorStop(0.5, `rgba(255, 0, 0, ${0.2 + intensity * 0.3})`);
      scanGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanLinePos - 5, canvas.width, 10);

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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay" />
          <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay" />
        </div>

        <canvas
          ref={canvasRef}
          className="w-full h-full bg-black rounded-lg"
        />

        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)]" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
        <div className="absolute inset-0 pointer-events-none rounded-lg border border-red-900/20" />
      </div>
    </div>
  );
};

export default Oscilloscope;