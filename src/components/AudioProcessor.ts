import * as Tone from 'tone';
import * as mm from '@magenta/music';
import { AudioDeepDream } from '../lib/deepDream';

export class AudioProcessor {
  private analyser: Tone.Analyser;
  private waveformData: Float32Array;
  private readonly API_URL = 'http://localhost:3000';
  private effects!: {
    reverb: Tone.Reverb;
    delay: Tone.FeedbackDelay;
    filter: Tone.Filter;
    distortion: Tone.Distortion;
    pitchShift: Tone.PitchShift;
    echo: {
      delay1: Tone.FeedbackDelay;
      delay2: Tone.FeedbackDelay;
      delay3: Tone.FeedbackDelay;
      modulation: Tone.LFO;
      filter: Tone.Filter;
      mix: Tone.Gain;
    };
    chorus: {
      voices: Tone.Chorus[];
      mix: Tone.Gain;
      wet: Tone.Gain;
    };
    lofi: {
      bitCrusher: Tone.BitCrusher;
      filter: Tone.Filter;
      distortion: Tone.Distortion;
      vibrato: Tone.Vibrato;
      mix: Tone.Gain;
    };
  };
  private activeNotes: Set<string>;
  private audioBuffers: Map<string, AudioBuffer>;
  private players: Map<string, Tone.Player>;
  private isInitialized: boolean = false;
  private isPlaying: boolean = false;
  private loopEnabled: boolean = false;
  private musicRNN: mm.MusicRNN | null = null;
  private musicVAE: mm.MusicVAE | null = null;
  private deepDream: AudioDeepDream;
  private basePitch: number = 0;
  private pitchShiftAmount: number = 0;
  private currentStyle: string = 'ambient';
  private styleInfluence: number = 0;
  private styleBlend: number = 0;

  constructor() {
    this.analyser = new Tone.Analyser({
      type: 'waveform',
      size: 1024
    });
    this.waveformData = new Float32Array(1024);
    this.activeNotes = new Set();
    this.audioBuffers = new Map();
    this.players = new Map();
    this.deepDream = new AudioDeepDream();

    this.initializeMagenta();
  }

  private async initializeMagenta() {
    const maxRetries = 3;
    const retryDelay = 1000;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        this.musicRNN = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn');
        await this.musicRNN.initialize();

        this.musicVAE = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small');
        await this.musicVAE.initialize();

        console.log('Magenta models initialized successfully');
        break;
      } catch (error) {
        console.error(`Error initializing Magenta (attempt ${retryCount + 1}/${maxRetries}):`, error);
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
        }
      }
    }

    if (retryCount === maxRetries) {
      console.error('Failed to initialize Magenta models after maximum retries');
    }
  }

  async initialize() {
    if (!this.isInitialized) {
      await Tone.start();
      
      // Initialize effects chain
      this.effects = {
        pitchShift: new Tone.PitchShift({
          pitch: 0,
          windowSize: 0.05,
          delayTime: 0,
          feedback: 0
        }),

        distortion: new Tone.Distortion({
          distortion: 0.8,
          wet: 0.2
        }),
        
        filter: new Tone.Filter({
          frequency: 2000,
          type: "lowpass",
          rolloff: -24,
          Q: 1
        }),
        
        delay: new Tone.FeedbackDelay({
          delayTime: 0.25,
          feedback: 0.5,
          wet: 0.5
        }),
        
        reverb: new Tone.Reverb({
          decay: 5,
          wet: 0.5,
          preDelay: 0.1
        }),

        echo: {
          delay1: new Tone.FeedbackDelay({
            delayTime: 0.25,
            feedback: 0.3,
            wet: 1
          }),
          delay2: new Tone.FeedbackDelay({
            delayTime: 0.375,
            feedback: 0.2,
            wet: 1
          }),
          delay3: new Tone.FeedbackDelay({
            delayTime: 0.5,
            feedback: 0.15,
            wet: 1
          }),
          modulation: new Tone.LFO({
            frequency: 0.1,
            min: 0.2,
            max: 0.4
          }),
          filter: new Tone.Filter({
            frequency: 2000,
            type: "lowpass",
            rolloff: -24
          }),
          mix: new Tone.Gain(0.5)
        },

        chorus: {
          voices: [
            new Tone.Chorus({
              frequency: 1.5,
              delayTime: 3.5,
              depth: 0.7,
              spread: 180,
              type: 'sine',
              wet: 1
            }),
            new Tone.Chorus({
              frequency: 0.85,
              delayTime: 4,
              depth: 0.9,
              spread: 60,
              type: 'sine',
              wet: 1
            }),
            new Tone.Chorus({
              frequency: 0.5,
              delayTime: 4.5,
              depth: 1,
              spread: 120,
              type: 'sine',
              wet: 1
            })
          ],
          mix: new Tone.Gain(0.8),
          wet: new Tone.Gain(0.5)
        },

        lofi: {
          bitCrusher: new Tone.BitCrusher({
            bits: 8,
            wet: 1
          }),
          filter: new Tone.Filter({
            frequency: 4000,
            type: "lowpass",
            rolloff: -24,
            Q: 2
          }),
          distortion: new Tone.Distortion({
            distortion: 0.2,
            wet: 0.3
          }),
          vibrato: new Tone.Vibrato({
            frequency: 5.5,
            depth: 0.2,
            type: "sine",
            wet: 0.5
          }),
          mix: new Tone.Gain(0.5)
        }
      };

      // Start modulation and effects
      this.effects.echo.modulation.connect(this.effects.echo.delay1.delayTime);
      this.effects.echo.modulation.connect(this.effects.echo.delay2.delayTime);
      this.effects.echo.modulation.connect(this.effects.echo.delay3.delayTime);
      this.effects.echo.modulation.start();

      // Start chorus voices
      this.effects.chorus.voices.forEach(voice => voice.start());

      // Connect effects chain
      this.effects.pitchShift.connect(this.effects.distortion);
      this.effects.distortion.connect(this.effects.filter);
      
      // Connect lofi chain
      this.effects.filter.connect(this.effects.lofi.bitCrusher);
      this.effects.lofi.bitCrusher.connect(this.effects.lofi.filter);
      this.effects.lofi.filter.connect(this.effects.lofi.distortion);
      this.effects.lofi.distortion.connect(this.effects.lofi.vibrato);
      this.effects.lofi.vibrato.connect(this.effects.lofi.mix);
      this.effects.lofi.mix.connect(this.effects.echo.delay1);
      
      // Connect echo chain
      this.effects.echo.delay1.connect(this.effects.echo.delay2);
      this.effects.echo.delay2.connect(this.effects.echo.delay3);
      this.effects.echo.delay3.connect(this.effects.echo.filter);
      this.effects.echo.filter.connect(this.effects.echo.mix);
      this.effects.echo.mix.connect(this.effects.delay);
      
      // Connect chorus chain
      this.effects.chorus.voices.forEach(voice => {
        voice.connect(this.effects.chorus.mix);
      });
      this.effects.chorus.mix.connect(this.effects.chorus.wet);
      this.effects.chorus.wet.connect(this.effects.delay);
      
      // Connect final chain
      this.effects.delay.connect(this.effects.reverb);
      this.effects.reverb.connect(this.analyser);
      this.analyser.toDestination();

      this.isInitialized = true;
    }
  }

  async playProcessedSound(note: string, audioUrl: string, hold: boolean = false) {
    try {
      if (!audioUrl) {
        throw new Error('No audio URL provided');
      }

      await this.initialize();
      await this.loadAudioBuffer(audioUrl);
      
      const audioBuffer = this.audioBuffers.get(audioUrl);
      if (!audioBuffer) {
        throw new Error('Audio buffer not found for URL: ' + audioUrl);
      }

      if (!this.players.has(note)) {
        const player = new Tone.Player({
          url: audioBuffer,
          loop: this.loopEnabled,
        }).connect(this.effects.pitchShift);
        this.players.set(note, player);
      }

      const player = this.players.get(note)!;
      
      // Calculate pitch shift
      const baseNote = 60; // Middle C
      const noteNumber = Tone.Frequency(note).toMidi();
      const notePitch = noteNumber - baseNote;
      
      // Apply both note transposition and pitch shift effect
      this.effects.pitchShift.pitch = notePitch + this.pitchShiftAmount;

      if (player.state === 'started') {
        player.stop();
        this.isPlaying = false;
      } else {
        player.start();
        this.isPlaying = true;
      }

      if (hold) {
        this.activeNotes.add(note);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      throw error;
    }
  }

  async loadAudioBuffer(audioUrl: string): Promise<void> {
    try {
      if (!audioUrl) {
        throw new Error('Invalid audio URL');
      }

      if (!this.audioBuffers.has(audioUrl)) {
        const response = await fetch(audioUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('Content-Type');
        if (!contentType?.includes('audio/')) {
          console.warn(`Warning: Unexpected content type for audio file: ${contentType}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('Empty audio data received');
        }

        try {
          const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
          if (!audioBuffer || audioBuffer.length === 0) {
            throw new Error('Failed to decode audio data: empty buffer');
          }
          this.audioBuffers.set(audioUrl, audioBuffer);
        } catch (decodeError) {
          throw new Error(`Failed to decode audio data: ${decodeError.message}`);
        }
      }
    } catch (error) {
      console.error('Error loading audio buffer:', error);
      throw error;
    }
  }

  stopNote(note: string) {
    try {
      if (this.activeNotes.has(note)) {
        this.activeNotes.delete(note);
        const player = this.players.get(note);
        if (player && player.state === 'started') {
          player.stop();
          this.isPlaying = false;
        }
      }
    } catch (error) {
      console.error('Error stopping note:', error);
    }
  }

  stopAllNotes() {
    this.players.forEach(player => {
      if (player.state === 'started') {
        player.stop();
      }
    });
    this.activeNotes.clear();
    this.isPlaying = false;
  }

  setLoopEnabled(enabled: boolean) {
    this.loopEnabled = enabled;
    this.players.forEach(player => {
      player.loop = enabled;
    });
  }

  isCurrentlyPlaying() {
    return this.isPlaying;
  }

  getWaveformData(): Float32Array {
    return this.analyser.getValue() as Float32Array;
  }

  setEffects(effects: {
    reverbLevel: number;
    delayTime: number;
    filterFreq: number;
    resonance?: number;
    echoIntensity: number;
    echoLength: number;
    distortion?: number;
    distortionMix?: number;
    pareidoliaIntensity?: number;
    pitchShift?: number;
    pitchMix?: number;
    chorusDepth?: number;
    chorusMix?: number;
    lofiAmount?: number;
    lofiMix?: number;
  }) {
    try {
      if (!this.isInitialized) return;

      // Update chorus
      if (effects.chorusDepth !== undefined) {
        this.effects.chorus.voices.forEach((voice, i) => {
          const depth = effects.chorusDepth! * (1 + i * 0.2);
          voice.depth = Math.min(1, depth);
        });
      }
      
      if (effects.chorusMix !== undefined) {
        this.effects.chorus.wet.gain.rampTo(effects.chorusMix, 0.1);
      }

      // Update lofi effects
      if (effects.lofiAmount !== undefined) {
        const amount = effects.lofiAmount;
        this.effects.lofi.bitCrusher.bits = Math.floor(8 - amount * 4);
        this.effects.lofi.filter.frequency.rampTo(4000 - amount * 2000, 0.1);
        this.effects.lofi.distortion.distortion = amount * 0.4;
        this.effects.lofi.vibrato.depth = amount * 0.3;
      }
      
      if (effects.lofiMix !== undefined) {
        this.effects.lofi.mix.gain.rampTo(effects.lofiMix, 0.1);
      }

    } catch (error) {
      console.error('Error setting effects:', error);
    }
  }

  dispose() {
    try {
      if (this.isInitialized) {
        // Dispose all effects
        Object.values(this.effects).forEach(effect => {
          if (effect instanceof Tone.ToneAudioNode) {
            effect.dispose();
          } else if (typeof effect === 'object') {
            // Handle nested effects
            Object.values(effect).forEach(nestedEffect => {
              if (nestedEffect instanceof Tone.ToneAudioNode) {
                nestedEffect.dispose();
              } else if (Array.isArray(nestedEffect)) {
                nestedEffect.forEach(voice => voice.dispose());
              }
            });
          }
        });

        // Dispose players
        this.players.forEach(player => {
          player.stop();
          player.dispose();
        });

        // Clear collections
        this.audioBuffers.clear();
        this.players.clear();
        this.activeNotes.clear();
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Error in dispose:', error);
    }
  }
}

export default AudioProcessor;