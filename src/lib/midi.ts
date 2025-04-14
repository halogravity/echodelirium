import { WebMidi, Input } from 'webmidi';

export class MIDIController {
  private isInitialized = false;
  private activeInput: Input | null = null;
  private onNoteCallbacks: ((note: string, velocity: number) => void)[] = [];
  private onNoteOffCallbacks: ((note: string) => void)[] = [];
  private onCCCallbacks: ((cc: number, value: number) => void)[] = [];
  private ccValues: Map<number, number> = new Map();
  private ccMappings: Map<number, string> = new Map([
    [1, 'modulation'],
    [7, 'volume'],
    [71, 'resonance'],
    [74, 'cutoff'],
    [91, 'reverb'],
    [93, 'chorus'],
    [16, 'pareidolia'],
    [17, 'chaos'],
    [18, 'dreamDepth']
  ]);

  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      await WebMidi.enable({
        sysex: true,
        software: true,
        callback: (err) => {
          if (err) {
            console.warn('WebMidi enable callback error:', err);
          }
        }
      });

      await new Promise<void>((resolve) => {
        const checkEnabled = () => {
          if (WebMidi.enabled) {
            resolve();
          } else {
            setTimeout(checkEnabled, 100);
          }
        };
        checkEnabled();
      });

      WebMidi.addListener('connected', e => {
        console.log('MIDI device connected:', e.port.name);
      });

      WebMidi.addListener('disconnected', e => {
        console.log('MIDI device disconnected:', e.port.name);
        if (this.activeInput && this.activeInput.id === e.port.id) {
          this.setActiveInput(null);
        }
      });

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('WebMidi could not be enabled:', err);
      this.isInitialized = false;
      throw new Error(`Failed to initialize MIDI: ${err.message}`);
    }
  }

  setActiveInput(input: Input | null) {
    if (!this.isInitialized) {
      throw new Error('MIDI controller not initialized. Call initialize() first.');
    }

    try {
      if (this.activeInput) {
        try {
          this.activeInput.removeListener('noteon');
          this.activeInput.removeListener('noteoff');
          this.activeInput.removeListener('controlchange');
        } catch (err) {
          console.warn('Error removing previous input listeners:', err);
        }
        this.activeInput = null;
      }

      if (!input) {
        console.log('MIDI input deactivated');
        return;
      }

      if (!WebMidi.inputs.some(i => i.id === input.id)) {
        throw new Error('Selected MIDI input is no longer available');
      }

      input.addListener('noteon', e => {
        if (e?.note) {
          const note = `${e.note.name}${e.note.octave}`;
          const velocity = e.velocity || 0.8;
          this.onNoteCallbacks.forEach(callback => callback(note, velocity));
        }
      });

      input.addListener('noteoff', e => {
        if (e?.note) {
          const note = `${e.note.name}${e.note.octave}`;
          this.onNoteOffCallbacks.forEach(callback => callback(note));
        }
      });

      input.addListener('controlchange', e => {
        if (e?.controller) {
          const cc = e.controller.number;
          const value = e.value;
          this.ccValues.set(cc, value);
          this.onCCCallbacks.forEach(callback => callback(cc, value));
        }
      });

      this.activeInput = input;
      console.log('MIDI input activated:', input.name);
    } catch (err) {
      console.error('Error setting active input:', err);
      throw err;
    }
  }

  onNote(callback: (note: string, velocity: number) => void) {
    if (!this.isInitialized) {
      throw new Error('MIDI controller not initialized. Call initialize() first.');
    }
    this.onNoteCallbacks.push(callback);
  }

  onNoteOff(callback: (note: string) => void) {
    if (!this.isInitialized) {
      throw new Error('MIDI controller not initialized. Call initialize() first.');
    }
    this.onNoteOffCallbacks.push(callback);
  }

  onCC(callback: (cc: number, value: number) => void) {
    if (!this.isInitialized) {
      throw new Error('MIDI controller not initialized. Call initialize() first.');
    }
    this.onCCCallbacks.push(callback);
  }

  getCCValue(cc: number): number {
    if (!this.isInitialized) {
      throw new Error('MIDI controller not initialized. Call initialize() first.');
    }
    return this.ccValues.get(cc) || 0;
  }

  getCCMapping(cc: number): string | undefined {
    if (!this.isInitialized) {
      throw new Error('MIDI controller not initialized. Call initialize() first.');
    }
    return this.ccMappings.get(cc);
  }

  getAllCCValues(): Map<number, number> {
    if (!this.isInitialized) {
      throw new Error('MIDI controller not initialized. Call initialize() first.');
    }
    return new Map(this.ccValues);
  }

  getMappedCCValues(): Map<string, number> {
    if (!this.isInitialized) {
      throw new Error('MIDI controller not initialized. Call initialize() first.');
    }
    const mapped = new Map<string, number>();
    this.ccValues.forEach((value, cc) => {
      const mapping = this.ccMappings.get(cc);
      if (mapping) {
        mapped.set(mapping, value);
      }
    });
    return mapped;
  }

  isEnabled() {
    return this.isInitialized && WebMidi.enabled;
  }

  getInputs() {
    if (!this.isInitialized || !WebMidi.enabled) {
      return [];
    }
    return WebMidi.inputs;
  }

  getActiveInput() {
    if (!this.isInitialized) {
      return null;
    }
    return this.activeInput;
  }

  dispose() {
    try {
      if (this.activeInput) {
        try {
          this.activeInput.removeListener('noteon');
          this.activeInput.removeListener('noteoff');
          this.activeInput.removeListener('controlchange');
        } catch (err) {
          console.warn('Error removing listeners during disposal:', err);
        }
        this.activeInput = null;
      }
      this.onNoteCallbacks = [];
      this.onNoteOffCallbacks = [];
      this.onCCCallbacks = [];
      this.ccValues.clear();
      if (WebMidi.enabled) {
        WebMidi.disable();
      }
      this.isInitialized = false;
    } catch (err) {
      console.warn('Error disposing MIDI controller:', err);
      throw err;
    }
  }
}