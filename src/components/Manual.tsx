import React from 'react';
import { BookOpen, X, Mic, Sliders, Brain, Music2, Piano, AudioWaveformIcon as WaveformIcon, Skull, Zap, Radio, Waves, Cloud, Moon, Wind, Stars, Flame, Infinity, Sparkles, Settings, Volume2, Filter, Scissors, Church, Save, Download, Upload, Trash2, Play, Edit2 } from 'lucide-react';

interface ManualProps {
  isOpen: boolean;
  onClose: () => void;
}

const Manual: React.FC<ManualProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-none p-8 border border-red-900/20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-thin text-red-500 tracking-wider flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              Echo Delirium Manual
            </h2>
            <button 
              onClick={onClose}
              className="text-red-500/70 hover:text-red-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-8 text-red-200/70">
            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Skull className="w-5 h-5" />
                Overview
              </h3>
              <p>
                Echo Delirium is an experimental audio synthesizer that transforms recorded sounds into 
                surreal musical instruments using AI-powered processing. It combines traditional synthesis 
                techniques with neural networks to create evolving, otherworldly soundscapes that blur 
                the line between reality and hallucination.
              </p>
            </section>

            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Recording and Management
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">Recording</h4>
                  <p className="mb-4">
                    Click the "Record" button to capture up to 5 seconds of audio. The recording will be 
                    automatically processed and made into your main oscillator. Each recording can be played back 
                    using the virtual keyboard interface.
                  </p>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-red-500/70" />
                      Keep the microphone close to the sound source for optimal clarity
                    </li>
                    <li className="flex items-center gap-2">
                      <WaveformIcon className="w-4 h-4 text-red-500/70" />
                      Avoid background noise for cleaner processing
                    </li>
                    <li className="flex items-center gap-2">
                      <Music2 className="w-4 h-4 text-red-500/70" />
                      Try recording various sources: voices, objects, ambient sounds
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">Saving Recordings</h4>
                  <p className="mb-4">
                    After recording, you can save your sounds for later use. Each recording is stored securely in your account.
                  </p>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <Save className="w-4 h-4 text-red-500/70" />
                      Name your recording before saving
                    </li>
                    <li className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-red-500/70" />
                      Download recordings for offline use
                    </li>
                    <li className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-500/70" />
                      Delete unwanted recordings from your library
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">Managing Recordings</h4>
                  <p className="mb-4">
                    The Recordings section displays all your saved sounds, allowing you to:
                  </p>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-red-500/70" />
                      Load and play any saved recording
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-red-500/70" />
                      Apply different effect presets to each recording
                    </li>
                    <li className="flex items-center gap-2">
                      <WaveformIcon className="w-4 h-4 text-red-500/70" />
                      View recording date and duration
                    </li>
                  </ul>
                </div>

                <div className="bg-black/40 p-4 border border-red-900/20">
                  <h4 className="text-red-500/70 font-mono text-sm mb-2">Tips for Best Results</h4>
                  <ul className="list-none space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Record in a quiet environment to minimize unwanted noise
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Use descriptive names for easier organization
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Create multiple variations of the same sound
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Experiment with different microphone positions
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Piano className="w-5 h-5" />
                Virtual Keyboard
              </h3>
              <p className="mb-4">
                The virtual keyboard allows you to play your processed sounds melodically. Use your computer 
                keyboard (A-L keys) or click/touch the keys to trigger notes.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                    Keyboard Controls
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      White keys: A, S, D, F, G, H, J, K, L
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Black keys: W, E, T, Y, U
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                    Settings
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Adjust octave range
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Control note velocity
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Reality Synthesis Controls
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Music2 className="w-4 h-4" />
                    Pitch Shifter
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-red-500/50" />
                      Shift: Transposes audio ±12 semitones
                    </li>
                    <li className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-red-500/50" />
                      Mix: Blends between original and shifted sound
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-red-500/50" />
                      Use subtle shifts for harmonics, extreme for otherworldly effects
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <WaveformIcon className="w-4 h-4 text-red-500/50" />
                      Frequency: Shapes tone from 20Hz to 20kHz
                    </li>
                    <li className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-red-500/50" />
                      Resonance: Emphasizes frequencies around cutoff
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-red-500/50" />
                      High resonance creates singing, whistling effects
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Distortion
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-red-500/50" />
                      Drive: Controls distortion intensity and harmonics
                    </li>
                    <li className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-red-500/50" />
                      Mix: Balances clean and distorted signals
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-red-500/50" />
                      Creates everything from warm saturation to harsh noise
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Church className="w-4 h-4" />
                    Reverb
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <WaveformIcon className="w-4 h-4 text-red-500/50" />
                      Decay: Sets reverb tail length (0.1s to 10s)
                    </li>
                    <li className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-red-500/50" />
                      Mix: Adjusts dry/wet balance
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-red-500/50" />
                      Long decays create infinite, evolving atmospheres
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Waves className="w-4 h-4" />
                    Delay
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <WaveformIcon className="w-4 h-4 text-red-500/50" />
                      Time: Controls delay time (0-1000ms)
                    </li>
                    <li className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-red-500/50" />
                      Feedback: Amount of signal fed back (0-90%)
                    </li>
                    <li className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-red-500/50" />
                      Mix: Blends dry/wet signals
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-red-500/50" />
                      Creates echoes and rhythmic patterns
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Music2 className="w-4 h-4" />
                    Chorus
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <WaveformIcon className="w-4 h-4 text-red-500/50" />
                      Depth: Modulation intensity (0-100%)
                    </li>
                    <li className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-red-500/50" />
                      Rate: Speed of modulation (0.1-10Hz)
                    </li>
                    <li className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-red-500/50" />
                      Mix: Blends original and chorused signal
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-red-500/50" />
                      Creates shimmering, ensemble effects
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    Lo-Fi
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <WaveformIcon className="w-4 h-4 text-red-500/50" />
                      Crush: Bit reduction (1-16 bits)
                    </li>
                    <li className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-red-500/50" />
                      Depth: Modulation and filtering
                    </li>
                    <li className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-red-500/50" />
                      Mix: Blends clean and degraded signal
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-red-500/50" />
                      Creates retro, degraded textures
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Compressor
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <WaveformIcon className="w-4 h-4 text-red-500/50" />
                      Threshold: Level where compression starts (-60 to 0dB)
                    </li>
                    <li className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-red-500/50" />
                      Ratio: Amount of gain reduction (1:1 to 20:1)
                    </li>
                    <li className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-red-500/50" />
                      Knee: Smoothness of compression curve (0-40dB)
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-red-500/50" />
                      Controls dynamics and adds punch
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Nightmare Engine
              </h3>
              <p className="mb-4">
                The Nightmare Engine uses advanced neural networks to transform your sounds into 
                terrifying instruments. It analyzes the audio's spectral content and applies multiple 
                layers of AI-driven processing to create evolving, nightmarish textures that blur the line 
                between reality and madness.
              </p>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Skull className="w-4 h-4" />
                    Terror
                  </h4>
                  <p className="mb-2">Controls how deeply the AI corrupts the sound.</p>
                  <ul className="list-none space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-900" />
                      Low: Unsettling undertones
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-700" />
                      Medium: Disturbing transformations
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      High: Complete reality corruption
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Madness
                  </h4>
                  <p className="mb-2">Introduces chaotic instability and unpredictability.</p>
                  <ul className="list-none space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-900" />
                      Low: Creeping unease
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-700" />
                      Medium: Reality fractures
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      High: Complete sonic insanity
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Infinity className="w-4 h-4" />
                    Descent
                  </h4>
                  <p className="mb-2">Controls the depth of the nightmare.</p>
                  <ul className="list-none space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-900" />
                      Surface: Lingering dread
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-700" />
                      Depths: Deep horror
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Abyss: Infinite terror
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Music2 className="w-5 h-5" />
                Style Influence
              </h3>
              <p className="mb-4">
                The Style Influence system allows you to combine up to three different musical styles using 
                neural style transfer. Each style imparts unique timbral and textural qualities, and multiple 
                styles can be blended together to create complex, evolving soundscapes.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-4">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    Influence Amount
                  </h4>
                  <p>Controls how strongly the selected styles affect the sound. Higher values create more 
                  dramatic stylistic transformations.</p>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Style Blend
                  </h4>
                  <p>Determines the balance between the original sound and the style-processed versions, 
                  allowing for subtle mixing of characteristics.</p>
                </div>
              </div>
              <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                <Music2 className="w-4 h-4" />
                Available Styles
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <ul className="list-none space-y-2">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Glitch:</span> Digital artifacts and circuit-bent chaos
                  </li>
                  <li className="flex items-center gap-2">
                    <Infinity className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Drone:</span> Deep resonant harmonics and layering
                  </li>
                  <li className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Vapor:</span> Time-stretched with heavy chorus
                  </li>
                  <li className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Dark:</span> Sub-bass drones and ominous tones
                  </li>
                </ul>
                <ul className="list-none space-y-2">
                  <li className="flex items-center gap-2">
                    <Skull className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Ritual:</span> Ancient harmonics and mystical frequencies
                  </li>
                  <li className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Noise:</span> Filtered chaos and static patterns
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Spectral:</span> Crystalline harmonics and shimmer
                  </li>
                  <li className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Ethereal:</span> Floating atmospheres and ghostly tones
                  </li>
                </ul>
                <ul className="list-none space-y-2">
                  <li className="flex items-center gap-2">
                    <Stars className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Cosmic:</span> Interstellar drones and quantum waves
                  </li>
                  <li className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Infernal:</span> Hellish distortion and demonic tones
                  </li>
                  <li className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Quantum:</span> Probability waves and superposition
                  </li>
                  <li className="flex items-center gap-2">
                    <Skull className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Necro:</span> Undead harmonics and sepulchral resonance
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Stars className="w-5 h-5" />
                Advanced Effects
              </h3>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Stars className="w-4 h-4" />
                    Granular Void
                  </h4>
                  <p className="mb-2">Fragments sound into microscopic particles.</p>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Density: Controls grain cloud thickness
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Size: Adjusts individual grain duration
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Creates ethereal, ghostly textures
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Waves className="w-4 h-4" />
                    Spectral Warping
                  </h4>
                  <p className="mb-2">Manipulates frequency content over time.</p>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Warp: Bends and stretches frequencies
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Shift: Transposes spectral content
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Creates metallic and alien timbres
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Infinity className="w-4 h-4" />
                    Neural Modulation
                  </h4>
                  <p className="mb-2">AI-driven sound transformation.</p>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Modulation: Neural processing depth
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      
                      Feedback: Self-modulating resonance
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Creates evolving, organic textures
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Piano className="w-5 h-5" />
                MIDI Integration
              </h3>
              <p className="mb-4">
                Echo Delirium supports MIDI input devices for enhanced performance control. Connect any 
                MIDI keyboard or controller to play the processed sounds with precise control over velocity 
                and expression.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Device Selection
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      All connected MIDI devices are automatically detected
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Select a device from the MIDI Control panel
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Click again to deactivate the current device
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Piano className="w-4 h-4" />
                    Performance
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Use MIDI keys to trigger processed sounds
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Velocity sensitivity for dynamic control
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Real-time response for expressive playing
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Save className="w-5 h-5" />
                Preset System
              </h3>
              <p className="mb-4">
                The Preset System allows you to save and recall your favorite sound configurations, including all effect parameters, 
                neural processing settings, and style combinations.
              </p>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Saving Presets
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Enter a name for your preset
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Click "New Preset" to save current settings
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      All parameters are stored in your preset
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Loading Presets
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Click a preset to load its settings
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      All parameters update instantly
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Switch between presets while playing
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exporting Presets
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Export presets as JSON files
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Share with other users
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Back up your favorite settings
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Importing Presets
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Import presets from JSON files
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Use presets from other users
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Restore backed up settings
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-900/10 border border-red-900/20">
                <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Preset Parameters
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h5 className="text-red-500/50 font-mono text-sm mb-2">Reality Synthesis</h5>
                    <ul className="list-none space-y-1 text-sm">
                      <li>Filter Frequency</li>
                      <li>Resonance</li>
                      <li>Distortion</li>
                      <li>Pitch Shift</li>
                      <li>Reverb Settings</li>
                      <li>Delay Time/Feedback</li>
                      <li>Chorus Depth/Rate</li>
                      <li>Lo-Fi Crush/Depth</li>
                      <li>Compressor Settings</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-red-500/50 font-mono text-sm mb-2">Nightmare Engine</h5>
                    <ul className="list-none space-y-1 text-sm">
                      <li>Terror Level</li>
                      <li>Madness Amount</li>
                      <li>Dream Depth</li>
                      <li>Neural Modulation</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-red-500/50 font-mono text-sm mb-2">Style Influence</h5>
                    <ul className="list-none space-y-1 text-sm">
                      <li>Selected Styles</li>
                      <li>Style Influence</li>
                      <li>Style Blend</li>
                      <li>Effect Power</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Neural Activity Visualization
              </h3>
              <p className="mb-4">
                The Neural Activity window provides a real-time visualization of the audio processing and neural network activity, 
                offering insights into how Echo Delirium transforms and manipulates sound.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                    Waveform Display
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Main waveform shows real-time audio signal
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Intensity affects waveform amplitude and color
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Chaos introduces dynamic distortions and modulations
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                    Neural Layers
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Multiple processing layers shown as overlapping waves
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Dream Depth controls number and complexity of layers
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Each layer represents different neural transformations
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                    Synaptic Activity
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Floating particles represent neural connections
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Particle density increases with processing intensity
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Connection lines show information flow between layers
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                    Chaos Patterns
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Random interference patterns show chaos level
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Higher chaos creates more unpredictable visuals
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Affects both particle movement and waveform stability
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                  Visual Elements
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/40 p-4 border border-red-900/20">
                    <h5 className="text-red-500/70 font-mono text-sm mb-2">Scan Line</h5>
                    <p className="text-sm">
                      Moving horizontal line that scans the display, intensity varies with processing depth. 
                      Represents active neural scanning and analysis of the audio signal.
                    </p>
                  </div>

                  <div className="bg-black/40 p-4 border border-red-900/20">
                    <h5 className="text-red-500/70 font-mono text-sm mb-2">CRT Effect</h5>
                    <p className="text-sm">
                      Retro display simulation with scan lines and screen curvature. 
                      Adds depth and dimension to the visualization while maintaining the aesthetic.
                    </p>
                  </div>

                  <div className="bg-black/40 p-4 border border-red-900/20">
                    <h5 className="text-red-500/70 font-mono text-sm mb-2">Status Indicators</h5>
                    <p className="text-sm">
                      Real-time display of processing status, dream depth level, and chaos intensity. 
                      Provides immediate feedback on the current state of audio processing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-900/10 border border-red-900/20">
                <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                  Interpretation Guide
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-red-500/50 font-mono text-sm mb-2">Active State</h5>
                    <ul className="list-none space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        Bright, pulsing waveforms indicate active processing
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        Multiple layers show complex transformations
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        Intense particle activity during peak processing
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-red-500/50 font-mono text-sm mb-2">Dormant State</h5>
                    <ul className="list-none space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        Subtle, flowing patterns show system readiness
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        Minimal particle movement in standby mode
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        Maintains base neural network activity
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Edit2 className="w-5 h-5" />
                Recording Editor
              </h3>
              <p className="mb-4">
                The Recording Editor provides powerful tools for modifying and refining your recorded audio. 
                Access it by clicking the edit button next to any recording in your library.
              </p>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                    Basic Controls
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Preview/Stop: Listen to your recording
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Normalize: Automatically adjust audio levels
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Reverse: Flip the audio backwards
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                    Editing Features
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Trim: Adjust start and end points
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Gain: Control overall volume
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Waveform display for precise editing
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                    Trimming Audio
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Drag start/end handles to trim
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Preview trimmed section
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Fine-tune selection with sliders
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-red-500/70 font-mono uppercase tracking-wider mb-2">
                    Volume Adjustment
                  </h4>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Adjust gain with slider (0-200%)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Normalize to optimize levels
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      Preview changes in real-time
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-900/10 border border-red-900/20">
                <h4 className="text-red-500/70 font-mono text-sm mb-2">Tips for Best Results</h4>
                <ul className="list-none space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    Trim silence from start and end for cleaner processing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    Use normalization to ensure consistent volume levels
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    Preview changes before saving to ensure desired results
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    Save different versions for experimenting with effects
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-red-500 text-lg mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Techniques
              </h3>
              <ul className="list-none space-y-3">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  Layer multiple styles by selecting complementary combinations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  Use high Dream Depth with low Terror for subtle but complex transformations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  Combine high Madness with long Reverb times for infinite, evolving soundscapes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  Experiment with extreme pitch shifts and high resonance for alien vocal effects
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  Use the Style Blend to create hybrid sounds that mix multiple characteristics
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manual;