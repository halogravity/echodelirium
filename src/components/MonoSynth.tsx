import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Scale } from 'tonal';
import { Music, Settings2 } from 'lucide-react';
import Knob from './Knob';
import PianoRoll from './PianoRoll';

interface MonoSynthProps {
  onNoteOn?: (note: string) => void;
  onNoteOff?: (note: string) => void;
}

const SCALES = [
  'major',
  'minor',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'locrian',
  'harmonicMinor',
  'melodicMinor'
];

const OCTAVE_COLORS = [
  'from-red-900/20 to-red-800/20',
  'from-red-800/20 to-red-700/20',
  'from-red-700/20 to-red-600/20',
  'from-red-600/20 to-red-500/20'
];

const MonoSynth: React.FC<MonoSynthProps> = ({ onNoteOn, onNoteOff }) => {
  const [synth, setSynth] = useState<Tone.MonoSynth | null>(null);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [rootNote, setRootNote] = useState('C');
  const [octave, setOctave] = useState(4);
  const [selectedScale, setSelectedScale] = useState('major');
  const [attack, setAttack] = useState(0.1);
  const [decay, setDecay] = useState(0.2);
  const [sustain, setSustain] = useState(0.5);
  const [release, setRelease] = useState(0.5);
  const [filterFreq, setFilterFreq] = useState(2000);
  const [filterQ, setFilterQ] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const sequencerRef = useRef<number | null>(null);

  useEffect(() => {
    const newSynth = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack, decay, sustain, release },
      filter: {
        Q: filterQ,
        frequency: filterFreq,
        type: 'lowpass'
      }
    }).toDestination();

    setSynth(newSynth);
    return () => newSynth.dispose();
  }, []);

  useEffect(() => {
    if (synth) {
      synth.envelope.attack = attack;
      synth.envelope.decay = decay;
      synth.envelope.sustain = sustain;
      synth.envelope.release = release;
      synth.filter.frequency.value = filterFreq;
      synth.filter.Q.value = filterQ;
    }
  }, [synth, attack, decay, sustain, release, filterFreq, filterQ]);

  const handleNoteChange = (step: number, note: string | null) => {
    // Handle note changes from piano roll
    console.log(`Step ${step}: ${note}`);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (sequencerRef.current) {
        window.clearInterval(sequencerRef.current);
        sequencerRef.current = null;
      }
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      const stepTime = (60 / bpm) * 1000 / 4; // 16th notes
      sequencerRef.current = window.setInterval(() => {
        setCurrentStep(step => (step + 1) % 16);
      }, stepTime);
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-black/40 p-4 border border-red-900/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
          <Music className="w-4 h-4" />
          MonoSynth
        </h3>

        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-red-500/70 text-xs font-mono">BPM:</span>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="w-16 bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
              min="20"
              max="300"
            />
          </div>

          <button
            onClick={() => setShowControls(!showControls)}
            className="text-red-500/70 hover:text-red-500 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showControls && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="flex flex-col items-center">
              <Knob
                value={attack}
                min={0.01}
                max={2}
                onChange={setAttack}
                label="Attack"
              />
              <div className="text-red-300/50 text-xs font-mono mt-1">
                {attack.toFixed(2)}s
              </div>
            </div>

            <div className="flex flex-col items-center">
              <Knob
                value={decay}
                min={0.01}
                max={2}
                onChange={setDecay}
                label="Decay"
              />
              <div className="text-red-300/50 text-xs font-mono mt-1">
                {decay.toFixed(2)}s
              </div>
            </div>

            <div className="flex flex-col items-center">
              <Knob
                value={sustain}
                min={0}
                max={1}
                onChange={setSustain}
                label="Sustain"
              />
              <div className="text-red-300/50 text-xs font-mono mt-1">
                {Math.round(sustain * 100)}%
              </div>
            </div>

            <div className="flex flex-col items-center">
              <Knob
                value={release}
                min={0.01}
                max={4}
                onChange={setRelease}
                label="Release"
              />
              <div className="text-red-300/50 text-xs font-mono mt-1">
                {release.toFixed(2)}s
              </div>
            </div>

            <div className="flex flex-col items-center">
              <Knob
                value={filterFreq}
                min={20}
                max={20000}
                onChange={setFilterFreq}
                label="Filter"
              />
              <div className="text-red-300/50 text-xs font-mono mt-1">
                {filterFreq}Hz
              </div>
            </div>

            <div className="flex flex-col items-center">
              <Knob
                value={filterQ}
                min={0.1}
                max={20}
                onChange={setFilterQ}
                label="Resonance"
              />
              <div className="text-red-300/50 text-xs font-mono mt-1">
                Q: {filterQ.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={rootNote}
              onChange={(e) => setRootNote(e.target.value)}
              className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-sm font-mono"
            >
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => (
                <option key={note} value={note}>{note}</option>
              ))}
            </select>

            <select
              value={selectedScale}
              onChange={(e) => setSelectedScale(e.target.value)}
              className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-sm font-mono"
            >
              {SCALES.map(scale => (
                <option key={scale} value={scale}>
                  {scale.charAt(0).toUpperCase() + scale.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={octave}
              onChange={(e) => setOctave(parseInt(e.target.value))}
              className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-sm font-mono"
            >
              {[2, 3, 4, 5, 6].map(oct => (
                <option key={oct} value={oct}>Octave {oct}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="mt-6">
        <PianoRoll
          width={800}
          height={300}
          steps={16}
          rootNote={rootNote}
          octave={octave}
          scale={selectedScale}
          onNoteChange={handleNoteChange}
          currentStep={currentStep}
        />
      </div>
    </div>
  );
};

export default MonoSynth;