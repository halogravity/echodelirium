import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as Tone from 'tone';
import { Scale, Chord } from 'tonal';
import { Music, Settings2, Save, FolderOpen, Trash2, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import Knob from './Knob';

interface PolyTrackProps {
  currentStep: number;
  stepAmount: number;
  onStepAmountChange?: (steps: number) => void;
}

export interface PolyTrackRef {
  getCurrentNotes: () => string[];
  stopCurrentNotes: () => void;
  playStep: (step: number, time?: number) => void;
  stop: () => void;
}

interface PatternPreset {
  name: string;
  pattern: boolean[][];
  scale: {
    rootNote: string;
    octave: number;
    selectedScale: string;
  };
  chordProgression: string[];
}

const STEP_OPTIONS = [4, 8, 16, 32, 64] as const;
type StepAmount = typeof STEP_OPTIONS[number];

const POLY_PATTERNS: PatternPreset[] = [
  {
    name: "Ambient Pad",
    pattern: Array(16).fill(null).map((_, i) => [i % 8 === 0, i % 8 === 0, i % 8 === 0, i % 8 === 4, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'major' },
    chordProgression: ['Cmaj7', 'Am7', 'Fmaj7', 'G7']
  },
  {
    name: "Dark Chords",
    pattern: Array(16).fill(null).map((_, i) => [i % 4 === 0, i % 4 === 0, i % 4 === 0, i % 8 === 4, false]),
    scale: { rootNote: 'C', octave: 3, selectedScale: 'minor' },
    chordProgression: ['Cm7', 'Ab7', 'Gm7b5', 'Bb7']
  },
  {
    name: "Ethereal Pads",
    pattern: Array(16).fill(null).map((_, i) => [i === 0 || i === 8, i === 0 || i === 8, i === 0 || i === 8, i === 4 || i === 12, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'lydian' },
    chordProgression: ['Cmaj9', 'Em9', 'Fmaj9', 'Dm9']
  },
  {
    name: "Trance Chords",
    pattern: Array(16).fill(null).map((_, i) => [i % 4 === 0, i % 4 === 1, i % 4 === 2, i % 4 === 3, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'minor' },
    chordProgression: ['Cm', 'Ab', 'Bb', 'Gm']
  },
  {
    name: "Jazz Voicings",
    pattern: Array(16).fill(null).map((_, i) => [i % 2 === 0, i % 4 === 1, i % 4 === 2, i % 8 === 6, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'dorian' },
    chordProgression: ['Cm9', 'F9', 'Bbmaj7', 'A7alt']
  },
  {
    name: "Cinematic",
    pattern: Array(16).fill(null).map((_, i) => [i === 0 || i === 12, i === 4 || i === 8, i === 2 || i === 10, i === 6 || i === 14, false]),
    scale: { rootNote: 'C', octave: 3, selectedScale: 'phrygian' },
    chordProgression: ['Cm', 'Ab', 'Fm', 'G']
  },
  {
    name: "Neo Soul",
    pattern: Array(16).fill(null).map((_, i) => [i % 8 === 0, i % 8 === 2, i % 8 === 4, i % 8 === 6, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'dorian' },
    chordProgression: ['Cm11', 'F13', 'Bbmaj9', 'Ebmaj7#11']
  },
  {
    name: "Synthwave",
    pattern: Array(16).fill(null).map((_, i) => [i % 4 === 0, i % 8 === 2, i % 8 === 6, i % 16 === 14, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'minor' },
    chordProgression: ['Cm', 'Ab', 'F', 'G']
  },
  {
    name: "Future Pop",
    pattern: Array(16).fill(null).map((_, i) => [i % 8 === 0, i % 8 === 3, i % 8 === 5, i % 16 === 11, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'major' },
    chordProgression: ['Cmaj9', 'Am9', 'Fmaj7', 'G13']
  },
  {
    name: "Modal Jazz",
    pattern: Array(16).fill(null).map((_, i) => [i % 6 === 0, i % 6 === 2, i % 6 === 4, i % 12 === 8, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'dorian' },
    chordProgression: ['Cm11', 'D7alt', 'Ebmaj13', 'A7b9']
  },
  {
    name: "Lofi Chords",
    pattern: Array(16).fill(null).map((_, i) => [i % 4 === 0, i % 8 === 2, i % 8 === 5, i % 16 === 13, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'minor' },
    chordProgression: ['Cm9', 'Fm7', 'Abmaj7', 'G7sus4']
  },
  {
    name: "Dream Pop",
    pattern: Array(16).fill(null).map((_, i) => [i % 16 === 0, i % 16 === 4, i % 16 === 8, i % 16 === 12, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'lydian' },
    chordProgression: ['Cmaj7#11', 'Am9', 'Fmaj9', 'Em7']
  },
  {
    name: "Minimal House",
    pattern: Array(16).fill(null).map((_, i) => [i % 8 === 0, i % 16 === 4, i % 16 === 12, i % 16 === 14, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'minor' },
    chordProgression: ['Cm7', 'Fm7', 'Gm7', 'Ab6']
  },
  {
    name: "Atmospheric",
    pattern: Array(16).fill(null).map((_, i) => [i === 0, i === 8, i === 12, i === 14, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'phrygian' },
    chordProgression: ['Cm', 'Db', 'Bb', 'Ab']
  },
  {
    name: "Fusion Prog",
    pattern: Array(16).fill(null).map((_, i) => [i % 5 === 0, i % 7 === 0, i % 3 === 0, i % 11 === 0, false]),
    scale: { rootNote: 'C', octave: 4, selectedScale: 'lydian' },
    chordProgression: ['Cmaj7#11', 'Bm7b5', 'Em7', 'A7alt']
  }
];

const SOUND_PRESETS = [
  {
    name: "Warm Pad",
    settings: {
      oscillatorType: "sine",
      attack: 0.5,
      decay: 0.8,
      sustain: 0.8,
      release: 1.0,
      filterFreq: 2000,
      filterQ: 1
    }
  },
  {
    name: "Bright Strings",
    settings: {
      oscillatorType: "sawtooth",
      attack: 0.2,
      decay: 0.4,
      sustain: 0.7,
      release: 0.5,
      filterFreq: 4000,
      filterQ: 2
    }
  },
  {
    name: "Dark Atmosphere",
    settings: {
      oscillatorType: "triangle",
      attack: 1.0,
      decay: 1.5,
      sustain: 0.8,
      release: 2.0,
      filterFreq: 1000,
      filterQ: 3
    }
  },
  {
    name: "Crystal Bells",
    settings: {
      oscillatorType: "sine",
      attack: 0.01,
      decay: 0.3,
      sustain: 0.2,
      release: 1.5,
      filterFreq: 8000,
      filterQ: 4
    }
  },
  {
    name: "Analog Dreams",
    settings: {
      oscillatorType: "sawtooth",
      attack: 0.8,
      decay: 1.2,
      sustain: 0.7,
      release: 2.0,
      filterFreq: 3000,
      filterQ: 5
    }
  },
  {
    name: "Glass Texture",
    settings: {
      oscillatorType: "triangle",
      attack: 0.3,
      decay: 0.6,
      sustain: 0.4,
      release: 1.8,
      filterFreq: 6000,
      filterQ: 3
    }
  },
  {
    name: "Ethereal Voices",
    settings: {
      oscillatorType: "sine",
      attack: 1.2,
      decay: 1.5,
      sustain: 0.9,
      release: 3.0,
      filterFreq: 2500,
      filterQ: 2
    }
  },
  {
    name: "Cosmic Sweep",
    settings: {
      oscillatorType: "sawtooth",
      attack: 2.0,
      decay: 1.0,
      sustain: 0.8,
      release: 4.0,
      filterFreq: 1500,
      filterQ: 6
    }
  },
  {
    name: "Digital Choir",
    settings: {
      oscillatorType: "triangle",
      attack: 0.6,
      decay: 0.8,
      sustain: 0.9,
      release: 2.5,
      filterFreq: 3500,
      filterQ: 2
    }
  },
  {
    name: "Quantum Waves",
    settings: {
      oscillatorType: "square",
      attack: 1.5,
      decay: 1.2,
      sustain: 0.6,
      release: 3.5,
      filterFreq: 2000,
      filterQ: 8
    }
  },
  {
    name: "Synthwave Brass",
    settings: {
      oscillatorType: "sawtooth",
      attack: 0.1,
      decay: 0.3,
      sustain: 0.7,
      release: 0.8,
      filterFreq: 3000,
      filterQ: 4
    }
  },
  {
    name: "Lofi Keys",
    settings: {
      oscillatorType: "triangle",
      attack: 0.05,
      decay: 0.2,
      sustain: 0.6,
      release: 0.4,
      filterFreq: 2200,
      filterQ: 2
    }
  },
  {
    name: "Dream Organ",
    settings: {
      oscillatorType: "sine",
      attack: 0.15,
      decay: 0.4,
      sustain: 0.8,
      release: 1.2,
      filterFreq: 2800,
      filterQ: 3
    }
  },
  {
    name: "Vapor Strings",
    settings: {
      oscillatorType: "sawtooth",
      attack: 0.3,
      decay: 0.6,
      sustain: 0.7,
      release: 2.0,
      filterFreq: 3200,
      filterQ: 5
    }
  },
  {
    name: "Future Ensemble",
    settings: {
      oscillatorType: "square",
      attack: 0.2,
      decay: 0.5,
      sustain: 0.75,
      release: 1.5,
      filterFreq: 4000,
      filterQ: 6
    }
  }
];

[Rest of the PolyTrack component code remains unchanged...]