import * as Tone from 'tone';
import * as mm from '@magenta/music';
import { AudioDeepDream } from '../lib/deepDream';

export class AudioProcessor {
  private analyser: Tone.Analyser;
  private waveformData: Float32Array;
  private readonly API_URL = 'http://localhost:5173';
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
      currentDepth: number;
    };
    lofi: {
      bitCrusher: Tone.BitCrusher;
      filter: Tone.Filter;
      distortion: Tone.Distortion;
      vibrato: Tone.Vibrato;
      mix: Tone.Gain;
    };
  };
  private activeNotes: Map<string, Tone.Player>;
  private audioBuffers: Map<string, AudioBuffer>;
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
  private stateChangeCallbacks: Set<() => void> = new Set();
  private waveformUpdateCallbacks: Set<(data: Float32Array) => void> = new Set();
  private effectUpdateCallbacks: Set<(effects: any) => void> = new Set();

  constructor() {
    this.analyser = new Tone.Analyser({
      type: 'waveform',
      size: 1024
    });
    this.waveformData = new Float32Array(1024);
    this.activeNotes = new Map();
    this.audioBuffers = new Map();
    this.deepDream = new AudioDeepDream();

    this.initializeMagenta();
    this.startWaveformUpdates();
  }

  private startWaveformUpdates() {
    const updateWaveform = () => {
      if (this.isPlaying) {
        this.waveformData = this.analyser.getValue() as Float32Array;
        this.waveformUpdateCallbacks.forEach(callback => callback(this.waveformData));
      }
      requestAnimationFrame(updateWaveform);
    };
    requestAnimationFrame(updateWaveform);
  }

  onStateChange(callback: () => void) {
    this.stateChangeCallbacks.add(callback);
    return () => this.stateChangeCallbacks.delete(callback);
  }

  onWaveformUpdate(callback: (data: Float32Array) => void) {
    this.waveformUpdateCallbacks.add(callback);
    return () => this.waveformUpdateCallbacks.delete(callback);
  }

  onEffectUpdate(callback: (effects: any) => void) {
    this.effectUpdateCallbacks.add(callback);
    return () => this.effectUpdateCallbacks.delete(callback);
  }

  private notifyStateChange() {
    this.stateChangeCallbacks.forEach(callback => callback());
  }

  private notifyEffectUpdate(effects: any) {
    this.effectUpdateCallbacks.forEach(callback => callback(effects));
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
        this.notifyStateChange();
        break;
      } catch (error) {
        console.error(`Error initializing Magenta (attempt ${retryCount + 1}/${maxRetries}):`, error);
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
        }
      }
    }
  }

  async initialize() {
    if (!this.isInitialized) {
      await Tone.start();
      
      this.effects = {
        pitchShift: new Tone.PitchShift({
          pitch: 0,
          windowSize: 0.05,
          delayTime: 0,
          feedback: 0.2
        }),

        distortion: new Tone.Distortion({
          distortion: 2.5,
          wet: 0.6
        }),
        
        filter: new Tone.Filter({
          frequency: 2000,
          type: "lowpass",
          rolloff: -48,
          Q: 5
        }),
        
        delay: new Tone.FeedbackDelay({
          delayTime: 0.375,
          feedback: 0.65,
          wet: 0.6
        }),
        
        reverb: new Tone.Reverb({
          decay: 8,
          wet: 0.7,
          preDelay: 0.2
        }),

        echo: {
          delay1: new Tone.FeedbackDelay({
            delayTime: 0.25,
            feedback: 0.5,
            wet: 1
          }),
          delay2: new Tone.FeedbackDelay({
            delayTime: 0.375,
            feedback: 0.4,
            wet: 1
          }),
          delay3: new Tone.FeedbackDelay({
            delayTime: 0.5,
            feedback: 0.3,
            wet: 1
          }),
          modulation: new Tone.LFO({
            frequency: 0.2,
            min: 0.1,
            max: 0.5
          }),
          filter: new Tone.Filter({
            frequency: 2000,
            type: "lowpass",
            rolloff: -48,
            Q: 4
          }),
          mix: new Tone.Gain(0.7)
        },

        chorus: {
          voices: this.createChorusVoices(),
          mix: new Tone.Gain(0.9),
          wet: new Tone.Gain(0.7),
          currentDepth: 0.7
        },

        lofi: {
          bitCrusher: new Tone.BitCrusher({
            bits: 6,
            wet: 1
          }),
          filter: new Tone.Filter({
            frequency: 3000,
            type: "lowpass",
            rolloff: -48,
            Q: 3
          }),
          distortion: new Tone.Distortion({
            distortion: 0.4,
            wet: 0.5
          }),
          vibrato: new Tone.Vibrato({
            frequency: 6.5,
            depth: 0.4,
            type: "sine",
            wet: 0.7
          }),
          mix: new Tone.Gain(0.7)
        }
      };

      this.connectEffects();
      this.isInitialized = true;
      this.notifyStateChange();
    }
  }

  private createChorusVoices(depth: number = 0.7) {
    return [
      new Tone.Chorus({
        frequency: 1.5,
        delayTime: 4.5,
        depth: depth * 1.2,
        spread: 180,
        type: 'sine',
        wet: 1
      }),
      new Tone.Chorus({
        frequency: 0.85,
        delayTime: 5,
        depth: depth * 1.4,
        spread: 90,
        type: 'sine',
        wet: 1
      }),
      new Tone.Chorus({
        frequency: 0.5,
        delayTime: 5.5,
        depth: depth * 1.6,
        spread: 150,
        type: 'sine',
        wet: 1
      })
    ];
  }

  private connectEffects() {
    this.effects.echo.modulation.connect(this.effects.echo.delay1.delayTime);
    this.effects.echo.modulation.connect(this.effects.echo.delay2.delayTime);
    this.effects.echo.modulation.connect(this.effects.echo.delay3.delayTime);
    this.effects.echo.modulation.start();

    this.effects.chorus.voices.forEach(voice => {
      voice.start();
      voice.connect(this.effects.chorus.mix);
    });

    this.effects.pitchShift.connect(this.effects.distortion);
    this.effects.distortion.connect(this.effects.filter);
    
    this.effects.filter.connect(this.effects.lofi.bitCrusher);
    this.effects.lofi.bitCrusher.connect(this.effects.lofi.filter);
    this.effects.lofi.filter.connect(this.effects.lofi.distortion);
    this.effects.lofi.distortion.connect(this.effects.lofi.vibrato);
    this.effects.lofi.vibrato.connect(this.effects.lofi.mix);
    this.effects.lofi.mix.connect(this.effects.echo.delay1);
    
    this.effects.echo.delay1.connect(this.effects.echo.delay2);
    this.effects.echo.delay2.connect(this.effects.echo.delay3);
    this.effects.echo.delay3.connect(this.effects.echo.filter);
    this.effects.echo.filter.connect(this.effects.echo.mix);
    this.effects.echo.mix.connect(this.effects.delay);
    
    this.effects.chorus.mix.connect(this.effects.chorus.wet);
    this.effects.chorus.wet.connect(this.effects.delay);
    
    this.effects.delay.connect(this.effects.reverb);
    this.effects.reverb.connect(this.analyser);
    this.analyser.toDestination();
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

      if (this.activeNotes.has(note)) {
        const existingPlayer = this.activeNotes.get(note)!;
        existingPlayer.stop().dispose();
        this.activeNotes.delete(note);
      }

      const player = new Tone.Player({
        url: audioBuffer,
        loop: this.loopEnabled,
        playbackRate: 1,
        fadeIn: 0.02,
        fadeOut: 0.05
      }).connect(this.effects.pitchShift);

      const baseNote = 60;
      const noteNumber = Tone.Frequency(note).toMidi();
      const notePitch = (noteNumber - baseNote) * 1.2;
      
      this.effects.pitchShift.pitch = notePitch + this.pitchShiftAmount;

      player.start();
      this.activeNotes.set(note, player);
      this.isPlaying = true;
      this.notifyStateChange();

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

        const arrayBuffer = await response.arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('Empty audio data received');
        }

        const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
        if (!audioBuffer || audioBuffer.length === 0) {
          throw new Error('Failed to decode audio data: empty buffer');
        }
        
        this.audioBuffers.set(audioUrl, audioBuffer);
        this.notifyStateChange();
      }
    } catch (error) {
      console.error('Error loading audio buffer:', error);
      throw error;
    }
  }

  stopNote(note: string) {
    try {
      if (this.activeNotes.has(note)) {
        const player = this.activeNotes.get(note)!;
        player.stop().dispose();
        this.activeNotes.delete(note);
        this.isPlaying = this.activeNotes.size > 0;
        this.notifyStateChange();
      }
    } catch (error) {
      console.error('Error stopping note:', error);
    }
  }

  stopAllNotes() {
    try {
      this.activeNotes.forEach((player, note) => {
        player.stop().dispose();
      });
      this.activeNotes.clear();
      this.isPlaying = false;
      this.notifyStateChange();
    } catch (error) {
      console.error('Error stopping all notes:', error);
    }
  }

  setLoopEnabled(enabled: boolean) {
    this.loopEnabled = enabled;
    this.activeNotes.forEach(player => {
      player.loop = enabled;
    });
    this.notifyStateChange();
  }

  isCurrentlyPlaying() {
    return this.isPlaying;
  }

  getWaveformData(): Float32Array {
    return this.waveformData;
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

      if (effects.chorusDepth !== undefined && effects.chorusDepth !== this.effects.chorus.currentDepth) {
        this.effects.chorus.voices.forEach(voice => {
          voice.disconnect();
          voice.dispose();
        });
        
        this.effects.chorus.voices = this.createChorusVoices(effects.chorusDepth);
        this.effects.chorus.voices.forEach(voice => {
          voice.start();
          voice.connect(this.effects.chorus.mix);
        });
        
        this.effects.chorus.currentDepth = effects.chorusDepth;
      }
      
      if (effects.chorusMix !== undefined) {
        this.effects.chorus.wet.gain.rampTo(effects.chorusMix, 0.1);
      }

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

      if (effects.reverbLevel !== undefined) {
        this.effects.reverb.wet.value = effects.reverbLevel;
      }

      if (effects.delayTime !== undefined) {
        this.effects.delay.delayTime.value = effects.delayTime;
      }

      if (effects.filterFreq !== undefined) {
        this.effects.filter.frequency.value = effects.filterFreq;
      }

      if (effects.resonance !== undefined) {
        this.effects.filter.Q.value = effects.resonance;
      }

      if (effects.distortion !== undefined) {
        this.effects.distortion.distortion = effects.distortion;
      }

      if (effects.distortionMix !== undefined) {
        this.effects.distortion.wet.value = effects.distortionMix;
      }

      if (effects.pitchShift !== undefined) {
        this.pitchShiftAmount = effects.pitchShift;
      }

      this.notifyEffectUpdate(effects);

    } catch (error) {
      console.error('Error setting effects:', error);
    }
  }

  dispose() {
    try {
      if (this.isInitialized) {
        this.stopAllNotes();

        Object.values(this.effects).forEach(effect => {
          if (effect instanceof Tone.ToneAudioNode) {
            effect.dispose();
          } else if (typeof effect === 'object') {
            Object.values(effect).forEach(nestedEffect => {
              if (nestedEffect instanceof Tone.ToneAudioNode) {
                nestedEffect.dispose();
              } else if (Array.isArray(nestedEffect)) {
                nestedEffect.forEach(voice => voice.dispose());
              }
            });
          }
        });

        this.audioBuffers.clear();
        this.activeNotes.clear();
        this.stateChangeCallbacks.clear();
        this.waveformUpdateCallbacks.clear();
        this.effectUpdateCallbacks.clear();
        this.isInitialized = false;
        this.notifyStateChange();
      }
    } catch (error) {
      console.error('Error in dispose:', error);
    }
  }
}

export default AudioProcessor;