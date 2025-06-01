import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Music, Settings2, Save, FolderOpen, Trash2, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { Scale } from 'tonal';
import * as Tone from 'tone';
import Knob from './Knob';
import { savePreset, loadPresets, deletePreset, updatePreset } from '../lib/presets';

interface BassTrackProps {
  currentStep: number;
  stepAmount: number;
  onStepAmountChange?: (steps: number) => void;
}

export interface BassTrackRef {
  getCurrentNote: () => string | null;
  stopCurrentNotes: () => void;
  playStep: (step: number, time?: number) => void;
  stop: () => void;
}

const STEP_OPTIONS = [4, 8, 16, 32, 64] as const;
type StepAmount = typeof STEP_OPTIONS[number];

const DEFAULT_PARAMS = {
  rootNote: 'C',
  octave: 2,
  selectedScale: 'major',
  attack: 0.01,
  decay: 0.3,
  sustain: 0.4,
  release: 0.2,
  filterFreq: 800,
  filterQ: 2,
  oscillatorType: "sawtooth" as OscillatorType
};

const BASS_PATTERNS = [
  {
    name: "Classic House",
    pattern: Array(16).fill(null).map((_, i) => [i % 4 === 0, false, false, false, false]),
    scale: { rootNote: 'C', octave: 2, selectedScale: 'minor' }
  },
  {
    name: "Deep Sub",
    pattern: Array(16).fill(null).map((_, i) => [i % 8 === 0, false, false, false, false]),
    scale: { rootNote: 'C', octave: 1, selectedScale: 'major' }
  },
  {
    name: "Walking Bass",
    pattern: Array(16).fill(null).map((_, i) => [
      i % 4 === 0,
      i % 4 === 1,
      i % 4 === 2,
      i % 4 === 3,
      false
    ]),
    scale: { rootNote: 'C', octave: 2, selectedScale: 'major' }
  },
  {
    name: "Acid Line",
    pattern: Array(16).fill(null).map((_, i) => [
      i % 3 === 0,
      i % 4 === 0,
      i % 5 === 0,
      false,
      false
    ]),
    scale: { rootNote: 'C', octave: 3, selectedScale: 'minor' }
  },
  {
    name: "Dub Bass",
    pattern: Array(16).fill(null).map((_, i) => [
      i === 0 || i === 10,
      i === 4 || i === 12,
      false,
      false,
      false
    ]),
    scale: { rootNote: 'C', octave: 2, selectedScale: 'minor' }
  }
];

const BassTrack = forwardRef<BassTrackRef, BassTrackProps>(({ 
  currentStep, 
  stepAmount, 
  onStepAmountChange 
}, ref) => {
  const [pattern, setPattern] = useState<boolean[][]>(Array(stepAmount).fill(null).map(() => Array(5).fill(false)));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localStepAmount, setLocalStepAmount] = useState<StepAmount>(stepAmount as StepAmount);
  const [params, setParams] = useState(() => ({ ...DEFAULT_PARAMS }));
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const synthRef = useRef<any>(null);
  const currentNoteRef = useRef<string | null>(null);
  const patternRef = useRef(pattern);
  const lastStepRef = useRef<number>(-1);
  const lastTriggerTimeRef = useRef<number>(0);

  useEffect(() => {
    loadUserPresets();
  }, []);

  useEffect(() => {
    const synth = new Tone.MonoSynth({
      oscillator: {
        type: params.oscillatorType
      },
      envelope: {
        attack: params.attack,
        decay: params.decay,
        sustain: params.sustain,
        release: params.release
      },
      filter: {
        Q: params.filterQ,
        frequency: params.filterFreq,
        type: 'lowpass'
      }
    }).toDestination();

    synthRef.current = synth;

    return () => {
      synth.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({
        oscillator: { type: params.oscillatorType },
        envelope: {
          attack: params.attack,
          decay: params.decay,
          sustain: params.sustain,
          release: params.release
        },
        filter: {
          Q: params.filterQ,
          frequency: params.filterFreq
        }
      });
    }
  }, [params]);

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useImperativeHandle(ref, () => ({
    getCurrentNote: () => currentNoteRef.current,
    stopCurrentNotes: () => {
      if (synthRef.current && currentNoteRef.current) {
        synthRef.current.triggerRelease();
        currentNoteRef.current = null;
      }
    },
    playStep: (step: number, time?: number) => {
      if (!synthRef.current || step >= patternRef.current.length) return;

      let now = time || Tone.now();
      
      // Ensure minimum time between triggers to prevent overlapping
      if (now <= lastTriggerTimeRef.current) {
        now = lastTriggerTimeRef.current + 0.01;
      }

      // Always release the previous note before triggering a new one
      if (currentNoteRef.current) {
        synthRef.current.triggerRelease(now);
        currentNoteRef.current = null;
      }

      const scaleNotes = Scale.get(`${params.rootNote}${params.octave} ${params.selectedScale}`).notes;
      const stepPattern = patternRef.current[step];
      const activeNotes = stepPattern
        .map((isActive, index) => isActive ? scaleNotes[index] : null)
        .filter(Boolean) as string[];

      if (activeNotes.length > 0) {
        const note = activeNotes[0];
        synthRef.current.triggerAttack(note, now);
        currentNoteRef.current = note;
        lastTriggerTimeRef.current = now;
      }

      lastStepRef.current = step;
    },
    stop: () => {
      if (synthRef.current && currentNoteRef.current) {
        synthRef.current.triggerRelease();
        currentNoteRef.current = null;
      }
      lastStepRef.current = -1;
      lastTriggerTimeRef.current = 0;
    }
  }), [params.rootNote, params.octave, params.selectedScale]);

  const loadUserPresets = async () => {
    setIsLoadingPresets(true);
    try {
      const userPresets = await loadPresets();
      setPresets(userPresets);
    } catch (error) {
      console.error('Error loading presets:', error);
    } finally {
      setIsLoadingPresets(false);
    }
  };

  const handleSavePreset = async () => {
    if (!newPresetName.trim()) return;

    setIsSavingPreset(true);
    try {
      const presetData = {
        pattern,
        params,
        stepAmount: localStepAmount
      };

      const savedPreset = await savePreset(newPresetName, presetData);
      if (savedPreset) {
        setPresets(prev => [savedPreset, ...prev]);
        setShowSaveDialog(false);
        setNewPresetName('');
      }
    } catch (error) {
      console.error('Error saving preset:', error);
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleLoadPreset = (preset: Preset) => {
    try {
      const presetData = preset.parameters as any;
      if (presetData.pattern) {
        setPattern(presetData.pattern);
      }
      if (presetData.params) {
        setParams(prev => ({
          ...DEFAULT_PARAMS,
          ...presetData.params
        }));
      }
      if (presetData.stepAmount) {
        handleStepAmountChange(presetData.stepAmount);
      }
    } catch (error) {
      console.error('Error loading preset:', error);
      setParams({ ...DEFAULT_PARAMS });
    }
  };

  const handleStepAmountChange = (steps: number) => {
    const newStepAmount = steps as StepAmount;
    setLocalStepAmount(newStepAmount);
    
    setPattern(prev => {
      const newPattern = Array(steps).fill(null).map((_, stepIndex) => {
        if (stepIndex < prev.length) {
          return [...prev[stepIndex]];
        }
        return Array(5).fill(false);
      });
      return newPattern;
    });

    if (onStepAmountChange) {
      onStepAmountChange(steps);
    }
  };

  const toggleStep = (stepIndex: number, noteIndex: number) => {
    setPattern(prev => 
      prev.map((step, i) =>
        i === stepIndex
          ? step.map((isActive, j) => j === noteIndex ? !isActive : isActive)
          : step
      )
    );
  };

  const clearPattern = () => {
    setPattern(Array(localStepAmount).fill(null).map(() => Array(5).fill(false)));
  };

  const loadPattern = (preset: typeof BASS_PATTERNS[number]) => {
    setPattern(preset.pattern);
    setParams(prev => ({
      ...prev,
      rootNote: preset.scale.rootNote,
      octave: preset.scale.octave,
      selectedScale: preset.scale.selectedScale
    }));
  };

  return (
    <div className="bg-black/40 p-4 border border-red-900/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-red-500/50 hover:text-red-500 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
            <Music className="w-4 h-4" />
            Bass Synth
          </h3>
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500/70 text-xs font-mono">Steps:</span>
              <select
                value={localStepAmount}
                onChange={(e) => handleStepAmountChange(parseInt(e.target.value))}
                className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
              >
                {STEP_OPTIONS.map(amount => (
                  <option key={amount} value={amount}>{amount}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value === 'save') {
                    setShowSaveDialog(true);
                  } else {
                    const preset = presets.find(p => p.id === e.target.value);
                    if (preset) handleLoadPreset(preset);
                  }
                  e.target.value = '';
                }}
                className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
                disabled={isLoadingPresets}
              >
                <option value="">User Presets</option>
                <option value="save">Save Current...</option>
                {presets.map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>

              <select
                onChange={(e) => {
                  const pattern = BASS_PATTERNS.find(p => p.name === e.target.value);
                  if (pattern) loadPattern(pattern);
                  e.target.value = '';
                }}
                className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
              >
                <option value="">Load Pattern</option>
                {BASS_PATTERNS.map(pattern => (
                  <option key={pattern.name} value={pattern.name}>{pattern.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {showSaveDialog && (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Preset name..."
            className="flex-1 bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
          />
          <button
            onClick={handleSavePreset}
            disabled={isSavingPreset || !newPresetName.trim()}
            className="px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40 disabled:opacity-50"
          >
            {isSavingPreset ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => {
              setShowSaveDialog(false);
              setNewPresetName('');
            }}
            className="px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
          >
            Cancel
          </button>
        </div>
      )}

      {!isCollapsed && (
        <>
          <div className="overflow-x-auto pb-4 relative">
            <div 
              className="inline-flex gap-1 min-w-full" 
              style={{ 
                width: `max(100%, ${stepAmount * 40}px)`,
                paddingBottom: '12px'
              }}
            >
              {pattern.map((step, stepIndex) => (
                <div key={stepIndex} className="space-y-1">
                  {Scale.get(`${params.rootNote}${params.octave} ${params.selectedScale}`).notes.map((note, noteIndex) => (
                    <button
                      key={`${stepIndex}-${noteIndex}`}
                      onClick={() => toggleStep(stepIndex, noteIndex)}
                      className={`
                        w-10 h-12 border transition-colors relative
                        ${stepIndex === currentStep ? 'border-red-500' : 'border-red-500/40'}
                        ${step[noteIndex]
                          ? 'bg-red-900/40 border-red-400/70' 
                          : 'hover:border-red-400/70'
                        }
                        ${stepIndex % 4 === 0 ? 'border-l-2 border-l-red-500/60' : ''}
                      `}
                    >
                      <span className="text-sm font-mono text-red-500/70 absolute inset-0 flex items-center justify-center">
                        {note}
                      </span>
                    </button>
                  ))}
                  {stepIndex % 4 === 0 && (
                    <div className="absolute -top-6 left-0 text-xs font-mono text-red-500/50">
                      {stepIndex + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-4 mb-6">
            <button
              onClick={clearPattern}
              className="px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
            >
              <Trash2 className="w-4 h-4 inline-block mr-2" />
              Clear Pattern
            </button>
            <button
              onClick={() => {
                const randomPattern = BASS_PATTERNS[Math.floor(Math.random() * BASS_PATTERNS.length)];
                loadPattern(randomPattern);
              }}
              className="px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
            >
              <Zap className="w-4 h-4 inline-block mr-2" />
              Random Pattern
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-red-900/20">
            <div className="space-y-2">
              <div className="text-xs font-mono text-red-500/70">Scale</div>
              <div className="space-y-2">
                <select
                  value={params.rootNote}
                  onChange={(e) => setParams(prev => ({ ...prev, rootNote: e.target.value }))}
                  className="w-full bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
                >
                  {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => (
                    <option key={note} value={note}>{note}</option>
                  ))}
                </select>

                <select
                  value={params.selectedScale}
                  onChange={(e) => setParams(prev => ({ ...prev, selectedScale: e.target.value }))}
                  className="w-full bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
                >
                  {['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'].map(scale => (
                    <option key={scale} value={scale}>
                      {scale.charAt(0).toUpperCase() + scale.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={params.octave}
                  onChange={(e) => setParams(prev => ({ ...prev, octave: parseInt(e.target.value) }))}
                  className="w-full bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
                >
                  {[1, 2, 3, 4].map(oct => (
                    <option key={oct} value={oct}>Octave {oct}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-red-500/70">Oscillator</div>
              <select
                value={params.oscillatorType}
                onChange={(e) => setParams(prev => ({ ...prev, oscillatorType: e.target.value as OscillatorType }))}
                className="w-full bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
              >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Saw</option>
                <option value="triangle">Triangle</option>
              </select>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col items-center">
                  <Knob
                    value={params.filterFreq}
                    min={20}
                    max={20000}
                    onChange={(value) => setParams(prev => ({ ...prev, filterFreq: value }))}
                    label="Filter"
                  />
                  <div className="text-red-300/50 text-xs font-mono mt-1">
                    {params.filterFreq}Hz
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <Knob
                    value={params.filterQ}
                    min={0.1}
                    max={20}
                    onChange={(value) => setParams(prev => ({ ...prev, filterQ: value }))}
                    label="Resonance"
                  />
                  <div className="text-red-300/50 text-xs font-mono mt-1">
                    Q: {params.filterQ.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-red-500/70">Envelope</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <Knob
                    value={params.attack}
                    min={0.01}
                    max={2}
                    onChange={(value) => setParams(prev => ({ ...prev, attack: value }))}
                    label="Attack"
                  />
                  <div className="text-red-300/50 text-xs font-mono mt-1">
                    {params.attack.toFixed(2)}s
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <Knob
                    value={params.decay}
                    min={0.01}
                    max={2}
                    onChange={(value) => setParams(prev => ({ ...prev, decay: value }))}
                    label="Decay"
                  />
                  <div className="text-red-300/50 text-xs font-mono mt-1">
                    {params.decay.toFixed(2)}s
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <Knob
                    value={params.sustain}
                    min={0}
                    max={1}
                    onChange={(value) => setParams(prev => ({ ...prev, sustain: value }))}
                    label="Sustain"
                  />
                  <div className="text-red-300/50 text-xs font-mono mt-1">
                    {Math.round(params.sustain * 100)}%
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <Knob
                    value={params.release}
                    min={0.01}
                    max={4}
                    onChange={(value) => setParams(prev => ({ ...prev, release: value }))}
                    label="Release"
                  />
                  <div className="text-red-300/50 text-xs font-mono mt-1">
                    {params.release.toFixed(2)}s
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

BassTrack.displayName = 'BassTrack';

export default BassTrack;