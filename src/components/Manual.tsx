import React from 'react';
import { X, Skull, Zap, Music, Brain, Waves, Settings, Volume2 } from 'lucide-react';

interface ManualProps {
  isOpen: boolean;
  onClose: () => void;
}

const Manual: React.FC<ManualProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[99999] flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <div className="bg-black/95 border border-red-900/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-[100000]" style={{ zIndex: 100000 }}>
        <div className="sticky top-0 bg-black/95 border-b border-red-900/20 p-4 flex items-center justify-between z-[100001]" style={{ zIndex: 100001 }}>
          <h2 className="text-xl font-mono text-red-500 uppercase tracking-wider flex items-center gap-2">
            <Skull className="w-6 h-6" />
            Echo Delirium Manual
          </h2>
          <button
            onClick={onClose}
            className="text-red-500/70 hover:text-red-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Overview */}
          <section>
            <h3 className="text-lg font-mono text-red-500 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Overview
            </h3>
            <p className="text-red-300/70 leading-relaxed">
              Echo Delirium is a surreal audio experience that transforms ambient sounds into musical instruments 
              using AI-powered sound processing and synthesis. The application features two main modes: an audio 
              recorder with neural processing effects, and a multi-track sequencer for creating rhythmic patterns.
            </p>
          </section>

          {/* Audio Recorder */}
          <section>
            <h3 className="text-lg font-mono text-red-500 mb-4 flex items-center gap-2">
              <Waves className="w-5 h-5" />
              Audio Recorder
            </h3>
            <div className="space-y-4 text-red-300/70">
              <div>
                <h4 className="text-red-400 font-mono mb-2">Recording Audio</h4>
                <p>Click the "Record" button to capture ambient sounds. Recordings are limited to 5 seconds and are automatically saved to your account.</p>
              </div>
              <div>
                <h4 className="text-red-400 font-mono mb-2">Neural Processing</h4>
                <p>Once recorded, audio can be played back through the neural processing engine. Use the virtual keyboard to trigger sounds at different pitches.</p>
              </div>
              <div>
                <h4 className="text-red-400 font-mono mb-2">Effects Controls</h4>
                <p>The effects panel provides extensive sound manipulation options including filters, distortion, reverb, delay, and AI-powered nightmare processing.</p>
              </div>
            </div>
          </section>

          {/* Sequencer */}
          <section>
            <h3 className="text-lg font-mono text-red-500 mb-4 flex items-center gap-2">
              <Music className="w-5 h-5" />
              Sequencer
            </h3>
            <div className="space-y-4 text-red-300/70">
              <div>
                <h4 className="text-red-400 font-mono mb-2">Track Types</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Drum Tracks:</strong> Load and sequence drum samples with volume and pan controls</li>
                  <li><strong>Bass Synth:</strong> Monophonic synthesizer with scale-based pattern programming</li>
                  <li><strong>Poly Synth:</strong> Polyphonic synthesizer for chords and melodies</li>
                </ul>
              </div>
              <div>
                <h4 className="text-red-400 font-mono mb-2">Pattern Programming</h4>
                <p>Click on the grid to activate steps. Each track can have different step lengths (4, 8, 16, 32, or 64 steps). The current playing step is highlighted in red.</p>
              </div>
              <div>
                <h4 className="text-red-400 font-mono mb-2">Transport Controls</h4>
                <p>Use the Play/Stop button to control playback. Adjust BPM (20-300) and swing (0-100%) to change the feel of your sequence.</p>
              </div>
            </div>
          </section>

          {/* Effects */}
          <section>
            <h3 className="text-lg font-mono text-red-500 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Effects System
            </h3>
            <div className="space-y-4 text-red-300/70">
              <div>
                <h4 className="text-red-400 font-mono mb-2">Reality Synthesis</h4>
                <p>Basic audio effects including pitch shifting, filtering, distortion, reverb, delay, chorus, lo-fi processing, and compression.</p>
              </div>
              <div>
                <h4 className="text-red-400 font-mono mb-2">Nightmare Engine</h4>
                <p>AI-powered audio processing that applies terror, madness, and descent effects to transform sounds into nightmarish textures.</p>
              </div>
              <div>
                <h4 className="text-red-400 font-mono mb-2">Style Influence</h4>
                <p>Choose from various musical styles (Glitch, Drone, Vapor, Dark, Ritual, etc.) to influence the character of your sounds. Multiple styles can be blended together.</p>
              </div>
            </div>
          </section>

          {/* Presets */}
          <section>
            <h3 className="text-lg font-mono text-red-500 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Presets & Storage
            </h3>
            <div className="space-y-4 text-red-300/70">
              <div>
                <h4 className="text-red-400 font-mono mb-2">Saving Presets</h4>
                <p>Save your effect settings as presets for later recall. Presets are stored in your account and can be exported/imported as JSON files.</p>
              </div>
              <div>
                <h4 className="text-red-400 font-mono mb-2">Recording Management</h4>
                <p>All recordings are automatically saved to your account. You can play, edit, download, or delete recordings from the recordings panel.</p>
              </div>
              <div>
                <h4 className="text-red-400 font-mono mb-2">Sample Management</h4>
                <p>Upload your own WAV samples for use in drum tracks. Default samples are provided, but you can expand your library with custom sounds.</p>
              </div>
            </div>
          </section>

          {/* Controls */}
          <section>
            <h3 className="text-lg font-mono text-red-500 mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Keyboard Controls
            </h3>
            <div className="space-y-4 text-red-300/70">
              <div>
                <h4 className="text-red-400 font-mono mb-2">Virtual Keyboard</h4>
                <p>Use your computer keyboard to play notes:</p>
                <div className="grid grid-cols-2 gap-4 mt-2 font-mono text-sm">
                  <div>
                    <p><strong>White Keys:</strong></p>
                    <p>A S D F G H J K L</p>
                  </div>
                  <div>
                    <p><strong>Black Keys:</strong></p>
                    <p>W E T Y U O P</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-red-400 font-mono mb-2">Octave Control</h4>
                <p>Adjust the octave and velocity in the keyboard settings panel. The current octave and velocity are displayed in the interface.</p>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-lg font-mono text-red-500 mb-4">Tips & Tricks</h3>
            <div className="space-y-2 text-red-300/70">
              <p>• Start with low nightmare engine settings and gradually increase for more extreme effects</p>
              <p>• Combine multiple style influences for unique sonic textures</p>
              <p>• Use the neural visualizer to see how your audio is being processed in real-time</p>
              <p>• Experiment with different step lengths on each track to create polyrhythmic patterns</p>
              <p>• Save presets of your favorite effect combinations for quick recall</p>
              <p>• Record environmental sounds for the most interesting neural processing results</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Manual;