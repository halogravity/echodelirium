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
  chorusDepth: number;
  chorusRate: number;
  chorusMix: number;
  lofiCrush: number;
  lofiDepth: number;
  lofiMix: number;
  delayTime: number;
  delayFeedback: number;
  delayMix: number;
  compThreshold: number;
  compRatio: number;
  compKnee: number;
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
  onChorusDepthChange: (value: number) => void;
  onChorusRateChange: (value: number) => void;
  onChorusMixChange: (value: number) => void;
  onLofiCrushChange: (value: number) => void;
  onLofiDepthChange: (value: number) => void;
  onLofiMixChange: (value: number) => void;
  onDelayTimeChange: (value: number) => void;
  onDelayFeedbackChange: (value: number) => void;
  onDelayMixChange: (value: number) => void;
  onCompThresholdChange: (value: number) => void;
  onCompRatioChange: (value: number) => void;
  onCompKneeChange: (value: number) => void;
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
  filterFreq = 2000,
  filterRes = 1,
  distortion = 0,
  distortionMix = 0,
  pareidoliaIntensity = 0,
  chaosLevel = 0,
  dreamDepth = 1,
  styleInfluence = 0,
  styleBlend = 0,
  selectedStyle = '',
  pitchShift = 0,
  pitchMix = 0,
  reverbDecay = 0,
  reverbMix = 0,
  granularDensity = 0,
  granularSize = 0.01,
  spectralWarp = 0,
  spectralShift = 0,
  neuralMod = 0,
  neuralFeedback = 0,
  chorusDepth = 0,
  chorusRate = 0.1,
  chorusMix = 0,
  lofiCrush = 0,
  lofiDepth = 0,
  lofiMix = 0,
  delayTime = 0,
  delayFeedback = 0,
  delayMix = 0,
  compThreshold = -24,
  compRatio = 4,
  compKnee = 10,
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
  onChorusDepthChange,
  onChorusRateChange,
  onChorusMixChange,
  onLofiCrushChange,
  onLofiDepthChange,
  onLofiMixChange,
  onDelayTimeChange,
  onDelayFeedbackChange,
  onDelayMixChange,
  onCompThresholdChange,
  onCompRatioChange,
  onCompKneeChange,
  isOpen
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('reality');
  const [hoverSection, setHoverSection] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="space-y-6">
      {/* Control Section Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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
                w-full px-3 py-2 font-mono text-xs uppercase tracking-wider border 
                transition-all duration-500 relative overflow-hidden
                ${isSelected
                  ? `bg-${section.color}/20 border-${section.color} text-${section.color} shadow-[0_0_15px_rgba(220,38,38,0.2)]`
                  : `border-red-900/20 text-red-500/70 hover:border-${section.color}/50 hover:text-${section.color} hover:bg-${section.color}/10`
                }
              `}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Icon 
                  className={`w-4 h-4 transition-transform duration-500 ${
                    isSelected || isHovered ? 'scale-110' : 'scale-100'
                  }`}
                />
                <span className="hidden sm:inline">{section.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Control Content */}
      <div className="mt-6">
        {activeTab === 'reality' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Pitch Section */}
            <div className="space-y-4">
              <h4 className="text-red-500/70 font-mono text-xs uppercase tracking-wider text-center">Pitch</h4>
              <div className="flex flex-col items-center gap-4">
                <Knob
                  value={pitchShift}
                  min={-12}
                  max={12}
                  onChange={onPitchShiftChange}
                  label="Shift"
                  size={60}
                />
                <Knob
                  value={pitchMix}
                  min={0}
                  max={1}
                  onChange={onPitchMixChange}
                  label="Mix"
                  size={60}
                />
              </div>
            </div>

            {/* Filter Section */}
            <div className="space-y-4">
              <h4 className="text-red-500/70 font-mono text-xs uppercase tracking-wider text-center">Filter</h4>
              <div className="flex flex-col items-center gap-4">
                <Knob
                  value={filterFreq}
                  min={20}
                  max={20000}
                  onChange={onFilterFreqChange}
                  label="Freq"
                  size={60}
                />
                <Knob
                  value={filterRes}
                  min={0.1}
                  max={20}
                  onChange={onFilterResChange}
                  label="Res"
                  size={60}
                />
              </div>
            </div>

            {/* Distortion Section */}
            <div className="space-y-4">
              <h4 className="text-red-500/70 font-mono text-xs uppercase tracking-wider text-center">Dist</h4>
              <div className="flex flex-col items-center gap-4">
                <Knob
                  value={distortion}
                  min={0}
                  max={1}
                  onChange={onDistortionChange}
                  label="Drive"
                  size={60}
                />
                <Knob
                  value={distortionMix}
                  min={0}
                  max={1}
                  onChange={onDistortionMixChange}
                  label="Mix"
                  size={60}
                />
              </div>
            </div>

            {/* Reverb Section */}
            <div className="space-y-4">
              <h4 className="text-red-500/70 font-mono text-xs uppercase tracking-wider text-center">Reverb</h4>
              <div className="flex flex-col items-center gap-4">
                <Knob
                  value={reverbDecay}
                  min={0.1}
                  max={10}
                  onChange={onReverbDecayChange}
                  label="Decay"
                  size={60}
                />
                <Knob
                  value={reverbMix}
                  min={0}
                  max={1}
                  onChange={onReverbMixChange}
                  label="Mix"
                  size={60}
                />
              </div>
            </div>

            {/* Delay Section */}
            <div className="space-y-4">
              <h4 className="text-red-500/70 font-mono text-xs uppercase tracking-wider text-center">Delay</h4>
              <div className="flex flex-col items-center gap-4">
                <Knob
                  value={delayTime}
                  min={0}
                  max={1}
                  onChange={onDelayTimeChange}
                  label="Time"
                  size={60}
                />
                <Knob
                  value={delayFeedback}
                  min={0}
                  max={0.9}
                  onChange={onDelayFeedbackChange}
                  label="Fdbk"
                  size={60}
                />
                <Knob
                  value={delayMix}
                  min={0}
                  max={1}
                  onChange={onDelayMixChange}
                  label="Mix"
                  size={60}
                />
              </div>
            </div>

            {/* Chorus Section */}
            <div className="space-y-4">
              <h4 className="text-red-500/70 font-mono text-xs uppercase tracking-wider text-center">Chorus</h4>
              <div className="flex flex-col items-center gap-4">
                <Knob
                  value={chorusDepth}
                  min={0}
                  max={1}
                  onChange={onChorusDepthChange}
                  label="Depth"
                  size={60}
                />
                <Knob
                  value={chorusRate}
                  min={0.1}
                  max={10}
                  onChange={onChorusRateChange}
                  label="Rate"
                  size={60}
                />
                <Knob
                  value={chorusMix}
                  min={0}
                  max={1}
                  onChange={onChorusMixChange}
                  label="Mix"
                  size={60}
                />
              </div>
            </div>

            {/* Lo-Fi Section */}
            <div className="space-y-4">
              <h4 className="text-red-500/70 font-mono text-xs uppercase tracking-wider text-center">Lo-Fi</h4>
              <div className="flex flex-col items-center gap-4">
                <Knob
                  value={lofiCrush}
                  min={1}
                  max={16}
                  onChange={onLofiCrushChange}
                  label="Crush"
                  size={60}
                />
                <Knob
                  value={lofiDepth}
                  min={0}
                  max={1}
                  onChange={onLofiDepthChange}
                  label="Depth"
                  size={60}
                />
                <Knob
                  value={lofiMix}
                  min={0}
                  max={1}
                  onChange={onLofiMixChange}
                  label="Mix"
                  size={60}
                />
              </div>
            </div>

            {/* Compressor Section */}
            <div className="space-y-4">
              <h4 className="text-red-500/70 font-mono text-xs uppercase tracking-wider text-center">Comp</h4>
              <div className="flex flex-col items-center gap-4">
                <Knob
                  value={compThreshold}
                  min={-60}
                  max={0}
                  onChange={onCompThresholdChange}
                  label="Thresh"
                  size={60}
                />
                <Knob
                  value={compRatio}
                  min={1}
                  max={20}
                  onChange={onCompRatioChange}
                  label="Ratio"
                  size={60}
                />
                <Knob
                  value={compKnee}
                  min={0}
                  max={40}
                  onChange={onCompKneeChange}
                  label="Knee"
                  size={60}
                />
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

      {/* Parameter value display */}
      <div className="mt-4 p-3 bg-black/30 border border-red-900/20 rounded-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <div className="text-red-500/50">
            Filter: {filterFreq.toFixed(0)}Hz
          </div>
          <div className="text-red-500/50">
            Resonance: {filterRes.toFixed(1)}
          </div>
          <div className="text-red-500/50">
            Distortion: {(distortion * 100).toFixed(0)}%
          </div>
          <div className="text-red-500/50">
            Delay: {(delayTime * 1000).toFixed(0)}ms
          </div>
          <div className="text-red-500/50">
            Reverb: {reverbDecay.toFixed(1)}s
          </div>
          <div className="text-red-500/50">
            Chorus: {(chorusDepth * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioControls;