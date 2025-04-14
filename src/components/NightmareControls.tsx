import React, { useRef, useEffect } from 'react';
import { Skull } from 'lucide-react';
import Knob from './Knob';

interface NightmareControlsProps {
  intensity: number;
  chaos: number;
  dreamDepth: number;
  onIntensityChange: (value: number) => void;
  onChaosChange: (value: number) => void;
  onDreamDepthChange: (value: number) => void;
}

const NightmareControls: React.FC<NightmareControlsProps> = ({
  intensity,
  chaos,
  dreamDepth,
  onIntensityChange,
  onChaosChange,
  onDreamDepthChange
}) => {
  // Generate rune positions in a pentagram pattern
  const runeCount = 13; // Unlucky number
  const runes = Array.from({ length: runeCount }).map((_, i) => {
    const angle = (i / runeCount) * Math.PI * 2;
    const radius = 3 + Math.sin(i * 2) * 0.5; // Varying radius for more occult feel
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  });

  // Calculate visualization parameters
  const glowIntensity = 0.3 + intensity * 0.7;
  const pulseSpeed = 4 - intensity * 2;
  const chaosOffset = chaos * 10;
  const dreamScale = 1 + (dreamDepth / 10) * 0.5;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
          <Skull className="w-4 h-4" />
          Nightmare Engine
        </h3>

        {/* Nightmare visualization */}
        <div 
          className="nightmare-container relative"
          style={{
            opacity: intensity > 0 ? 1 : 0.3,
            transform: `scale(${dreamScale})`,
            transition: 'all 0.3s ease-out'
          }}
        >
          {/* Rotating pentagrams with chaos effect */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i}
              className="nightmare-ring absolute inset-0"
              style={{
                animationDuration: `${20 - intensity * 10 + i * 5}s`,
                opacity: 0.1 + intensity * 0.3,
                transform: `rotate(${i * 72 + chaosOffset}deg)`,
                filter: `blur(${chaos * 2}px)`
              }}
            />
          ))}
          
          {/* Center skull symbol */}
          <div 
            className="nightmare-symbol"
            style={{
              animationDuration: `${pulseSpeed}s`,
              opacity: 0.3 + intensity * 0.7,
              filter: `drop-shadow(0 0 ${8 + intensity * 12}px rgba(139, 0, 0, ${glowIntensity}))`
            }}
          >
            <Skull 
              className="w-12 h-12 text-red-900"
              style={{
                transform: `scale(${1 + intensity * 0.2}) rotate(${chaosOffset}deg)`
              }}
            />
          </div>

          {/* Floating runes with chaos effect */}
          <div className="nightmare-runes">
            {runes.map((rune, i) => (
              <div
                key={i}
                className="nightmare-rune"
                style={{
                  left: `calc(50% + ${rune.x + Math.sin(i + chaosOffset) * chaos}rem)`,
                  top: `calc(50% + ${rune.y + Math.cos(i + chaosOffset) * chaos}rem)`,
                  transform: `rotate(${(i / runeCount) * 360 + chaosOffset}deg)`,
                  animationDelay: `${i * (3 / runeCount)}s`,
                  opacity: 0.1 + intensity * 0.3,
                  filter: `blur(${chaos}px)`
                }}
              />
            ))}
          </div>

          {/* Nightmare depth rings */}
          <div 
            className="absolute inset-[-50%] rounded-full border border-red-900/20"
            style={{
              transform: `scale(${1 + dreamDepth * 0.1})`,
              opacity: intensity * 0.2,
              filter: `blur(${chaos * 2}px)`
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <Knob
            value={intensity}
            min={0}
            max={1}
            onChange={onIntensityChange}
            label="Terror"
          />
          <div className="text-red-300/50 text-xs font-mono mt-1">
            {(intensity * 100).toFixed(0)}%
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Knob
            value={chaos}
            min={0}
            max={1}
            onChange={onChaosChange}
            label="Madness"
          />
          <div className="text-red-300/50 text-xs font-mono mt-1">
            {(chaos * 100).toFixed(0)}%
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Knob
            value={dreamDepth}
            min={1}
            max={13}
            onChange={onDreamDepthChange}
            label="Descent"
          />
          <div className="text-red-300/50 text-xs font-mono mt-1">
            Level {Math.floor(dreamDepth)}
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div 
          className="text-center text-xs font-mono"
          style={{
            color: `rgba(255, ${Math.floor(255 * (1 - intensity))}, ${Math.floor(255 * (1 - intensity))}, ${0.5 + intensity * 0.5})`
          }}
        >
          Terror Level: {intensity > 0.8 ? 'EXTREME' : intensity > 0.5 ? 'SEVERE' : intensity > 0.2 ? 'MODERATE' : 'MILD'}
        </div>
        <div 
          className="text-center text-xs font-mono"
          style={{
            color: `rgba(255, ${Math.floor(255 * (1 - chaos))}, ${Math.floor(255 * (1 - chaos))}, ${0.5 + chaos * 0.5})`
          }}
        >
          Sanity Status: {chaos > 0.8 ? 'SHATTERED' : chaos > 0.5 ? 'FRACTURING' : chaos > 0.2 ? 'UNSTABLE' : 'INTACT'}
        </div>
        <div 
          className="text-center text-xs font-mono"
          style={{
            color: `rgba(255, ${Math.floor(255 * (1 - dreamDepth/13))}, ${Math.floor(255 * (1 - dreamDepth/13))}, ${0.5 + (dreamDepth/13) * 0.5})`
          }}
        >
          Descent: {dreamDepth > 10 ? 'ABYSS' : dreamDepth > 7 ? 'VOID' : dreamDepth > 4 ? 'DEPTHS' : 'SURFACE'}
        </div>
      </div>

      <style jsx>{`
        .nightmare-container {
          width: 8rem;
          height: 8rem;
          margin-bottom: 1rem;
        }

        .nightmare-ring {
          border: 2px solid rgba(139, 0, 0, 0.2);
          border-radius: 50%;
          clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        }

        .nightmare-ring::before,
        .nightmare-ring::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 1px solid rgba(139, 0, 0, 0.1);
          border-radius: 50%;
          clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        }

        .nightmare-symbol {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: nightmare-pulse 4s ease-in-out infinite;
        }

        .nightmare-rune {
          position: absolute;
          width: 0.5rem;
          height: 0.5rem;
          background: rgba(139, 0, 0, 0.2);
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          animation: rune-pulse 3s ease-in-out infinite;
        }

        @keyframes nightmare-pulse {
          0% { filter: drop-shadow(0 0 2px rgba(139, 0, 0, 0.3)); opacity: 0.3; }
          50% { filter: drop-shadow(0 0 8px rgba(139, 0, 0, 0.6)); opacity: 0.6; }
          100% { filter: drop-shadow(0 0 2px rgba(139, 0, 0, 0.3)); opacity: 0.3; }
        }

        @keyframes rune-pulse {
          0% { opacity: 0.1; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 0.4; transform: scale(1.2) rotate(180deg); }
          100% { opacity: 0.1; transform: scale(0.8) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NightmareControls;