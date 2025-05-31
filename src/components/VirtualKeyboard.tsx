import React, { useState, useEffect } from 'react';
import { Piano, Settings } from 'lucide-react';

interface VirtualKeyboardProps {
  onNoteOn: (note: string, velocity: number) => void;
  onNoteOff: (note: string) => void;
  octaves?: number;
  startOctave?: number;
  velocity?: number;
  disabled?: boolean;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onNoteOn,
  onNoteOff,
  octaves = 1,
  startOctave = 4,
  velocity = 0.8,
  disabled = false
}) => {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [currentOctave, setCurrentOctave] = useState(startOctave);
  const [currentVelocity, setCurrentVelocity] = useState(velocity);

  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const whiteKeys = notes.filter(note => !note.includes('#'));
  const blackKeys = notes.filter(note => note.includes('#'));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || disabled) return;
      const note = getKeyboardNote(e.key);
      if (note) {
        const fullNote = `${note}${currentOctave}`;
        if (!activeNotes.has(fullNote)) {
          setActiveNotes(prev => new Set([...prev, fullNote]));
          onNoteOn(fullNote, currentVelocity);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentOctave, currentVelocity, onNoteOn, disabled]);

  const getKeyboardNote = (key: string): string | null => {
    const keyMap: { [key: string]: string } = {
      'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E',
      'f': 'F', 't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A',
      'u': 'A#', 'j': 'B', 'k': 'C', 'o': 'C#', 'l': 'D',
      'p': 'D#', ';': 'E'
    };
    return keyMap[key.toLowerCase()] || null;
  };

  const handleNoteClick = (note: string) => {
    if (disabled) return;
    
    if (activeNotes.has(note)) {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      onNoteOff(note);
    } else {
      setActiveNotes(prev => new Set([...prev, note]));
      onNoteOn(note, currentVelocity);
    }
  };

  return (
    <div className="no-highlight">
      <div className={`bg-black/40 p-4 border border-red-900/20 ${disabled ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
            <Piano className="w-4 h-4" />
            Virtual Keyboard
          </h3>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-red-500/70 hover:text-red-500 transition-colors"
            disabled={disabled}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {showSettings && (
          <div className="mb-4 space-y-4 p-4 bg-black/40 border border-red-900/20">
            <div>
              <label className="text-xs font-mono text-red-500/70 block mb-2">
                Octave: {currentOctave}
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={currentOctave}
                onChange={(e) => setCurrentOctave(parseInt(e.target.value))}
                className="w-full accent-red-500 bg-red-900/20"
                disabled={disabled}
              />
            </div>

            <div>
              <label className="text-xs font-mono text-red-500/70 block mb-2">
                Velocity: {Math.round(currentVelocity * 100)}%
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={currentVelocity}
                onChange={(e) => setCurrentVelocity(parseFloat(e.target.value))}
                className="w-full accent-red-500 bg-red-900/20"
                disabled={disabled}
              />
            </div>
          </div>
        )}

        <div className="relative h-32 flex overflow-hidden">
          {/* White keys */}
          <div className="flex-1 flex min-w-[600px] relative z-0">
            {Array.from({ length: octaves }).map((_, octave) =>
              whiteKeys.map(note => {
                const fullNote = `${note}${currentOctave + octave}`;
                const isActive = activeNotes.has(fullNote);
                
                return (
                  <div
                    key={fullNote}
                    className={`flex-1 border-l border-red-900/20 first:border-l-0 ${
                      isActive
                        ? 'bg-red-900/40 border-red-600/50'
                        : 'bg-zinc-700/40 hover:bg-red-900/20'
                    } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => handleNoteClick(fullNote)}
                  />
                );
              })
            )}
          </div>

          {/* Black keys */}
          <div className="absolute top-0 left-0 right-0 flex h-20 z-10">
            {Array.from({ length: octaves }).map((_, octave) =>
              blackKeys.map((note, i) => {
                const fullNote = `${note}${currentOctave + octave}`;
                const isActive = activeNotes.has(fullNote);
                const offset = `${(i + 1) * 14.28 + octave * 100}%`;
                
                return (
                  <div
                    key={fullNote}
                    className={`absolute w-[6%] h-full -ml-[3%] ${
                      isActive
                        ? 'bg-red-950 border-red-600/50'
                        : 'bg-black hover:bg-red-950'
                    } border border-red-900/20 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ left: offset }}
                    onClick={() => handleNoteClick(fullNote)}
                  />
                );
              })
            )}
          </div>
        </div>

        <div className="mt-4 text-xs font-mono text-red-500/50 text-center">
          Click or touch to play
        </div>
      </div>

      <style jsx>{`
        /* Hide scrollbar while maintaining functionality */
        .overflow-hidden::-webkit-scrollbar {
          display: none;
        }
        .overflow-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default VirtualKeyboard;