import React from 'react';
import { Brain } from 'lucide-react';
import Knob from './Knob';

interface HallucinationControlsProps {
  intensity: number;
  chaos: number;
  dreamDepth: number;
  onIntensityChange: (value: number) => void;
  onChaosChange: (value: number) => void;
  onDreamDepthChange: (value: number) => void;
}

const HallucinationControls: React.FC<HallucinationControlsProps> = ({
  intensity,
  chaos,
  dreamDepth,
  onIntensityChange,
  onChaosChange,
  onDreamDepthChange
}) => {
  // Generate rune positions in a circle
  const runeCount = 12;
  const runes = Array.from({ length: runeCount }).map((_, i) => {
    const angle = (i / runeCount) * Math.PI * 2;
    const radius = 3;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  });

  // Calculate visualization parameters based on intensity and chaos
  const glowIntensity = 0.3 + intensity * 0.7;
  const pulseSpeed = 4 - intensity * 2; // Faster pulse with higher intensity
  const chaosOffset = chaos * 10;
  const dreamScale = 1 + (dreamDepth / 10) * 0.5;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Hallucination Engine
        </h3>

        {/* Dream visualization */}
        <div 
          className="glyph-container relative"
          style={{
            opacity: intensity > 0 ? 1 : 0.3,
            transform: `scale(${dreamScale})`,
            transition: 'all 0.3s ease-out'
          }}
        >
          {/* Rotating rings with chaos effect */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i}
              className="glyph-ring absolute inset-0"
              style={{
                animationDuration: `${20 - intensity * 10 + i * 5}s`,
                opacity: 0.1 + intensity * 0.3,
                transform: `rotate(${i * 30 + chaosOffset}deg)`,
                filter: `blur(${chaos * 2}px)`
              }}
            />
          ))}
          
          {/* Center brain symbol */}
          <div 
            className="glyph-symbol"
            style={{
              animationDuration: `${pulseSpeed}s`,
              opacity: 0.3 + intensity * 0.7,
              filter: `drop-shadow(0 0 ${8 + intensity * 12}px rgba(139, 0, 0, ${glowIntensity}))`
            }}
          >
            <Brain 
              className="w-12 h-12 text-red-900"
              style={{
                transform: `scale(${1 + intensity * 0.2}) rotate(${chaosOffset}deg)`
              }}
            />
          </div>

          {/* Floating runes with chaos effect */}
          <div className="glyph-runes">
            {runes.map((rune, i) => (
              <div
                key={i}
                className="glyph-rune"
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

          {/* Dream depth rings */}
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
            label="Intensity"
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
            label="Chaos"
          />
          <div className="text-red-300/50 text-xs font-mono mt-1">
            {(chaos * 100).toFixed(0)}%
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Knob
            value={dreamDepth}
            min={1}
            max={10}
            onChange={onDreamDepthChange}
            label="Dream Depth"
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
          Reality Distortion: {intensity > 0.8 ? 'CRITICAL' : intensity > 0.5 ? 'HIGH' : intensity > 0.2 ? 'MODERATE' : 'LOW'}
        </div>
        <div 
          className="text-center text-xs font-mono"
          style={{
            color: `rgba(255, ${Math.floor(255 * (1 - chaos))}, ${Math.floor(255 * (1 - chaos))}, ${0.5 + chaos * 0.5})`
          }}
        >
          Entropy Level: {chaos > 0.8 ? 'UNSTABLE' : chaos > 0.5 ? 'VOLATILE' : chaos > 0.2 ? 'DYNAMIC' : 'STABLE'}
        </div>
        <div 
          className="text-center text-xs font-mono"
          style={{
            color: `rgba(255, ${Math.floor(255 * (1 - dreamDepth/10))}, ${Math.floor(255 * (1 - dreamDepth/10))}, ${0.5 + (dreamDepth/10) * 0.5})`
          }}
        >
          Dream State: {dreamDepth > 8 ? 'DEEP' : dreamDepth > 5 ? 'MEDIUM' : 'SHALLOW'}
        </div>
      </div>
    </div>
  );
};

export default HallucinationControls;