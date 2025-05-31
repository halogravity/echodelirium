import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import AudioProcessor from '../lib/audioProcessor';
import { uploadRecording, saveRecordingMetadata } from '../lib/storage';
import { Mic, Square, Save, Trash2, Settings, Piano, Eye, EyeOff } from 'lucide-react';
import Manual from './Manual';
import AudioControls from './AudioControls';
import VirtualKeyboard from './VirtualKeyboard';
import PresetManager from './PresetManager';
import RecordingManager from './RecordingManager';
import NeuralVisualizer from './NeuralVisualizer';
import ErrorMessage from './ErrorMessage';

interface AudioRecorderProps {
  isManualOpen: boolean;
  onManualClose: () => void;
}

export function AudioRecorder({ isManualOpen, onManualClose }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordingName, setRecordingName] = useState('');
  const [recordingTime, setRecordingTime] = useState(5);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const audioProcessorRef = useRef<AudioProcessor>(new AudioProcessor());
  const [showControlButtons, setShowControlButtons] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const timerRef = useRef<number | null>(null);

  const [parameters, setParameters] = useState({
    filterFreq: 2000,
    filterRes: 1,
    distortion: 0,
    distortionMix: 0,
    pareidoliaIntensity: 0,
    chaosLevel: 0,
    dreamDepth: 1,
    styleInfluence: 0,
    styleBlend: 0,
    selectedStyle: '',
    pitchShift: 0,
    pitchMix: 0,
    reverbDecay: 0,
    reverbMix: 0,
    granularDensity: 0,
    granularSize: 0.01,
    spectralWarp: 0,
    spectralShift: 0,
    neuralMod: 0,
    neuralFeedback: 0,
    chorusDepth: 0,
    chorusRate: 0.1,
    chorusMix: 0,
    lofiCrush: 0,
    lofiDepth: 0,
    lofiMix: 0,
    delayTime: 0,
    delayFeedback: 0,
    delayMix: 0,
    compThreshold: -24,
    compRatio: 4,
    compKnee: 10
  });

  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioProcessorRef.current.initialize();
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initAudio();

    return () => {
      audioProcessorRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (isRecording && recordingTime > 0) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev - 1);
      }, 1000);
    } else if (recordingTime === 0) {
      stopRecording();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, recordingTime]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(chunks => [...chunks, e.data]);
          setHasRecording(true);
        }
      };

      recorder.onstop = () => {
        const tracks = recorder.stream.getTracks();
        tracks.forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(5);
    } catch (error) {
      setError('Failed to start recording');
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleSaveRecording = async () => {
    try {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const fileName = `${Date.now()}-${recordingName || 'recording'}.wav`;
      
      const storagePath = await uploadRecording(audioBlob, fileName);
      if (storagePath) {
        await saveRecordingMetadata(recordingName || 'Untitled Recording', storagePath);
        setHasRecording(false);
        setAudioChunks([]);
        setRecordingName('');
      }
    } catch (error) {
      setError('Failed to save recording');
      console.error('Error saving recording:', error);
    }
  };

  const handleClearRecording = () => {
    setAudioChunks([]);
    setRecordingTime(5);
    setRecordingName('');
    setHasRecording(false);
  };

  const handlePlayRecording = async (url: string) => {
    try {
      await audioProcessorRef.current.initialize();
      await audioProcessorRef.current.loadAudioBuffer(url);
      await audioProcessorRef.current.playProcessedSound('C4', url, true);
      setIsPlaying(true);
      setCurrentRecording(url);
      setShowControlButtons(true);
    } catch (error) {
      setError('Failed to play recording');
      console.error('Error playing recording:', error);
    }
  };

  const handleStopRecording = () => {
    audioProcessorRef.current.stopAllNotes();
    setIsPlaying(false);
    setCurrentRecording(null);
  };

  const handleParameterChange = (name: string, value: number) => {
    setParameters(prev => ({ ...prev, [name]: value }));
    audioProcessorRef.current.setEffects({
      reverbLevel: parameters.reverbMix,
      delayTime: parameters.delayTime,
      filterFreq: parameters.filterFreq,
      resonance: parameters.filterRes,
      echoIntensity: parameters.delayFeedback,
      echoLength: parameters.delayTime,
      distortion: parameters.distortion,
      distortionMix: parameters.distortionMix,
      pareidoliaIntensity: parameters.pareidoliaIntensity,
      pitchShift: parameters.pitchShift,
      pitchMix: parameters.pitchMix,
      chorusDepth: parameters.chorusDepth,
      chorusMix: parameters.chorusMix,
      lofiAmount: parameters.lofiDepth,
      lofiMix: parameters.lofiMix
    });
  };

  const handleNoteOn = async (note: string, velocity: number) => {
    if (currentRecording) {
      await audioProcessorRef.current.playProcessedSound(note, currentRecording, true);
    }
  };

  const handleNoteOff = (note: string) => {
    audioProcessorRef.current.stopNote(note);
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

      <div className="mb-8 bg-black/40 p-4 border border-red-900/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isPlaying}
              className={`
                relative flex items-center gap-2 px-4 h-12 transition-colors
                ${isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-red-900/20 hover:bg-red-900/30 border border-red-900/50'
                }
              `}
            >
              {isRecording ? (
                <>
                  <Square className="w-6 h-6 text-white" />
                  <span className="text-white font-mono">Recording</span>
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6 text-red-500" />
                  <span className="text-red-500 font-mono">Record</span>
                </>
              )}
            </button>

            {(isRecording || hasRecording) && (
              <>
                <button
                  onClick={handleSaveRecording}
                  className="flex items-center gap-2 px-4 h-12 bg-red-900/20 hover:bg-red-900/30 border border-red-900/50 text-red-500"
                >
                  <Save className="w-6 h-6" />
                  <span className="font-mono">Save</span>
                </button>

                <button
                  onClick={handleClearRecording}
                  className="flex items-center gap-2 px-4 h-12 bg-red-900/20 hover:bg-red-900/30 border border-red-900/50 text-red-500"
                >
                  <Trash2 className="w-6 h-6" />
                  <span className="font-mono">Clear</span>
                </button>
              </>
            )}
          </div>

          <div className="flex-1">
            <input
              type="text"
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              placeholder="Recording name..."
              disabled={isPlaying}
              className="w-full bg-black/30 border border-red-900/30 text-red-200 px-4 py-2 placeholder:text-red-200/30 focus:outline-none focus:border-red-500/50"
            />
          </div>

          {isRecording && (
            <div className="text-red-500 font-mono">
              {recordingTime}s
            </div>
          )}

          {showControlButtons && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowControls(!showControls)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors uppercase tracking-wider border border-red-900/20 hover:border-red-900/40"
              >
                {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showControls ? 'Hide Effects' : 'Show Effects'}
              </button>
              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors uppercase tracking-wider border border-red-900/20 hover:border-red-900/40"
              >
                {showKeyboard ? <EyeOff className="w-4 h-4" /> : <Piano className="w-4 h-4" />}
                {showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <NeuralVisualizer
            audioData={audioProcessorRef.current.getWaveformData()}
            intensity={parameters.pareidoliaIntensity}
            chaos={parameters.chaosLevel}
            dreamDepth={parameters.dreamDepth}
            isPlaying={isPlaying}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {showControls && (
            <AudioControls
              isOpen={true}
              {...parameters}
              onFilterFreqChange={(value) => handleParameterChange('filterFreq', value)}
              onFilterResChange={(value) => handleParameterChange('filterRes', value)}
              onDistortionChange={(value) => handleParameterChange('distortion', value)}
              onDistortionMixChange={(value) => handleParameterChange('distortionMix', value)}
              onPareidoliaIntensityChange={(value) => handleParameterChange('pareidoliaIntensity', value)}
              onChaosLevelChange={(value) => handleParameterChange('chaosLevel', value)}
              onDreamDepthChange={(value) => handleParameterChange('dreamDepth', value)}
              onStyleInfluenceChange={(value) => handleParameterChange('styleInfluence', value)}
              onStyleBlendChange={(value) => handleParameterChange('styleBlend', value)}
              onStyleChange={(styles) => handleParameterChange('selectedStyle', styles[0])}
              onPitchShiftChange={(value) => handleParameterChange('pitchShift', value)}
              onPitchMixChange={(value) => handleParameterChange('pitchMix', value)}
              onReverbDecayChange={(value) => handleParameterChange('reverbDecay', value)}
              onReverbMixChange={(value) => handleParameterChange('reverbMix', value)}
              onGranularDensityChange={(value) => handleParameterChange('granularDensity', value)}
              onGranularSizeChange={(value) => handleParameterChange('granularSize', value)}
              onSpectralWarpChange={(value) => handleParameterChange('spectralWarp', value)}
              onSpectralShiftChange={(value) => handleParameterChange('spectralShift', value)}
              onNeuralModChange={(value) => handleParameterChange('neuralMod', value)}
              onNeuralFeedbackChange={(value) => handleParameterChange('neuralFeedback', value)}
              onChorusDepthChange={(value) => handleParameterChange('chorusDepth', value)}
              onChorusRateChange={(value) => handleParameterChange('chorusRate', value)}
              onChorusMixChange={(value) => handleParameterChange('chorusMix', value)}
              onLofiCrushChange={(value) => handleParameterChange('lofiCrush', value)}
              onLofiDepthChange={(value) => handleParameterChange('lofiDepth', value)}
              onLofiMixChange={(value) => handleParameterChange('lofiMix', value)}
              onDelayTimeChange={(value) => handleParameterChange('delayTime', value)}
              onDelayFeedbackChange={(value) => handleParameterChange('delayFeedback', value)}
              onDelayMixChange={(value) => handleParameterChange('delayMix', value)}
              onCompThresholdChange={(value) => handleParameterChange('compThreshold', value)}
              onCompRatioChange={(value) => handleParameterChange('compRatio', value)}
              onCompKneeChange={(value) => handleParameterChange('compKnee', value)}
            />
          )}

          {showKeyboard && (
            <VirtualKeyboard
              onNoteOn={handleNoteOn}
              onNoteOff={handleNoteOff}
              octaves={2}
              startOctave={4}
              velocity={0.8}
              disabled={isRecording}
            />
          )}
        </div>

        <div className="space-y-8">
          <RecordingManager
            onPlay={handlePlayRecording}
            onStop={handleStopRecording}
            isPlaying={isPlaying}
            currentRecording={currentRecording}
          />

          <PresetManager
            currentParameters={parameters}
            onLoadPreset={(params) => {
              setParameters(params);
              audioProcessorRef.current.setEffects(params);
            }}
          />
        </div>
      </div>
    </div>
  );
}