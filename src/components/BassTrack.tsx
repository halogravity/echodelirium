import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as Tone from 'tone';
import { Scale } from 'tonal';
import { Music, Settings2, Save, FolderOpen, Trash2, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import Knob from './Knob';

interface BassTrackProps {
  currentStep: number;
  stepAmount: number;
}

export interface BassTrackRef {
  getCurrentNote: () => string | null;
  stopCurrentNotes: () => void;
  playStep: (step: number, time?: number) => void;
  stop: () => void;
}

interface PatternPreset {
  name: string;
  pattern: boolean[][];
  scale: {
    rootNote: string;
    octave: number;
    selectedScale: string;
  };
}

const STEP_OPTIONS = [4, 8, 16, 32, 64] as const;
type StepAmount = typeof STEP_OPTIONS[number];

const BASS_PATTERNS: PatternPreset[] = [
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
  },
  {
    name: "Techno Pulse",
    pattern: Array(16).fill(null).map((_, i) => [
      i % 2 === 0,
      i % 8 === 4,
      i % 8 === 6,
      false,
      false
    ]),
    scale: { rootNote: 'C', octave: 2, selectedScale: 'phrygian' }
  }
];

const SOUND_PRESETS = [
  {
    name: "Deep Sub",
    settings: {
      oscillatorType: "sine",
      attack: 0.01,
      decay: 0.3,
      sustain: 0.8,
      release: 0.2,
      filterFreq: 200,
      filterQ: 1
    }
  },
  {
    name: "Acid Bass",
    settings: {
      oscillatorType: "sawtooth",
      attack: 0.01,
      decay: 0.2,
      sustain: 0.6,
      release: 0.1,
      filterFreq: 1200,
      filterQ: 8
    }
  },
  {
    name: "Smooth Bass",
    settings: {
      oscillatorType: "triangle",
      attack: 0.05,
      decay: 0.4,
      sustain: 0.7,
      release: 0.3,
      filterFreq: 800,
      filterQ: 2
    }
  },
  {
    name: "808 Sub",
    settings: {
      oscillatorType: "sine",
      attack: 0.02,
      decay: 0.8,
      sustain: 0.9,
      release: 0.6,
      filterFreq: 100,
      filterQ: 1.5
    }
  },
  {
    name: "Reese Bass",
    settings: {
      oscillatorType: "sawtooth",
      attack: 0.05,
      decay: 0.3,
      sustain: 0.8,
      release: 0.4,
      filterFreq: 400,
      filterQ: 6
    }
  },
  {
    name: "Pluck Bass",
    settings: {
      oscillatorType: "triangle",
      attack: 0.001,
      decay: 0.1,
      sustain: 0.3,
      release: 0.1,
      filterFreq: 2000,
      filterQ: 4
    }
  },
  {
    name: "FM Bass",
    settings: {
      oscillatorType: "square",
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
      filterFreq: 600,
      filterQ: 3
    }
  },
  {
    name: "Wobble Bass",
    settings: {
      oscillatorType: "sawtooth",
      attack: 0.05,
      decay: 0.6,
      sustain: 0.8,
      release: 0.5,
      filterFreq: 300,
      filterQ: 10
    }
  },
  {
    name: "Analog Bass",
    settings: {
      oscillatorType: "triangle",
      attack: 0.03,
      decay: 0.3,
      sustain: 0.6,
      release: 0.4,
      filterFreq: 1000,
      filterQ: 2.5
    }
  },
  {
    name: "Distorted Bass",
    settings: {
      oscillatorType: "square",
      attack: 0.02,
      decay: 0.4,
      sustain: 0.7,
      release: 0.3,
      filterFreq: 1500,
      filterQ: 5
    }
  }
];

const BassTrack = forwardRef<BassTrackRef, BassTrackProps>(({ currentStep, stepAmount }, ref) => {
  const synthRef = useRef<Tone.MonoSynth | null>(null);
  const currentNoteRef = useRef<string | null>(null);
  const patternRef = useRef<boolean[][]>([]);
  const [savedPatterns, setSavedPatterns] = useState<PatternPreset[]>(() => {
    const saved = localStorage.getItem('bassPatterns');
    return saved ? JSON.parse(saved) : [];
  });
  const [newPatternName, setNewPatternName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localStepAmount, setLocalStepAmount] = useState<StepAmount>(stepAmount as StepAmount);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [params, setParams] = useState(() => {
    const savedParams = localStorage.getItem('bassParams');
    return savedParams ? JSON.parse(savedParams) : {
      rootNote: 'C',
      octave: 2,
      selectedScale: 'major',
      attack: 0.01,
      decay: 0.3,
      sustain: 0.8,
      release: 0.2,
      filterFreq: 800,
      filterQ: 2,
      oscillatorType: "sawtooth" as OscillatorType
    };
  });

  const [pattern, setPattern] = useState<boolean[][]>(() => {
    const savedPattern = localStorage.getItem('bassCurrentPattern');
    if (savedPattern) {
      const parsed = JSON.parse(savedPattern);
      if (parsed.length === stepAmount) {
        return parsed;
      }
    }
    const scaleNotes = Scale.get(`${params.rootNote}${params.octave} ${params.selectedScale}`).notes;
    return Array(stepAmount).fill(null).map(() => Array(scaleNotes.length).fill(false));
  });

  useEffect(() => {
    localStorage.setItem('bassCurrentPattern', JSON.stringify(pattern));
  }, [pattern]);

  useEffect(() => {
    localStorage.setItem('bassParams', JSON.stringify(params));
  }, [params]);

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useEffect(() => {
    localStorage.setItem('bassPatterns', JSON.stringify(savedPatterns));
  }, [savedPatterns]);

  useEffect(() => {
    if (!synthRef.current) {
      synthRef.current = new Tone.MonoSynth({
        oscillator: { type: params.oscillatorType },
        envelope: {
          attack: params.attack,
          decay: params.decay,
          sustain: params.sustain,
          release: params.release
        },
        filter: {
          Q: params.filterQ,
          frequency: params.filterFreq,
          type: 'lowpass',
          rolloff: -24
        }
      }).toDestination();
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
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
    const scaleNotes = Scale.get(`${params.rootNote}${params.octave} ${params.selectedScale}`).notes;
    const newPattern = Array(stepAmount).fill(null).map((_, stepIndex) => {
      if (stepIndex < pattern.length) {
        const existingRow = pattern[stepIndex];
        if (existingRow.length === scaleNotes.length) {
          return [...existingRow];
        }
        return Array(scaleNotes.length).fill(false).map((_, noteIndex) => 
          noteIndex < existingRow.length ? existingRow[noteIndex] : false
        );
      }
      return Array(scaleNotes.length).fill(false);
    });
    setPattern(newPattern);
  }, [stepAmount, params.rootNote, params.octave, params.selectedScale]);

  useEffect(() => {
    if (scrollContainerRef.current && currentStep > 0) {
      const container = scrollContainerRef.current;
      const stepWidth = 40;
      const containerWidth = container.clientWidth;
      const scrollPosition = container.scrollLeft;
      const stepPosition = currentStep * stepWidth;

      if (stepPosition < scrollPosition || stepPosition > scrollPosition + containerWidth - stepWidth) {
        container.scrollTo({
          left: Math.max(0, stepPosition - containerWidth / 2 + stepWidth),
          behavior: 'smooth'
        });
      }
    }
  }, [currentStep]);

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

      const scaleNotes = Scale.get(`${params.rootNote}${params.octave} ${params.selectedScale}`).notes;
      const stepPattern = patternRef.current[step];
      const activeNotes = stepPattern
        .map((isActive, index) => isActive ? scaleNotes[index] : null)
        .filter(Boolean) as string[];

      const timeOffset = 0.001;
      const adjustedTime = time ? time + timeOffset : undefined;

      if (currentNoteRef.current) {
        synthRef.current.triggerRelease(adjustedTime);
        currentNoteRef.current = null;
      }

      if (activeNotes.length > 0) {
        const note = activeNotes[0];
        synthRef.current.triggerAttack(note, adjustedTime);
        currentNoteRef.current = note;
      }
    },
    stop: () => {
      if (synthRef.current && currentNoteRef.current) {
        synthRef.current.triggerRelease();
        currentNoteRef.current = null;
      }
    }
  }), [params.rootNote, params.octave, params.selectedScale]);

  const toggleNote = (stepIndex: number, noteIndex: number) => {
    setPattern(prevPattern => 
      prevPattern.map((step, i) =>
        i === stepIndex
          ? step.map((isActive, j) => j === noteIndex ? !isActive : isActive)
          : step
      )
    );
  };

  const clearPattern = () => {
    const emptyPattern = Array(stepAmount).fill(null).map(() => 
      Array(Scale.get(`${params.rootNote}${params.octave} ${params.selectedScale}`).notes.length).fill(false)
    );
    setPattern(emptyPattern);
  };

  const loadPreset = (preset: typeof SOUND_PRESETS[0]) => {
    setParams(prev => ({
      ...prev,
      ...preset.settings
    }));
  };

  const loadPattern = (preset: PatternPreset) => {
    setPattern(preset.pattern);
    setParams(prev => ({
      ...prev,
      rootNote: preset.scale.rootNote,
      octave: preset.scale.octave,
      selectedScale: preset.scale.selectedScale
    }));
  };

  const savePattern = () => {
    if (!newPatternName.trim()) return;

    const newPattern: PatternPreset = {
      name: newPatternName,
      pattern,
      scale: {
        rootNote: params.rootNote,
        octave: params.octave,
        selectedScale: params.selectedScale
      }
    };

    setSavedPatterns(prev => [...prev, newPattern]);
    setNewPatternName('');
    setShowSaveDialog(false);
  };

  const deletePattern = (index: number) => {
    setSavedPatterns(prev => prev.filter((_, i) => i !== index));
  };

  const handleStepAmountChange = (steps: number) => {
    setLocalStepAmount(steps as StepAmount);
    const newPattern = Array(steps).fill(null).map((_, stepIndex) => {
      if (stepIndex < pattern.length) {
        return [...pattern[stepIndex]];
      }
      return Array(Scale.get(`${params.rootNote}${params.octave} ${params.selectedScale}`).notes.length).fill(false);
    });
    setPattern(newPattern);
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

            <select
              onChange={(e) => {
                const preset = SOUND_PRESETS.find(p => p.name === e.target.value);
                if (preset) loadPreset(preset);
              }}
              className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
            >
              <option value="">Load Sound Preset</option>
              {SOUND_PRESETS.map(preset => (
                <option key={preset.name} value={preset.name}>{preset.name}</option>
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

            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
            >
              <Save className="w-4 h-4" />
              Save Pattern
            </button>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          {showSaveDialog && (
            <div className="mb-4 flex items-center gap-2 bg-black/40 p-3 border border-red-900/20">
              <input
                type="text"
                value={newPatternName}
                onChange={(e) => setNewPatternName(e.target.value)}
                placeholder="Pattern name..."
                className="flex-1 bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
              />
              <button
                onClick={savePattern}
                className="px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
              >
                Save
              </button>
            </div>
          )}

          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 relative"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(220, 38, 38, 0.3) rgba(0, 0, 0, 0.3)'
            }}
          >
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
                      onClick={() => toggleNote(stepIndex, noteIndex)}
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

      <style jsx>{`
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(220, 38, 38, 0.3);
          border-radius: 4px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(220, 38, 38, 0.5);
        }
      `}</style>
    </div>
  );
});

export default BassTrack;