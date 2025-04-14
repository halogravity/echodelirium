import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import AudioProcessor from '../lib/audioProcessor';
import { MIDIController } from '../lib/midi';
import { uploadRecording, saveRecordingMetadata } from '../lib/storage';
import { Mic, Square, Play, Save, Trash2, Settings, Piano, Eye, EyeOff } from 'lucide-react';
import Manual from './Manual';
import AudioControls from './AudioControls';
import VirtualKeyboard from './VirtualKeyboard';
import PresetManager from './PresetManager';
import NeuralVisualizer from './NeuralVisualizer';
import MIDIControls from './MIDIControls';
import ErrorMessage from './ErrorMessage';

interface AudioRecorderProps {
  isManualOpen: boolean;
  onManualClose: () => void;
}

function AudioRecorder({ isManualOpen, onManualClose }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [recordingCount, setRecordingCount] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5);
  const [audioProcessor, setAudioProcessor] = useState<AudioProcessor | null>(null);
  const [midiController, setMidiController] = useState<MIDIController | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<Float32Array | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [midiEnabled, setMidiEnabled] = useState(false);
  const [midiInputs, setMidiInputs] = useState<WebMidi.Input[]>([]);
  const [activeMidiInput, setActiveMidiInput] = useState<WebMidi.Input | null>(null);

  // Audio processing parameters with reactive state
  const [filterFreq, setFilterFreq] = useState(2000);
  const [filterRes, setFilterRes] = useState(1);
  const [distortion, setDistortion] = useState(0.5);
  const [distortionMix, setDistortionMix] = useState(0.3);
  const [pareidoliaIntensity, setPareidoliaIntensity] = useState(0.5);
  const [chaosLevel, setChaosLevel] = useState(0.3);
  const [dreamDepth, setDreamDepth] = useState(1);
  const [styleInfluence, setStyleInfluence] = useState(0.5);
  const [styleBlend, setStyleBlend] = useState(0.5);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [pitchShift, setPitchShift] = useState(0);
  const [pitchMix, setPitchMix] = useState(0.5);
  const [reverbDecay, setReverbDecay] = useState(1);
  const [reverbMix, setReverbMix] = useState(0.3);
  const [granularDensity, setGranularDensity] = useState(0.5);
  const [granularSize, setGranularSize] = useState(0.1);
  const [spectralWarp, setSpectralWarp] = useState(0);
  const [spectralShift, setSpectralShift] = useState(0);
  const [neuralMod, setNeuralMod] = useState(0.5);
  const [neuralFeedback, setNeuralFeedback] = useState(0.3);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  // Initialize audio processor and MIDI controller
  useEffect(() => {
    const processor = new AudioProcessor();
    setAudioProcessor(processor);

    const midi = new MIDIController();
    setMidiController(midi);

    // Subscribe to processor state changes
    const unsubscribeState = processor.onStateChange(() => {
      setIsPlaying(processor.isCurrentlyPlaying());
    });

    // Subscribe to waveform updates
    const unsubscribeWaveform = processor.onWaveformUpdate((data) => {
      setWaveformData(data);
    });

    return () => {
      processor.dispose();
      midi.dispose();
      unsubscribeState();
      unsubscribeWaveform();
    };
  }, []);

  // Initialize MIDI controller
  useEffect(() => {
    if (!midiController) return;

    const initializeMidi = async () => {
      try {
        await midiController.initialize();
        setMidiEnabled(midiController.isEnabled());
        setMidiInputs(midiController.getInputs());

        midiController.onNote((note, velocity) => {
          handlePlayNote(note, velocity);
        });

        midiController.onNoteOff((note) => {
          handleStopNote(note);
        });

        midiController.onCC((cc, value) => {
          switch (cc) {
            case 71: setFilterRes(value * 10); break;
            case 74: setFilterFreq(value * 20000); break;
            case 91: setReverbMix(value); break;
            case 93: setStyleBlend(value); break;
            case 16: setPareidoliaIntensity(value); break;
            case 17: setChaosLevel(value); break;
            case 18: setDreamDepth(value * 10); break;
          }
        });
      } catch (error) {
        console.error('Failed to initialize MIDI:', error);
        setError('Failed to initialize MIDI controller');
      }
    };

    initializeMidi();
  }, [midiController]);

  // Update audio processor effects when parameters change
  useEffect(() => {
    if (!audioProcessor) return;

    audioProcessor.setEffects({
      reverbLevel: reverbMix,
      delayTime: reverbDecay,
      filterFreq,
      resonance: filterRes,
      distortion,
      distortionMix,
      pitchShift,
      pitchMix,
      echoIntensity: pareidoliaIntensity,
      echoLength: dreamDepth,
      chorusDepth: styleInfluence,
      chorusMix: styleBlend,
      lofiAmount: chaosLevel,
      lofiMix: neuralMod
    });
  }, [
    audioProcessor,
    filterFreq,
    filterRes,
    distortion,
    distortionMix,
    pareidoliaIntensity,
    chaosLevel,
    dreamDepth,
    styleInfluence,
    styleBlend,
    pitchShift,
    pitchMix,
    reverbDecay,
    reverbMix,
    neuralMod
  ]);

  // Recording timer effect
  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    } else if (isRecording && timeLeft === 0) {
      stopRecording();
    }
  }, [isRecording, timeLeft]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const finalName = recordingName || `Echo ${recordingCount}`;
        setRecordingName(finalName);
        setRecordingCount(prev => prev + 1);

        try {
          const fileName = `${Date.now()}-${finalName}.wav`;
          const storagePath = await uploadRecording(audioBlob, fileName);
          
          if (storagePath) {
            await saveRecordingMetadata(finalName, storagePath);
          }
        } catch (error) {
          setError('Failed to save recording');
          console.error('Error saving recording:', error);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimeLeft(5);
    } catch (error) {
      setError('Failed to start recording');
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  };

  const handlePlayNote = async (note: string, velocity: number = 0.8) => {
    if (!audioProcessor || !audioUrl) {
      console.warn('Audio processor or audio URL not ready');
      return;
    }

    try {
      await audioProcessor.playProcessedSound(note, audioUrl, true);
    } catch (error) {
      console.error('Error playing note:', error);
      setError('Failed to play note');
    }
  };

  const handleStopNote = (note: string) => {
    if (!audioProcessor) {
      console.warn('Audio processor not ready');
      return;
    }

    try {
      audioProcessor.stopNote(note);
    } catch (error) {
      console.error('Error stopping note:', error);
      setError('Failed to stop note');
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingName('');
    chunksRef.current = [];
  };

  const handlePresetLoad = (parameters: any) => {
    setFilterFreq(parameters.filterFreq ?? filterFreq);
    setFilterRes(Math.min(Math.max(parameters.filterRes ?? filterRes, 0.1), 10));
    setDistortion(Math.min(Math.max(parameters.distortion ?? distortion, 0), 1));
    setDistortionMix(Math.min(Math.max(parameters.distortionMix ?? distortionMix, 0), 1));
    setPareidoliaIntensity(Math.min(Math.max(parameters.pareidoliaIntensity ?? pareidoliaIntensity, 0), 1));
    setChaosLevel(Math.min(Math.max(parameters.chaosLevel ?? chaosLevel, 0), 1));
    setDreamDepth(Math.min(Math.max(parameters.dreamDepth ?? dreamDepth, 0.1), 10));
    setStyleInfluence(Math.min(Math.max(parameters.styleInfluence ?? styleInfluence, 0), 1));
    setStyleBlend(Math.min(Math.max(parameters.styleBlend ?? styleBlend, 0), 1));
    setSelectedStyles(parameters.selectedStyles ?? selectedStyles);
    setPitchShift(Math.min(Math.max(parameters.pitchShift ?? pitchShift, -12), 12));
    setPitchMix(Math.min(Math.max(parameters.pitchMix ?? pitchMix, 0), 1));
    setReverbDecay(Math.min(Math.max(parameters.reverbDecay ?? reverbDecay, 0.1), 10));
    setReverbMix(Math.min(Math.max(parameters.reverbMix ?? reverbMix, 0), 1));
  };

  const handleMidiInputSelect = (input: WebMidi.Input | null) => {
    if (midiController) {
      midiController.setActiveInput(input);
      setActiveMidiInput(input);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Manual isOpen={isManualOpen} onClose={onManualClose} />

      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      {/* Recording Controls */}
      <div className="bg-black/40 p-4 border border-red-900/20 mb-8">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
            placeholder="Name Your Audio"
            className="bg-black/30 text-red-200 px-4 py-2 font-mono border border-red-900/30 focus:outline-none focus:border-red-500/50"
          />
          
          <div className="flex items-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-900/30 transition-colors"
                disabled={isRecording}
              >
                <Mic className="w-4 h-4" />
                Record
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/40 border border-red-600/50 text-red-500 hover:bg-red-900/50 transition-colors animate-pulse"
              >
                <Square className="w-4 h-4" />
                Stop ({timeLeft}s)
              </button>
            )}

            {audioUrl && (
              <button
                onClick={clearRecording}
                className="flex items-center gap-2 px-4 py-2 border border-red-900/30 text-red-500/70 hover:text-red-500 hover:border-red-900/50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Neural Visualizer */}
        <NeuralVisualizer
          audioData={waveformData}
          intensity={pareidoliaIntensity}
          chaos={chaosLevel}
          dreamDepth={dreamDepth}
          isPlaying={isPlaying}
        />

        {/* Control Buttons */}
        {audioUrl && (
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-2 px-4 py-2 border border-red-900/30 text-red-500/70 hover:text-red-500 hover:border-red-900/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {showControls ? 'Hide Controls' : 'Show Controls'}
            </button>
            <button
              onClick={() => setShowKeyboard(!showKeyboard)}
              className="flex items-center gap-2 px-4 py-2 border border-red-900/30 text-red-500/70 hover:text-red-500 hover:border-red-900/50 transition-colors"
            >
              {showKeyboard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8">
          {/* Audio Controls */}
          {showControls && (
            <div className="mb-8">
              <AudioControls
                filterFreq={filterFreq}
                filterRes={filterRes}
                distortion={distortion}
                distortionMix={distortionMix}
                pareidoliaIntensity={pareidoliaIntensity}
                chaosLevel={chaosLevel}
                dreamDepth={dreamDepth}
                styleInfluence={styleInfluence}
                styleBlend={styleBlend}
                selectedStyle={selectedStyles[0] || ''}
                pitchShift={pitchShift}
                pitchMix={pitchMix}
                reverbDecay={reverbDecay}
                reverbMix={reverbMix}
                granularDensity={granularDensity}
                granularSize={granularSize}
                spectralWarp={spectralWarp}
                spectralShift={spectralShift}
                neuralMod={neuralMod}
                neuralFeedback={neuralFeedback}
                onFilterFreqChange={setFilterFreq}
                onFilterResChange={setFilterRes}
                onDistortionChange={setDistortion}
                onDistortionMixChange={setDistortionMix}
                onPareidoliaIntensityChange={setPareidoliaIntensity}
                onChaosLevelChange={setChaosLevel}
                onDreamDepthChange={setDreamDepth}
                onStyleInfluenceChange={setStyleInfluence}
                onStyleBlendChange={setStyleBlend}
                onStyleChange={setSelectedStyles}
                onPitchShiftChange={setPitchShift}
                onPitchMixChange={setPitchMix}
                onReverbDecayChange={setReverbDecay}
                onReverbMixChange={setReverbMix}
                onGranularDensityChange={setGranularDensity}
                onGranularSizeChange={setGranularSize}
                onSpectralWarpChange={setSpectralWarp}
                onSpectralShiftChange={setSpectralShift}
                onNeuralModChange={setNeuralMod}
                onNeuralFeedbackChange={setNeuralFeedback}
                isOpen={showControls}
              />
            </div>
          )}

          {/* Virtual Keyboard */}
          {showKeyboard && audioUrl && (
            <div className="mb-8">
              <VirtualKeyboard
                onNoteOn={handlePlayNote}
                onNoteOff={handleStopNote}
                disabled={!audioUrl || !audioProcessor}
              />
            </div>
          )}

          {/* Preset Manager */}
          <PresetManager
            currentParameters={{
              filterFreq,
              filterRes,
              distortion,
              distortionMix,
              pareidoliaIntensity,
              chaosLevel,
              dreamDepth,
              styleInfluence,
              styleBlend,
              selectedStyles,
              pitchShift,
              pitchMix,
              reverbDecay,
              reverbMix
            }}
            onLoadPreset={handlePresetLoad}
          />
        </div>

        {/* MIDI Controls */}
        <MIDIControls
          inputs={midiInputs}
          isEnabled={midiEnabled}
          activeInput={activeMidiInput}
          onSelectInput={handleMidiInputSelect}
        />
      </div>
    </div>
  );
}

export default AudioRecorder;