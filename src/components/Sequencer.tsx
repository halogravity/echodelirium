import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, Music2, Volume2, Clock, Plus, ArrowDownUp } from 'lucide-react';
import DrumTrack from './DrumTrack';
import BassTrack from './BassTrack';
import PolyTrack from './PolyTrack';
import type { DrumTrackRef } from './DrumTrack';
import type { BassTrackRef } from './BassTrack';
import type { PolyTrackRef } from './PolyTrack';

interface Track {
  id: string;
  type: 'drum' | 'bass' | 'poly';
  ref: React.RefObject<DrumTrackRef | BassTrackRef | PolyTrackRef>;
  defaultSamplePath?: string;
  name?: string;
  stepAmount: number;
  currentStep: number;
  bpm: number;
  lastStepTime: number;
}

const Sequencer: React.FC = () => {
  const [swing, setSwing] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterBpm, setMasterBpm] = useState(120);
  const [showBpmSync, setShowBpmSync] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: 'kick',
      type: 'drum',
      ref: useRef<DrumTrackRef>(null),
      defaultSamplePath: '/samples/kick.wav',
      name: 'Kick',
      stepAmount: 16,
      currentStep: 0,
      bpm: 120,
      lastStepTime: 0
    },
    {
      id: 'snare',
      type: 'drum',
      ref: useRef<DrumTrackRef>(null),
      defaultSamplePath: '/samples/snare.wav',
      name: 'Snare',
      stepAmount: 16,
      currentStep: 0,
      bpm: 120,
      lastStepTime: 0
    },
    {
      id: 'hihat',
      type: 'drum',
      ref: useRef<DrumTrackRef>(null),
      defaultSamplePath: '/samples/hihat.wav',
      name: 'Hi-hat',
      stepAmount: 16,
      currentStep: 0,
      bpm: 120,
      lastStepTime: 0
    },
    {
      id: 'bass',
      type: 'bass',
      ref: useRef<BassTrackRef>(null),
      name: 'Bass Synth',
      stepAmount: 16,
      currentStep: 0,
      bpm: 120,
      lastStepTime: 0
    }
  ]);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const updateTracks = (timestamp: number) => {
    if (!isPlaying) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    setTracks(prev => prev.map(track => {
      const stepTime = (60 / track.bpm) * 1000 / 4; // 16th notes
      const timeSinceLastStep = timestamp - track.lastStepTime;

      if (timeSinceLastStep >= stepTime) {
        // Calculate swing offset
        const isEvenStep = track.currentStep % 2 === 0;
        const swingOffset = isEvenStep ? 0 : (stepTime * swing * 0.5);

        // Play the step with swing offset
        setTimeout(() => {
          if (track.ref.current) {
            track.ref.current.playStep(track.currentStep);
          }
        }, swingOffset);

        // Update track state
        return {
          ...track,
          currentStep: (track.currentStep + 1) % track.stepAmount,
          lastStepTime: timestamp
        };
      }

      return track;
    }));

    animationFrameRef.current = requestAnimationFrame(updateTracks);
  };

  const startSequencer = () => {
    if (isPlaying) {
      stopSequencer();
      return;
    }

    // Initialize all tracks
    tracks.forEach(track => {
      if (track.ref.current) {
        // Reset track state
        track.ref.current.stop();
      }
    });

    setIsPlaying(true);
    setTracks(prev => prev.map(track => ({
      ...track,
      currentStep: 0,
      lastStepTime: performance.now()
    })));

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(updateTracks);
  };

  const stopSequencer = () => {
    setIsPlaying(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Stop all tracks and reset their state
    tracks.forEach(track => {
      if (track.ref.current) {
        track.ref.current.stop();
      }
    });

    setTracks(prev => prev.map(track => ({
      ...track,
      currentStep: 0
    })));
  };

  const syncAllBpms = () => {
    setTracks(prev => prev.map(track => ({
      ...track,
      bpm: masterBpm
    })));
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Stop all tracks when component unmounts
      tracks.forEach(track => {
        if (track.ref.current) {
          track.ref.current.stop();
        }
      });
    };
  }, []);

  const handleTrackStepAmountChange = (trackId: string, steps: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, stepAmount: steps, currentStep: track.currentStep % steps }
        : track
    ));
  };

  const handleTrackBpmChange = (trackId: string, bpm: number) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId
        ? { ...track, bpm: Math.max(20, Math.min(300, bpm)) }
        : track
    ));
  };

  const addTrack = (type: Track['type']) => {
    const newTrack: Track = {
      id: `${type}-${Date.now()}`,
      type,
      ref: React.createRef<DrumTrackRef | BassTrackRef | PolyTrackRef>(),
      name: type === 'drum' ? 'Drum' : type === 'bass' ? 'Bass Synth' : 'Poly Synth',
      stepAmount: 16,
      currentStep: 0,
      bpm: masterBpm,
      lastStepTime: performance.now()
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

              <button
                onClick={() => setShowBpmSync(!showBpmSync)}
                className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
              >
                <ArrowDownUp className="w-4 h-4" />
                Sync BPM
              </button>

              {showBpmSync && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={masterBpm}
                    onChange={(e) => setMasterBpm(parseInt(e.target.value))}
                    className="w-16 bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-sm font-mono"
                    min="20"
                    max="300"
                  />
                  <button
                    onClick={syncAllBpms}
                    className="px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
                  >
                    Apply
                  </button>
                </div>
              )}
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
                currentStep={track.currentStep}
                stepAmount={track.stepAmount}
                defaultSamplePath={track.defaultSamplePath}
                name={track.name}
                bpm={track.bpm}
                onBpmChange={(bpm) => handleTrackBpmChange(track.id, bpm)}
                onStepAmountChange={(steps) => handleTrackStepAmountChange(track.id, steps)}
              />
            );
          } else if (track.type === 'bass') {
            return (
              <BassTrack
                key={track.id}
                ref={track.ref as React.RefObject<BassTrackRef>}
                currentStep={track.currentStep}
                stepAmount={track.stepAmount}
                bpm={track.bpm}
                onBpmChange={(bpm) => handleTrackBpmChange(track.id, bpm)}
                onStepAmountChange={(steps) => handleTrackStepAmountChange(track.id, steps)}
              />
            );
          } else {
            return (
              <PolyTrack
                key={track.id}
                ref={track.ref as React.RefObject<PolyTrackRef>}
                currentStep={track.currentStep}
                stepAmount={track.stepAmount}
                bpm={track.bpm}
                onBpmChange={(bpm) => handleTrackBpmChange(track.id, bpm)}
                onStepAmountChange={(steps) => handleTrackStepAmountChange(track.id, steps)}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default Sequencer;