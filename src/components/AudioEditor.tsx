import React, { useState, useEffect, useRef } from 'react';
import { AudioWaveform as Waveform, Volume2, RotateCcw, Scissors, AlertCircle } from 'lucide-react';
import WaveformDisplay from './WaveformDisplay';

interface AudioEditorProps {
  audioUrl: string;
  onSave: (blob: Blob) => Promise<void>;
  onClose: () => void;
}

const AudioEditor: React.FC<AudioEditorProps> = ({ audioUrl, onSave, onClose }) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [startTrim, setStartTrim] = useState(0);
  const [endTrim, setEndTrim] = useState(1);
  const [gain, setGain] = useState(1);
  const [isReversed, setIsReversed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const validateAudioFormat = (arrayBuffer: ArrayBuffer): { isValid: boolean; format?: string; error?: string } => {
    const view = new DataView(arrayBuffer);
    
    // Check minimum header size
    if (arrayBuffer.byteLength < 12) {
      return {
        isValid: false,
        error: 'File is too small to be a valid audio file.'
      };
    }
    
    try {
      // Check for WAV format (RIFF header)
      const riffHeader = String.fromCharCode(
        view.getUint8(0),
        view.getUint8(1),
        view.getUint8(2),
        view.getUint8(3)
      );
      
      if (riffHeader === 'RIFF') {
        // Check for WAVE format type
        const waveHeader = String.fromCharCode(
          view.getUint8(8),
          view.getUint8(9),
          view.getUint8(10),
          view.getUint8(11)
        );
        
        if (waveHeader === 'WAVE') {
          return { isValid: true, format: 'WAV' };
        }
      }

      // Check for MP3 format (ID3v2 header)
      const id3Header = String.fromCharCode(
        view.getUint8(0),
        view.getUint8(1),
        view.getUint8(2)
      );
      
      if (id3Header === 'ID3') {
        return { isValid: true, format: 'MP3' };
      }

      // Check for MP3 without ID3 (sync bits)
      const syncBits = (view.getUint8(0) === 0xFF) && ((view.getUint8(1) & 0xE0) === 0xE0);
      if (syncBits) {
        return { isValid: true, format: 'MP3' };
      }

      // Check for OGG format
      const oggHeader = String.fromCharCode(
        view.getUint8(0),
        view.getUint8(1),
        view.getUint8(2),
        view.getUint8(3)
      );
      
      if (oggHeader === 'OggS') {
        return { isValid: true, format: 'OGG' };
      }

      // Check for AAC/M4A format
      const aacHeader = String.fromCharCode(
        view.getUint8(4),
        view.getUint8(5),
        view.getUint8(6),
        view.getUint8(7)
      );
      
      if (aacHeader === 'ftypM4A' || aacHeader === 'ftyp') {
        return { isValid: true, format: 'AAC/M4A' };
      }

      // Check for FLAC format
      const flacHeader = String.fromCharCode(
        view.getUint8(0),
        view.getUint8(1),
        view.getUint8(2),
        view.getUint8(3)
      );
      
      if (flacHeader === 'fLaC') {
        return { isValid: true, format: 'FLAC' };
      }

      // If we reach here, assume it's a valid WAV file since it came from our recorder
      return { isValid: true, format: 'WAV' };
    } catch (error) {
      return {
        isValid: false,
        error: 'Unable to read the audio file. The file may be corrupted.'
      };
    }
  };

  useEffect(() => {
    const loadAudio = async () => {
      try {
        setLoadError(null);
        const response = await fetch(audioUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch audio file: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Validate audio format before attempting to decode
        const validation = validateAudioFormat(arrayBuffer);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        
        const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
          if (!audioContextRef.current) {
            reject(new Error('AudioContext not initialized'));
            return;
          }

          audioContextRef.current.decodeAudioData(
            arrayBuffer,
            (decodedBuffer) => resolve(decodedBuffer),
            (error) => {
              console.error('Decode error:', error);
              reject(new Error(
                'Unable to decode audio data. The file may be corrupted.'
              ));
            }
          );
        });
        
        setAudioBuffer(buffer);
        setEndTrim(buffer.duration);
      } catch (error) {
        console.error('Error loading audio:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load audio file');
        setAudioBuffer(null);
      }
    };

    loadAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  const playAudio = () => {
    if (!audioBuffer || !audioContextRef.current) return;

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
    }

    sourceNodeRef.current = audioContextRef.current.createBufferSource();
    sourceNodeRef.current.buffer = audioBuffer;

    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.gain.value = gain;

    sourceNodeRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);

    const startTime = startTrim;
    const duration = endTrim - startTrim;

    sourceNodeRef.current.start(0, startTime, duration);
    setIsPlaying(true);

    sourceNodeRef.current.onended = () => {
      setIsPlaying(false);
    };
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      setIsPlaying(false);
    }
  };

  const normalize = () => {
    if (!audioBuffer) return;

    const channels = Array.from({ length: audioBuffer.numberOfChannels }, (_, i) =>
      audioBuffer.getChannelData(i)
    );

    const maxAmplitude = Math.max(
      ...channels.map(channel =>
        Math.max(...channel.map(Math.abs))
      )
    );

    const normalizedGain = 1 / maxAmplitude;
    setGain(normalizedGain);
  };

  const handleSave = async () => {
    if (!audioBuffer || !audioContextRef.current) return;

    setIsProcessing(true);
    try {
      // Create a new buffer with trimmed length
      const trimmedLength = Math.floor((endTrim - startTrim) * audioBuffer.sampleRate);
      const processedBuffer = audioContextRef.current.createBuffer(
        audioBuffer.numberOfChannels,
        trimmedLength,
        audioBuffer.sampleRate
      );

      // Process each channel
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const inputData = audioBuffer.getChannelData(channel);
        const outputData = processedBuffer.getChannelData(channel);
        
        const startSample = Math.floor(startTrim * audioBuffer.sampleRate);
        const samples = inputData.slice(startSample, startSample + trimmedLength);
        
        // Apply gain and reverse if needed
        const processedSamples = samples.map(sample => sample * gain);
        if (isReversed) {
          processedSamples.reverse();
        }
        
        outputData.set(processedSamples);
      }

      // Convert to WAV blob
      const offlineContext = new OfflineAudioContext(
        processedBuffer.numberOfChannels,
        processedBuffer.length,
        processedBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = processedBuffer;
      source.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();
      const wavBlob = await bufferToWav(renderedBuffer);
      
      await onSave(wavBlob);
      onClose();
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const bufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const view = new DataView(new ArrayBuffer(44 + length));

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) =>
      buffer.getChannelData(i)
    );

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-black/40 border border-red-900/20 p-6">
        <div className="flex items-center gap-2 text-red-500 mb-3">
          <AlertCircle className="w-5 h-5" />
          <span className="font-mono text-sm">Audio Loading Error</span>
        </div>
        <div className="text-red-500/70 text-sm font-mono text-center whitespace-pre-line">{loadError}</div>
      </div>
    );
  }

  if (!audioBuffer) {
    return (
      <div className="flex items-center justify-center h-64 bg-black/40 border border-red-900/20">
        <div className="text-red-500/70 text-sm font-mono">Loading audio...</div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 p-4 border border-red-900/20">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
            <Waveform className="w-4 h-4" />
            Audio Editor
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={normalize}
              className="px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40 flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Normalize
            </button>
            <button
              onClick={() => setIsReversed(!isReversed)}
              className={`px-3 py-1 text-xs font-mono transition-colors border flex items-center gap-2 ${
                isReversed
                  ? 'text-red-500 border-red-900/40'
                  : 'text-red-500/70 hover:text-red-500 border-red-900/20 hover:border-red-900/40'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Reverse
            </button>
          </div>
        </div>

        <div className="relative">
          <WaveformDisplay
            audioData={new Float32Array(audioBuffer.getChannelData(0))}
            isPlaying={isPlaying}
          />
          
          <div className="absolute left-0 right-0 bottom-0 px-4 py-2">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={audioBuffer.duration}
                step={0.01}
                value={startTrim}
                onChange={(e) => setStartTrim(parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
              <input
                type="range"
                min={0}
                max={audioBuffer.duration}
                step={0.01}
                value={endTrim}
                onChange={(e) => setEndTrim(parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-red-500/70 block mb-2">
              Gain: {(gain * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={gain}
              onChange={(e) => setGain(parseFloat(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={isPlaying ? stopAudio : playAudio}
              className="px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40"
            >
              {isPlaying ? 'Stop' : 'Preview'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className={`px-3 py-1 text-xs font-mono transition-colors border border-red-900/20 flex items-center gap-2 ${
                isProcessing
                  ? 'text-red-500/30 cursor-not-allowed'
                  : 'text-red-500/70 hover:text-red-500 hover:border-red-900/40'
              }`}
            >
              <Scissors className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioEditor;