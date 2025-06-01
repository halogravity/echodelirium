import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Music, Settings2, Save, FolderOpen, Trash2, ChevronDown, ChevronRight, Upload, Clock } from 'lucide-react';
import { Howl } from 'howler';
import { AudioLoader } from '../lib/audioLoader';
import { supabase } from '../lib/supabase';
import Knob from './Knob';

interface Sample {
  id: string;
  name: string;
  storage_path: string;
  type: string;
  created_at: string;
}

interface DrumTrackProps {
  currentStep: number;
  stepAmount: number;
  defaultSamplePath?: string;
  name?: string;
  bpm: number;
  onStepAmountChange?: (steps: number) => void;
  onBpmChange?: (bpm: number) => void;
}

export interface DrumTrackRef {
  getCurrentNotes: () => string[];
  stopCurrentNotes: () => void;
  playStep: (step: number, time?: number) => void;
  stop: () => void;
}

const STEP_OPTIONS = [4, 8, 16, 32, 64] as const;
type StepAmount = typeof STEP_OPTIONS[number];

const DEFAULT_SAMPLES = [
  { id: 'kick', name: 'Kick', path: '/samples/kick.wav' },
  { id: 'snare', name: 'Snare', path: '/samples/snare.wav' },
  { id: 'hihat', name: 'Hi-hat', path: '/samples/hihat.wav' },
  { id: 'bass', name: 'Bass', path: '/samples/bass.wav' },
  { id: 'sub', name: 'Sub', path: '/samples/sub.wav' }
];

const DrumTrack = forwardRef<DrumTrackRef, DrumTrackProps>(({ 
  currentStep, 
  stepAmount, 
  defaultSamplePath, 
  name,
  bpm,
  onStepAmountChange,
  onBpmChange
}, ref) => {
  const [pattern, setPattern] = useState<boolean[]>(Array(stepAmount).fill(false));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [volume, setVolume] = useState(0);
  const [pan, setPan] = useState(0);
  const [samplePath, setSamplePath] = useState(defaultSamplePath);
  const [userSamples, setUserSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localStepAmount, setLocalStepAmount] = useState<StepAmount>(stepAmount as StepAmount);
  const soundRef = useRef<Howl | null>(null);
  const patternRef = useRef(pattern);

  useEffect(() => {
    loadSamples();
  }, []);

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useEffect(() => {
    if (samplePath) {
      loadSample(samplePath);
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [samplePath]);

  const loadSamples = async () => {
    try {
      setIsLoading(true);
      
      // Load user samples
      const { data: userSamplesData, error: userError } = await supabase
        .from('samples')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;
      setUserSamples(userSamplesData || []);
    } catch (error) {
      console.error('Error loading samples:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = async (path: string) => {
    try {
      let audioUrl = path;

      // If not a local sample path, get signed URL from Supabase
      if (!path.startsWith('/samples/')) {
        const { data: { signedUrl }, error } = await supabase.storage
          .from('echobucket')
          .createSignedUrl(path, 3600);

        if (error) throw error;
        if (!signedUrl) throw new Error('Failed to get signed URL');
        
        audioUrl = signedUrl;
      }

      const sound = await AudioLoader.loadAudio(audioUrl);
      soundRef.current = sound;
      sound.volume(Math.pow(10, volume / 20));
      sound.stereo(pan);
    } catch (error) {
      console.error('Error loading sample:', error);
    }
  };

  const handleSampleSelect = async (sampleId: string, type: 'local' | 'user') => {
    if (type === 'local') {
      const sample = DEFAULT_SAMPLES.find(s => s.id === sampleId);
      if (sample) setSamplePath(sample.path);
    } else {
      const sample = userSamples.find(s => s.id === sampleId);
      if (sample) setSamplePath(sample.storage_path);
    }
  };

  const handleUploadSample = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `samples/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('echobucket')
        .upload(filePath, file, {
          contentType: 'audio/wav',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: sample, error: metadataError } = await supabase
        .from('samples')
        .insert([
          {
            name: file.name.replace('.wav', ''),
            storage_path: filePath,
            type: 'drum'
          }
        ])
        .select()
        .single();

      if (metadataError) throw metadataError;

      setUserSamples(prev => [sample, ...prev]);
      setSamplePath(filePath);
    } catch (error) {
      console.error('Error uploading sample:', error);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  useImperativeHandle(ref, () => ({
    getCurrentNotes: () => [],
    stopCurrentNotes: () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }
    },
    playStep: (step: number, time?: number) => {
      if (step >= patternRef.current.length) return;
      
      if (patternRef.current[step] && soundRef.current) {
        if (time !== undefined) {
          soundRef.current.seek(0);
          soundRef.current.play();
        } else {
          soundRef.current.play();
        }
      }
    },
    stop: () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }
    }
  }), []);

  const toggleStep = (step: number) => {
    setPattern(prev => {
      const newPattern = [...prev];
      newPattern[step] = !newPattern[step];
      return newPattern;
    });
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (soundRef.current) {
      soundRef.current.volume(Math.pow(10, value / 20));
    }
  };

  const handlePanChange = (value: number) => {
    setPan(value);
    if (soundRef.current) {
      soundRef.current.stereo(value);
    }
  };

  const handleStepAmountChange = (steps: number) => {
    const newStepAmount = steps as StepAmount;
    setLocalStepAmount(newStepAmount);
    
    // Update pattern length while preserving existing steps
    setPattern(prev => {
      const newPattern = Array(newStepAmount).fill(false);
      prev.forEach((step, i) => {
        if (i < newStepAmount) {
          newPattern[i] = step;
        }
      });
      return newPattern;
    });

    // Notify parent of step amount change
    if (onStepAmountChange) {
      onStepAmountChange(steps);
    }
  };

  return (
    <div className="bg-black/40 p-4 border border-red-900/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-red-500/50 hover:text-red-500 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
            <Music className="w-4 h-4" />
            {name || 'Drum Track'}
          </h3>
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500/70" />
              <input
                type="number"
                value={bpm}
                onChange={(e) => onBpmChange?.(parseInt(e.target.value))}
                className="w-16 bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-sm font-mono"
                min="20"
                max="300"
              />
              <span className="text-red-500/70 text-xs font-mono">BPM</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-red-500/70 text-xs font-mono">Steps:</span>
              <select
                value={localStepAmount}
                onChange={(e) => handleStepAmountChange(parseInt(e.target.value))}
                className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
              >
                {STEP_OPTIONS.map(amount => (
                  <option key={amount} value={amount}>{amount}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col items-center">
              <Knob
                value={volume}
                min={-60}
                max={12}
                onChange={handleVolumeChange}
                label="Volume"
              />
              <div className="text-red-300/50 text-xs font-mono mt-1">
                {volume > 0 ? '+' : ''}{volume.toFixed(1)} dB
              </div>
            </div>

            <div className="flex flex-col items-center">
              <Knob
                value={pan}
                min={-1}
                max={1}
                onChange={handlePanChange}
                label="Pan"
              />
              <div className="text-red-300/50 text-xs font-mono mt-1">
                {pan === 0 ? 'C' : pan < 0 ? `${Math.abs(pan * 100)}L` : `${pan * 100}R`}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <div>
              <div className="text-xs font-mono text-red-500/70 mb-2">Default Samples</div>
              <select
                value={samplePath?.split('/').pop()?.replace('.wav', '') || ''}
                onChange={(e) => handleSampleSelect(e.target.value, 'local')}
                className="w-full bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
              >
                <option value="">-- Select Sample --</option>
                {DEFAULT_SAMPLES.map(sample => (
                  <option key={sample.id} value={sample.id}>
                    {sample.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-mono text-red-500/70 mb-2">User Samples</div>
              <div className="flex items-center gap-2">
                <select
                  value=""
                  onChange={(e) => handleSampleSelect(e.target.value, 'user')}
                  className="flex-1 bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
                  disabled={isLoading}
                >
                  <option value="">-- Select Sample --</option>
                  {userSamples.map(sample => (
                    <option key={sample.id} value={sample.id}>{sample.name}</option>
                  ))}
                </select>

                <label className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept=".wav"
                    className="hidden"
                    onChange={handleUploadSample}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div 
              className="inline-flex gap-1 min-w-full" 
              style={{ width: `max(100%, ${localStepAmount * 40}px)` }}
            >
              {pattern.map((isActive, step) => (
                <button
                  key={step}
                  onClick={() => toggleStep(step)}
                  className={`
                    w-10 h-12 border transition-colors relative
                    ${step === currentStep ? 'border-red-500' : 'border-red-500/40'}
                    ${isActive
                      ? 'bg-red-900/40 border-red-400/70' 
                      : 'hover:border-red-400/70'
                    }
                    ${step % 4 === 0 ? 'border-l-2 border-l-red-500/60' : ''}
                  `}
                >
                  {step % 4 === 0 && (
                    <div className="absolute -top-6 left-0 text-xs font-mono text-red-500/50">
                      {step + 1}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default DrumTrack;