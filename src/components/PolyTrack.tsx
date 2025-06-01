import React, { useState, useEffect, useCallback } from 'react';
import Knob from './Knob';
import * as Tone from 'tone';

interface PolyTrackProps {
  onNoteChange?: (note: string, step: number) => void;
  steps: number;
  currentStep: number;
}

const PolyTrack: React.FC<PolyTrackProps> = ({ onNoteChange, steps, currentStep }) => {
  const [synth, setSynth] = useState<Tone.PolySynth | null>(null);
  const [volume, setVolume] = useState<number>(-12);
  const [notes, setNotes] = useState<string[]>(Array(steps).fill(''));

  useEffect(() => {
    const newSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    newSynth.volume.value = volume;
    setSynth(synth);

    return () => {
      newSynth.dispose();
    };
  }, []);

  useEffect(() => {
    if (synth) {
      synth.volume.value = volume;
    }
  }, [volume, synth]);

  const handleNoteChange = useCallback((note: string, step: number) => {
    setNotes(prev => {
      const newNotes = [...prev];
      newNotes[step] = note;
      return newNotes;
    });
    
    if (onNoteChange) {
      onNoteChange(note, step);
    }
  }, [onNoteChange]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Poly Synth</h3>
        <div className="flex items-center gap-4">
          <Knob
            size={60}
            value={volume}
            min={-60}
            max={0}
            onChange={setVolume}
            label="Volume"
          />
        </div>
      </div>
      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: steps }).map((_, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              currentStep === i ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            <input
              type="text"
              value={notes[i]}
              onChange={(e) => handleNoteChange(e.target.value, i)}
              className="w-full bg-transparent text-white text-center"
              placeholder="-"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolyTrack;