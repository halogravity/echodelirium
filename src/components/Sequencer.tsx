import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, Music2, Volume2, Clock, Plus } from 'lucide-react';
import DrumTrack from './DrumTrack';
import BassTrack from './BassTrack';
import PolyTrack from './PolyTrack';
import type { DrumTrackRef } from './DrumTrack';
import type { BassTrackRef } from './BassTrack';
import type { PolyTrackRef } from './PolyTrack';

const STEP_OPTIONS = [4, 8, 16, 32, 64] as const;
type StepAmount = typeof STEP_OPTIONS[number];

interface Track {
  id: string;
  type: 'drum' | 'bass' | 'poly';
  ref: React.RefObject<DrumTrackRef | BassTrackRef | PolyTrackRef>;
  defaultSamplePath?: string;
  name?: string;
}

const Sequencer: React.FC = () => {
  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepAmount, setStepAmount] = useState<StepAmount>(16);
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: 'kick',
      type: 'drum',
      ref: useRef<DrumTrackRef>(null),
      defaultSamplePath: '/samples/kick.wav',
      name: 'Kick'
    },
    {
      id: 'snare',
      type: 'drum',
      ref: useRef<DrumTrackRef>(null),
      defaultSamplePath: '/samples/snare.wav',
      name: 'Snare'
    },
    {
      id: 'hihat',
      type: 'drum',
      ref: useRef<DrumTrackRef>(null),
      defaultSamplePath: '/samples/hihat.wav',
      name: 'Hi-hat'
    },
    {
      id: 'bass',
      type: 'bass',
      ref: useRef<BassTrackRef>(null),
      name: 'Bass Synth'
    }
  ]);

  const intervalRef = useRef<number | null>(null);
  const currentStepRef = useRef(currentStep);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const startSequencer = () => {
    if (isPlaying) {
      stopSequencer();
      return;
    }

    setIsPlaying(true);
    setCurrentStep(0);
    currentStepRef.current = 0;

    const stepTime = (60 / bpm) * 1000 / 4; // 16th notes
    intervalRef.current = window.setInterval(() => {
      const step = currentStepRef.current;

      // Calculate swing offset
      const isEvenStep = step % 2 === 0;
      const swingOffset = isEvenStep ? 0 : (stepTime * swing * 0.5);

      // Schedule tracks to play
      tracks.forEach(track => {
        if (track.ref.current) {
          setTimeout(() => {
            track.ref.current?.playStep(step);
          }, swingOffset);
        }
      });

      setCurrentStep(prev => (prev + 1) % stepAmount);
      currentStepRef.current = (currentStepRef.current + 1) % stepAmount;
    }, stepTime);
  };

  const stopSequencer = () => {
    setIsPlaying(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentStep(0);
    currentStepRef.current = 0;

    // Stop all tracks
    tracks.forEach(track => {
      if (track.ref.current) {
        track.ref.current.stop();
      }
    });
  };

  const handleStepAmountChange = (steps: number) => {
    setStepAmount(steps as StepAmount);
  };

  const addTrack = (type: Track['type']) => {
    const newTrack: Track = {
      id: `${type}-${Date.now()}`,
      type,
      ref: React.createRef<DrumTrackRef | BassTrackRef | PolyTrackRef>(),
      name: type === 'drum' ? 'Drum' : type === 'bass' ? 'Bass Synth' : 'Poly Synth'
    };
    setTracks(prev => [...prev, newTrack]);
  };

  return (
    <div className="min-h-screen bg-black/40 relative">
      <div className="fixed top-16 left-0 right-0 z-40 bg-black/95 border-b border-red-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={startSequencer}
                className={`
                  flex items-center gap-2 px-4 py-2 transition-colors relative overflow-hidden
                  ${isPlaying
                    ? 'bg-red-900/40 border-red-600/50 text-red-500'
                    : 'bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-900/30'
                  }
                `}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500/70" />
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-16 bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-sm font-mono"
                  min="20"
                  max="300"
                />
                <span className="text-red-500/70 text-sm font-mono">BPM</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-red-500/70 text-sm font-mono">Steps:</span>
                <select
                  value={stepAmount}
                  onChange={(e) => handleStepAmountChange(parseInt(e.target.value))}
                  className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-sm font-mono"
                >
                  {STEP_OPTIONS.map(amount => (
                    <option key={amount} value={amount}>{amount}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-red-500/70 text-sm font-mono">Swing:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={swing}
                  onChange={(e) => setSwing(parseFloat(e.target.value))}
                  className="w-24 accent-red-500"
                />
                <span className="text-red-500/50 text-xs font-mono">
                  {Math.round(swing * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => addTrack('drum')}
                className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
              >
                <Plus className="w-4 h-4" />
                Drum
              </button>
              <button
                onClick={() => addTrack('bass')}
                className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
              >
                <Plus className="w-4 h-4" />
                Bass Synth
              </button>
              <button
                onClick={() => addTrack('poly')}
                className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
              >
                <Plus className="w-4 h-4" />
                Poly Synth
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-40 px-6 space-y-4">
        {tracks.map(track => {
          if (track.type === 'drum') {
            return (
              <DrumTrack
                key={track.id}
                ref={track.ref as React.RefObject<DrumTrackRef>}
                currentStep={currentStep}
                stepAmount={stepAmount}
                defaultSamplePath={track.defaultSamplePath}
                name={track.name}
              />
            );
          } else if (track.type === 'bass') {
            return (
              <BassTrack
                key={track.id}
                ref={track.ref as React.RefObject<BassTrackRef>}
                currentStep={currentStep}
                stepAmount={stepAmount}
              />
            );
          } else {
            return (
              <PolyTrack
                key={track.id}
                ref={track.ref as React.RefObject<PolyTrackRef>}
                currentStep={currentStep}
                stepAmount={stepAmount}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default Sequencer;