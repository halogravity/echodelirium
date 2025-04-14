import React, { useState, useEffect } from 'react';
import { Music2, Zap, Radio, Waves, Cloud, Moon, Skull, Sparkles, Wind, Stars, Infinity, Flame, Skull as Skull2 } from 'lucide-react';
import Knob from './Knob';

interface StyleInfluenceControlsProps {
  styleInfluence: number;
  styleBlend: number;
  selectedStyle: string;
  onStyleInfluenceChange: (value: number) => void;
  onStyleBlendChange: (value: number) => void;
  onStyleChange: (styles: string[]) => void;
}

const STYLE_PRESETS = [
  { 
    id: 'glitch',
    name: 'Glitch',
    icon: Zap,
    description: 'Digital artifacts, bit-crushing, and circuit-bent chaos',
    color: 'red-600',
    effectIntensity: 1.5,
    compatibleWith: ['noise', 'dark', 'infernal']
  },
  { 
    id: 'drone',
    name: 'Drone',
    icon: Infinity,
    description: 'Deep resonant harmonics with spectral layering',
    color: 'red-500',
    effectIntensity: 1.3,
    compatibleWith: ['dark', 'ritual', 'cosmic']
  },
  { 
    id: 'vapor',
    name: 'Vapor',
    icon: Cloud,
    description: 'Time-stretched, pitch-warped with heavy chorus',
    color: 'red-400',
    effectIntensity: 1.2,
    compatibleWith: ['ethereal', 'spectral', 'cosmic']
  },
  { 
    id: 'dark',
    name: 'Dark',
    icon: Moon,
    description: 'Sub-bass drones and ominous resonances',
    color: 'red-900',
    effectIntensity: 1.4,
    compatibleWith: ['ritual', 'necro', 'infernal']
  },
  {
    id: 'ritual',
    name: 'Ritual',
    icon: Skull,
    description: 'Ancient harmonics and mystical frequencies',
    color: 'red-800',
    effectIntensity: 1.6,
    compatibleWith: ['dark', 'necro', 'cosmic']
  },
  {
    id: 'noise',
    name: 'Noise',
    icon: Radio,
    description: 'Filtered chaos and evolving static patterns',
    color: 'red-700',
    effectIntensity: 1.8,
    compatibleWith: ['glitch', 'quantum', 'infernal']
  },
  {
    id: 'spectral',
    name: 'Spectral',
    icon: Sparkles,
    description: 'Crystalline harmonics and shimmering textures',
    color: 'red-500',
    effectIntensity: 1.4,
    compatibleWith: ['ethereal', 'vapor', 'quantum']
  },
  {
    id: 'ethereal',
    name: 'Ethereal',
    icon: Wind,
    description: 'Floating atmospheres and ghostly resonance',
    color: 'red-400',
    effectIntensity: 1.3,
    compatibleWith: ['vapor', 'spectral', 'cosmic']
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    icon: Stars,
    description: 'Interstellar drones and quantum fluctuations',
    color: 'red-600',
    effectIntensity: 1.5,
    compatibleWith: ['ethereal', 'quantum', 'ritual']
  },
  {
    id: 'infernal',
    name: 'Infernal',
    icon: Flame,
    description: 'Hellish distortion and demonic frequencies',
    color: 'red-700',
    effectIntensity: 1.7,
    compatibleWith: ['dark', 'necro', 'noise']
  },
  {
    id: 'quantum',
    name: 'Quantum',
    icon: Waves,
    description: 'Probability waves and superposition states',
    color: 'red-500',
    effectIntensity: 1.6,
    compatibleWith: ['cosmic', 'spectral', 'noise']
  },
  {
    id: 'necro',
    name: 'Necro',
    icon: Skull2,
    description: 'Undead harmonics and sepulchral resonance',
    color: 'red-800',
    effectIntensity: 1.9,
    compatibleWith: ['dark', 'ritual', 'infernal']
  }
];

const StyleInfluenceControls: React.FC<StyleInfluenceControlsProps> = ({
  styleInfluence,
  styleBlend,
  onStyleInfluenceChange,
  onStyleBlendChange,
  onStyleChange
}) => {
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());
  const [hoverStyle, setHoverStyle] = useState<string | null>(null);
  const [morphProgress, setMorphProgress] = useState(0);
  const [isAutoMorphing, setIsAutoMorphing] = useState(false);
  const [particleCount, setParticleCount] = useState(0);

  // Calculate total effect intensity based on selected styles
  const totalEffectIntensity = Array.from(selectedStyles).reduce((total, styleId) => {
    const style = STYLE_PRESETS.find(s => s.id === styleId);
    return total + (style?.effectIntensity || 0);
  }, 0) * (styleInfluence * styleBlend);

  useEffect(() => {
    if (isAutoMorphing) {
      const interval = setInterval(() => {
        setMorphProgress(prev => {
          const next = prev + 0.01;
          if (next >= 1) {
            setIsAutoMorphing(false);
            return 0;
          }
          return next;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isAutoMorphing]);

  const handleStyleToggle = (styleId: string) => {
    const style = STYLE_PRESETS.find(s => s.id === styleId);
    if (!style) return;

    const newStyles = new Set(selectedStyles);
    
    if (newStyles.has(styleId)) {
      newStyles.delete(styleId);
    } else {
      // Check compatibility with currently selected styles
      const isCompatible = Array.from(selectedStyles).every(selectedId => {
        const selectedStyle = STYLE_PRESETS.find(s => s.id === selectedId);
        return selectedStyle?.compatibleWith.includes(styleId);
      });

      if (isCompatible && newStyles.size < 3) {
        newStyles.add(styleId);
        setIsAutoMorphing(true);
        setMorphProgress(0);
      }
    }

    setSelectedStyles(newStyles);
    onStyleChange(Array.from(newStyles));
    setParticleCount(prev => prev + 10);
  };

  const getStyleCompatibility = (styleId: string): number => {
    if (selectedStyles.size === 0) return 1;

    const style = STYLE_PRESETS.find(s => s.id === styleId);
    if (!style) return 0;

    const compatibilityScores = Array.from(selectedStyles).map(selectedId => {
      const selectedStyle = STYLE_PRESETS.find(s => s.id === selectedId);
      return selectedStyle?.compatibleWith.includes(styleId) ? 1 : 0;
    });

    return compatibilityScores.reduce((a, b) => a + b, 0) / selectedStyles.size;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
          <Music2 className="w-4 h-4" />
          Style Influence
          <span className="text-red-500/50 text-xs">
            ({selectedStyles.size}/3 selected)
          </span>
        </h3>
        
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-red-500/50">Effect Power:</span>
          <span className="text-red-500">
            {(totalEffectIntensity * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <Knob
            value={styleInfluence}
            min={0}
            max={1}
            onChange={onStyleInfluenceChange}
            label="Influence"
          />
          <div className="text-red-300/50 text-xs font-mono mt-1">
            {(styleInfluence * 100).toFixed(0)}%
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <Knob
            value={styleBlend}
            min={0}
            max={1}
            onChange={onStyleBlendChange}
            label="Blend"
          />
          <div className="text-red-300/50 text-xs font-mono mt-1">
            {(styleBlend * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 relative">
        {/* Particle effects container */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: particleCount }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: 'scale(0)',
                animation: `particle 1s ease-out forwards ${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>

        {STYLE_PRESETS.map((style) => {
          const Icon = style.icon;
          const isSelected = selectedStyles.has(style.id);
          const isHovered = hoverStyle === style.id;
          const compatibility = getStyleCompatibility(style.id);
          
          return (
            <div 
              key={style.id} 
              className="relative group"
              onMouseEnter={() => setHoverStyle(style.id)}
              onMouseLeave={() => setHoverStyle(null)}
            >
              <div className="flex flex-col">
                <button
                  onClick={() => handleStyleToggle(style.id)}
                  disabled={!isSelected && selectedStyles.size >= 3}
                  className={`
                    w-full px-3 py-4 font-mono text-xs uppercase tracking-wider border 
                    transition-all duration-500 relative overflow-hidden
                    ${isSelected
                      ? `bg-${style.color}/20 border-${style.color} text-${style.color} shadow-[0_0_25px_rgba(220,38,38,0.2)]`
                      : selectedStyles.size >= 3 && !isSelected
                        ? 'opacity-50 cursor-not-allowed border-red-900/10 text-red-500/30'
                        : `border-red-900/20 text-red-500/70 hover:border-${style.color}/50 hover:text-${style.color} hover:bg-${style.color}/10`
                    }
                  `}
                  style={{
                    opacity: isSelected ? 1 : compatibility
                  }}
                >
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <Icon 
                      className={`w-6 h-6 transition-transform duration-500 ${
                        isSelected || isHovered ? 'scale-125' : 'scale-100'
                      }`} 
                    />
                    {style.name}
                  </div>

                  {/* Animated background effect */}
                  <div 
                    className={`
                      absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent
                      opacity-0 transition-opacity duration-500
                      ${isSelected || isHovered ? 'opacity-10' : ''}
                    `}
                    style={{
                      transform: 'translateX(-100%)',
                      animation: isSelected ? 'shine 2s infinite' : 'none'
                    }}
                  />

                  {/* Morph progress indicator */}
                  {isSelected && isAutoMorphing && (
                    <div 
                      className="absolute bottom-0 left-0 h-0.5 bg-red-500"
                      style={{ width: `${morphProgress * 100}%` }}
                    />
                  )}
                </button>

                {/* Description text */}
                <div className="text-center mt-2 text-[10px] font-mono text-red-500/50 h-8 flex items-center justify-center px-2">
                  {style.description}
                </div>
              </div>

              {/* Selected style effects */}
              {isSelected && (
                <>
                  {/* Pulsing border */}
                  <div className="absolute -inset-px">
                    <div className="absolute inset-0 border border-red-600/50 animate-[pulse_2s_ease-in-out_infinite]" />
                    <div className="absolute inset-0 border border-red-600/30 animate-[pulse_2s_ease-in-out_infinite_0.5s]" />
                    <div className="absolute inset-0 border border-red-600/20 animate-[pulse_2s_ease-in-out_infinite_1s]" />
                  </div>

                  {/* Corner sparkles */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Sparkles
                      key={i}
                      className={`
                        absolute w-3 h-3 text-red-500/50
                        ${i === 0 ? 'top-0 left-0' : i === 1 ? 'top-0 right-0' : i === 2 ? 'bottom-0 left-0' : 'bottom-0 right-0'}
                        animate-[pulse_${1 + i * 0.5}s_ease-in-out_infinite]
                      `}
                    />
                  ))}
                </>
              )}

              {/* Compatibility indicators */}
              {selectedStyles.size > 0 && !isSelected && (
                <div 
                  className="absolute -inset-px border transition-colors duration-300"
                  style={{
                    borderColor: `rgba(220, 38, 38, ${compatibility * 0.5})`,
                    boxShadow: `0 0 ${compatibility * 20}px rgba(220, 38, 38, ${compatibility * 0.2})`
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Enhanced intensity visualization */}
      <div className="h-2 bg-black/40 border border-red-900/20 overflow-hidden rounded-full">
        <div 
          className="h-full bg-gradient-to-r from-red-900/30 via-red-600/30 to-red-300/30 relative"
          style={{ 
            width: `${Math.min(100, totalEffectIntensity * 100)}%`,
            boxShadow: `0 0 ${20 * totalEffectIntensity}px rgba(220,38,38,${0.4 * totalEffectIntensity})`
          }}
        >
          {/* Animated pulse overlay */}
          <div className="absolute inset-0 animate-[pulse_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
          
          {/* Moving particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-full bg-red-500/10"
                style={{
                  left: '-1rem',
                  animation: `moveRight ${2 + i}s linear infinite ${i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes moveRight {
          from { transform: translateX(0); }
          to { transform: translateX(calc(100% + 1rem)); }
        }

        @keyframes particle {
          0% { transform: scale(0) translate(0, 0); opacity: 1; }
          100% { transform: scale(3) translate(100px, -100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default StyleInfluenceControls;