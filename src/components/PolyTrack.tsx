import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as Tone from 'tone';
import { Scale, Chord } from 'tonal';
import { Music, Settings2, Save, FolderOpen, Trash2, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import Knob from './Knob';

interface PolyTrackProps {
  currentStep: number;
  stepAmount: number;
}

export interface PolyTrackRef {
  getCurrentNotes: () => string[];
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
  chordProgression: string[];
}

const STEP_OPTIONS = [4, 8, 16, 32, 64] as const;
type StepAmount = typeof STEP_OPTIONS[number];

// Predefined chord progressions and patterns
const POLY_PATTERNS: PatternPreset[] = [
  {
    name: "Ambient Pad",
    pattern: Array(16).fill(null).map((_, i) => [
      i % 8 === 0, // Root
      i % 8 === 0, // Third
      i % 8 === 0, // Fifth
      i % 8 === 4, // Seventh
      false
    ]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'major' },
    chordProgression: ['Cmaj7', 'Am7', 'Fmaj7', 'G7']
  },
  {
    name: "Dark Chords",
    pattern: Array(16).fill(null).map((_, i) => [
      i % 4 === 0,
      i % 4 === 0,
      i % 4 === 0,
      i % 8 === 4,
      false
    ]),
    scale: { rootNote: 'C', octave: 3, selectedScale: 'minor' },
    chordProgression: ['Cm7', 'Ab7', 'Gm7b5', 'Bb7']
  },
  {
    name: "Ethereal Pads",
    pattern: Array(16).fill(null).map((_, i) => [
      i === 0 || i === 8,
      i === 0 || i === 8,
      i === 0 || i === 8,
      i === 4 || i === 12,
      false
    ]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'lydian' },
    chordProgression: ['Cmaj9', 'Em9', 'Fmaj9', 'Dm9']
  },
  {
    name: "Trance Chords",
    pattern: Array(16).fill(null).map((_, i) => [
      i % 4 === 0,
      i % 4 === 1,
      i % 4 === 2,
      i % 4 === 3,
      false
    ]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'minor' },
    chordProgression: ['Cm', 'Ab', 'Bb', 'Gm']
  },
  {
    name: "Jazz Voicings",
    pattern: Array(16).fill(null).map((_, i) => [
      i % 2 === 0,
      i % 4 === 1,
      i % 4 === 2,
      i % 8 === 6,
      false
    ]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'dorian' },
    chordProgression: ['Cm9', 'F9', 'Bbmaj7', 'A7alt']
  },
  {
    name: "Cinematic",
    pattern: Array(16).fill(null).map((_, i) => [
      i === 0 || i === 12,
      i === 4 || i === 8,
      i === 2 || i === 10,
      i === 6 || i === 14,
      false
    ]),
    scale: { rootNote: 'C', octave: 3, selectedScale: 'phrygian' },
    chordProgression: ['Cm', 'Ab', 'Fm', 'G']
  }
];

const SOUND_PRESETS = [
  {
    name: "Warm Pad",
    settings: {
      oscillatorType: "sine",
      attack: 0.5,
      decay: 0.8,
      sustain: 0.8,
      release: 1.0,
      filterFreq: 2000,
      filterQ: 1
    }
  },
  {
    name: "Bright Strings",
    settings: {
      oscillatorType: "sawtooth",
      attack: 0.2,
      decay: 0.4,
      sustain: 0.7,
      release: 0.5,
      filterFreq: 4000,
      filterQ: 2
    }
  },
  {
    name: "Dark Atmosphere",
    settings: {
      oscillatorType: "triangle",
      attack: 1.0,
      decay: 1.5,
      sustain: 0.8,
      release: 2.0,
      filterFreq: 1000,
      filterQ: 3
    }
  },
  {
    name: "Crystal Bells",
    settings: {
      oscillatorType: "sine",
      attack: 0.01,
      decay: 0.3,
      sustain: 0.2,
      release: 1.5,
      filterFreq: 8000,
      filterQ: 4
    }
  },
  {
    name: "Analog Dreams",
    settings: {
      oscillatorType: "sawtooth",
      attack: 0.8,
      decay: 1.2,
      sustain: 0.7,
      release: 2.0,
      filterFreq: 3000,
      filterQ: 5
    }
  },
  {
    name: "Glass Texture",
    settings: {
      oscillatorType: "triangle",
      attack: 0.3,
      decay: 0.6,
      sustain: 0.4,
      release: 1.8,
      filterFreq: 6000,
      filterQ: 3
    }
  },
  {
    name: "Ethereal Voices",
    settings: {
      oscillatorType: "sine",
      attack: 1.2,
      decay: 1.5,
      sustain: 0.9,
      release: 3.0,
      filterFreq: 2500,
      filterQ: 2
    }
  },
  {
    name: "Cosmic Sweep",
    settings: {
      oscillatorType: "sawtooth",
      attack: 2.0,
      decay: 1.0,
      sustain: 0.8,
      release: 4.0,
      filterFreq: 1500,
      filterQ: 6
    }
  },
  {
    name: "Digital Choir",
    settings: {
      oscillatorType: "triangle",
      attack: 0.6,
      decay: 0.8,
      sustain: 0.9,
      release: 2.5,
      filterFreq: 3500,
      filterQ: 2
    }
  },
  {
    name: "Quantum Waves",
    settings: {
      oscillatorType: "square",
      attack: 1.5,
      decay: 1.2,
      sustain: 0.6,
      release: 3.5,
      filterFreq: 2000,
      filterQ: 8
    }
  }
];

const PolyTrack = forwardRef<PolyTrackRef, PolyTrackProps>(({ currentStep, stepAmount }, ref) => {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const currentNotesRef = useRef<string[]>([]);
  const patternRef = useRef<boolean[][]>([]);
  const [savedPatterns, setSavedPatterns] = useState<PatternPreset[]>(() => {
    const saved = localStorage.getItem('polyPatterns');
    return saved ? JSON.parse(saved) : [];
  });
  const [newPatternName, setNewPatternName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localStepAmount, setLocalStepAmount] = useState<StepAmount>(stepAmount as StepAmount);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [params, setParams] = useState(() => {
    const savedParams = localStorage.getItem('polyParams');
    return savedParams ? JSON.parse(savedParams) : {
      rootNote: 'C',
      octave: 4,
      selectedScale: 'major',
      attack: 0.1,
      decay: 0.3,
      sustain: 0.8,
      release: 0.5,
      filterFreq: 2000,
      filterQ: 1,
      oscillatorType: "sine" as OscillatorType,
      chordProgression: ['Cmaj7', 'Am7', 'Fmaj7', 'G7']
    };
  });

  const [pattern, setPattern] = useState<boolean[][]>(() => {
    const savedPattern = localStorage.getItem('polyCurrentPattern');
    if (savedPattern) {
      const parsed = JSON.parse(savedPattern);
      if (parsed.length === stepAmount) {
        return parsed;
      }
    }
    return Array(stepAmount).fill(null).map(() => Array(Scale.get(`${params.rootNote}${params.octave} ${params.selectedScale}`).notes.length).fill(false));
  });

  useEffect(() => {
    localStorage.setItem('polyCurrentPattern', JSON.stringify(pattern));
  }, [pattern]);

  useEffect(() => {
    localStorage.setItem('polyParams', JSON.stringify(params));
  }, [params]);

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useEffect(() => {
    localStorage.setItem('polyPatterns', JSON.stringify(savedPatterns));
  }, [savedPatterns]);

  useEffect(() => {
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
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
    getCurrentNotes: () => currentNotesRef.current,
    stopCurrentNotes: () => {
      if (synthRef.current && currentNotesRef.current.length > 0) {
        synthRef.current.triggerRelease(currentNotesRef.current);
        currentNotesRef.current = [];
      }
    },
    playStep: (step: number, time?: number) => {
      if (!synthRef.current || step >= patternRef.current.length) return;

      const chordIndex = Math.floor(step / 4) % params.chordProgression.length;
      const currentChord = params.chordProgression[chordIndex];
      const chordNotes = Chord.get(currentChord).notes.map(note => `${note}${params.octave}`);

      const timeOffset = 0.001;
      const adjustedTime = time ? time + timeOffset : undefined;

      if (currentNotesRef.current.length > 0) {
        synthRef.current.triggerRelease(currentNotesRef.current, adjustedTime);
        currentNotesRef.current = [];
      }

      const stepPattern = patternRef.current[step];
      if (stepPattern.some(isActive => isActive)) {
        synthRef.current.triggerAttack(chordNotes, adjustedTime);
        currentNotesRef.current = chordNotes;
      }
    },
    stop: () => {
      if (synthRef.current && currentNotesRef.current.length > 0) {
        synthRef.current.triggerRelease(currentNotesRef.current);
        currentNotesRef.current = [];
      }
    }
  }), [params.rootNote, params.octave, params.selectedScale, params.chordProgression]);

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
      selectedScale: preset.scale.selectedScale,
      chordProgression: preset.chordProgression
    }));
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
            Poly Synth
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
                const pattern = POLY_PATTERNS.find(p => p.name === e.target.value);
                if (pattern) loadPattern(pattern);
                e.target.value = '';
              }}
              className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
            >
              <option value="">Load Pattern</option>
              {POLY_PATTERNS.map(pattern => (
                <option key={pattern.name} value={pattern.name}>{pattern.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
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
                const randomPattern = POLY_PATTERNS[Math.floor(Math.random() * POLY_PATTERNS.length)];
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
                  {[2, 3, 4, 5, 6].map(oct => (
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

export default PolyTrack;