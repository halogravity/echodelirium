import React, { useState } from 'react';
import { Sliders, Music2, Brain, Waves, Stars, Infinity } from 'lucide-react';
import Knob from './Knob';
import StyleInfluenceControls from './StyleInfluenceControls';
import NightmareControls from './NightmareControls';

interface AudioControlsProps {
  filterFreq: number;
  filterRes: number;
  distortion: number;
  distortionMix: number;
  pareidoliaIntensity: number;
  chaosLevel: number;
  dreamDepth: number;
  styleInfluence: number;
  styleBlend: number;
  selectedStyle: string;
  pitchShift: number;
  pitchMix: number;
  reverbDecay: number;
  reverbMix: number;
  granularDensity: number;
  granularSize: number;
  spectralWarp: number;
  spectralShift: number;
  neuralMod: number;
  neuralFeedback: number;
  onFilterFreqChange: (value: number) => void;
  onFilterResChange: (value: number) => void;
  onDistortionChange: (value: number) => void;
  onDistortionMixChange: (value: number) => void;
  onPareidoliaIntensityChange: (value: number) => void;
  onChaosLevelChange: (value: number) => void;
  onDreamDepthChange: (value: number) => void;
  onStyleInfluenceChange: (value: number) => void;
  onStyleBlendChange: (value: number) => void;
  onStyleChange: (styles: string[]) => void;
  onPitchShiftChange: (value: number) => void;
  onPitchMixChange: (value: number) => void;
  onReverbDecayChange: (value: number) => void;
  onReverbMixChange: (value: number) => void;
  onGranularDensityChange: (value: number) => void;
  onGranularSizeChange: (value: number) => void;
  onSpectralWarpChange: (value: number) => void;
  onSpectralShiftChange: (value: number) => void;
  onNeuralModChange: (value: number) => void;
  onNeuralFeedbackChange: (value: number) => void;
  isOpen: boolean;
}

const CONTROL_SECTIONS = [
  {
    id: 'reality',
    name: 'Reality Synthesis',
    icon: Sliders,
    color: 'red-600',
  },
  {
    id: 'nightmare',
    name: 'Nightmare Engine',
    icon: Brain,
    color: 'red-500',
  },
  {
    id: 'style',
    name: 'Style Influence',
    icon: Music2,
    color: 'red-400',
  },
  {
    id: 'granular',
    name: 'Granular Void',
    icon: Stars,
    color: 'red-700',
  },
  {
    id: 'spectral',
    name: 'Spectral Warping',
    icon: Waves,
    color: 'red-800',
  },
  {
    id: 'neural',
    name: 'Neural Modulation',
    icon: Infinity,
    color: 'red-900',
  }
] as const;

type TabType = typeof CONTROL_SECTIONS[number]['id'];

const AudioControls: React.FC<AudioControlsProps> = ({
  filterFreq,
  filterRes,
  distortion,
  distortionMix,
  pareidoliaIntensity,
  chaosLevel,
  dreamDepth,
  styleInfluence,
  styleBlend,
  selectedStyle,
  pitchShift,
  pitchMix,
  reverbDecay,
  reverbMix,
  granularDensity,
  granularSize,
  spectralWarp,
  spectralShift,
  neuralMod,
  neuralFeedback,
  onFilterFreqChange,
  onFilterResChange,
  onDistortionChange,
  onDistortionMixChange,
  onPareidoliaIntensityChange,
  onChaosLevelChange,
  onDreamDepthChange,
  onStyleInfluenceChange,
  onStyleBlendChange,
  onStyleChange,
  onPitchShiftChange,
  onPitchMixChange,
  onReverbDecayChange,
  onReverbMixChange,
  onGranularDensityChange,
  onGranularSizeChange,
  onSpectralWarpChange,
  onSpectralShiftChange,
  onNeuralModChange,
  onNeuralFeedbackChange,
  isOpen
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('reality');
  const [hoverSection, setHoverSection] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="space-y-8">
      {/* Control Section Buttons */}
      <div className="grid grid-cols-3 gap-4">
        {CONTROL_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isSelected = activeTab === section.id;
          const isHovered = hoverSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              onMouseEnter={() => setHoverSection(section.id)}
              onMouseLeave={() => setHoverSection(null)}
              className={`
                w-full px-4 py-6 font-mono text-sm uppercase tracking-wider border 
                transition-all duration-500 relative overflow-hidden
                ${isSelected
                  ? `bg-${section.color}/20 border-${section.color} text-${section.color} shadow-[0_0_25px_rgba(220,38,38,0.2)]`
                  : `border-red-900/20 text-red-500/70 hover:border-${section.color}/50 hover:text-${section.color} hover:bg-${section.color}/10`
                }
              `}
            >
              <div className="relative z-10 flex flex-col items-center gap-3">
                <Icon 
                  className={`w-8 h-8 transition-transform duration-500 ${
                    isSelected || isHovered ? 'scale-125' : 'scale-100'
                  }`}
                />
                {section.name}
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
            </button>
          );
        })}
      </div>

      {/* Control Content */}
      <div className="mt-8">
        {activeTab === 'reality' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Pitch Controls */}
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <Knob
                  value={pitchShift}
                  min={-12}
                  max={12}
                  onChange={onPitchShiftChange}
                  label="Pitch Shift"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {pitchShift > 0 ? '+' : ''}{pitchShift} st
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Knob
                  value={pitchMix}
                  min={0}
                  max={1}
                  onChange={onPitchMixChange}
                  label="Pitch Mix"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {(pitchMix * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <Knob
                  value={filterFreq}
                  min={20}
                  max={20000}
                  onChange={onFilterFreqChange}
                  label="Filter Freq"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {filterFreq.toFixed(0)} Hz
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Knob
                  value={filterRes}
                  min={0.1}
                  max={20}
                  onChange={onFilterResChange}
                  label="Resonance"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {filterRes.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Distortion Controls */}
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <Knob
                  value={distortion}
                  min={0}
                  max={1}
                  onChange={onDistortionChange}
                  label="Distortion"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {(distortion * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Knob
                  value={distortionMix}
                  min={0}
                  max={1}
                  onChange={onDistortionMixChange}
                  label="Drive Mix"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {(distortionMix * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Reverb Controls */}
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <Knob
                  value={reverbDecay}
                  min={0.1}
                  max={10}
                  onChange={onReverbDecayChange}
                  label="Reverb Decay"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {reverbDecay.toFixed(1)}s
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Knob
                  value={reverbMix}
                  min={0}
                  max={1}
                  onChange={onReverbMixChange}
                  label="Reverb Mix"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {(reverbMix * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nightmare' && (
          <NightmareControls
            intensity={pareidoliaIntensity}
            chaos={chaosLevel}
            dreamDepth={dreamDepth}
            onIntensityChange={onPareidoliaIntensityChange}
            onChaosChange={onChaosLevelChange}
            onDreamDepthChange={onDreamDepthChange}
          />
        )}

        {activeTab === 'style' && (
          <StyleInfluenceControls
            styleInfluence={styleInfluence}
            styleBlend={styleBlend}
            selectedStyle={selectedStyle}
            onStyleInfluenceChange={onStyleInfluenceChange}
            onStyleBlendChange={onStyleBlendChange}
            onStyleChange={onStyleChange}
          />
        )}

        {activeTab === 'granular' && (
          <div className="space-y-8">
            <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <Stars className="w-4 h-4" />
              Granular Void
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <Knob
                  value={granularDensity}
                  min={0}
                  max={1}
                  onChange={onGranularDensityChange}
                  label="Density"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {(granularDensity * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Knob
                  value={granularSize}
                  min={0.01}
                  max={1}
                  onChange={onGranularSizeChange}
                  label="Grain Size"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {(granularSize * 1000).toFixed(0)}ms
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spectral' && (
          <div className="space-y-8">
            <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <Waves className="w-4 h-4" />
              Spectral Warping
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <Knob
                  value={spectralWarp}
                  min={0}
                  max={1}
                  onChange={onSpectralWarpChange}
                  label="Warp"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {(spectralWarp * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Knob
                  value={spectralShift}
                  min={-1}
                  max={1}
                  onChange={onSpectralShiftChange}
                  label="Shift"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {spectralShift > 0 ? '+' : ''}{(spectralShift * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'neural' && (
          <div className="space-y-8">
            <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <Infinity className="w-4 h-4" />
              Neural Modulation
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <Knob
                  value={neuralMod}
                  min={0}
                  max={1}
                  onChange={onNeuralModChange}
                  label="Modulation"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {(neuralMod * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Knob
                  value={neuralFeedback}
                  min={0}
                  max={0.99}
                  onChange={onNeuralFeedbackChange}
                  label="Feedback"
                />
                <div className="text-red-300/50 text-xs font-mono mt-1">
                  {(neuralFeedback * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioControls;