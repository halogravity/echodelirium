import React, { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mm from '@magenta/music';

interface WaveformDisplayProps {
  audioData: Float32Array | null;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  isPlaying?: boolean;
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ 
  audioData, 
  width = 800,
  height = 120,
  color = '#ff1f1f',
  backgroundColor = '#0a0a0a',
  isPlaying = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  const lastWaveformRef = useRef<Float32Array | null>(null);
  const modelRef = useRef<tf.LayersModel | null>(null);
  const musicVAERef = useRef<mm.MusicVAE | null>(null);
  const musicRNNRef = useRef<mm.MusicRNN | null>(null);
  const timeRef = useRef(0);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    const initMagenta = async () => {
      try {
        const vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small');
        await vae.initialize();
        musicVAERef.current = vae;

        const rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
        await rnn.initialize();
        musicRNNRef.current = rnn;

        console.log('Magenta models initialized');
      } catch (error) {
        console.error('Error initializing Magenta:', error);
      }
    };

    initMagenta();

    return () => {
      isUnmountedRef.current = true;
      if (musicVAERef.current) musicVAERef.current.dispose();
      if (musicRNNRef.current) musicRNNRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = width;
      offscreenCanvasRef.current.height = height;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    const offscreenCtx = offscreenCanvasRef.current.getContext('2d', { alpha: false });
    if (!ctx || !offscreenCtx) return;

    ctx.imageSmoothingEnabled = false;
    offscreenCtx.imageSmoothingEnabled = false;

    const processAudioWithMagenta = async (data: Float32Array): Promise<Float32Array> => {
      if (!musicVAERef.current || !musicRNNRef.current) return data;

      try {
        // Convert audio to MIDI-like sequence with enhanced dynamics and proper quantization
        const sequence = {
          notes: data.map((sample, index) => ({
            pitch: Math.floor(sample * 72 + 60),
            startTime: index * 0.05,
            endTime: (index + 1) * 0.05,
            velocity: Math.min(127, Math.floor(Math.abs(sample) * 127 * 1.5))
          })).filter(note => note.pitch >= 0 && note.pitch <= 127),
          totalTime: data.length * 0.05,
          tempos: [{ time: 0, qpm: 120 }],
          quantizationInfo: {
            stepsPerQuarter: 4,
            qpm: 120
          }
        };

        // Process with MusicVAE
        const z = await musicVAERef.current.encode([sequence]);
        const zData = z.arraySync();
        const modifiedZ = tf.tensor(zData.map(val => 
          val * (1 + Math.sin(timeRef.current * 2) * 0.5)
        ));
        const decoded = await musicVAERef.current.decode(modifiedZ);

        // Add RNN-generated continuation with proper quantization
        const continuation = await musicRNNRef.current.continueSequence(
          decoded[0],
          sequence.totalTime,
          1.5,
          sequence.tempos[0].qpm
        );

        // Convert back to audio data with enhanced processing
        const processedData = new Float32Array(data.length);
        const combinedNotes = [...decoded[0].notes, ...continuation.notes];
        
        combinedNotes.forEach(note => {
          const startIndex = Math.floor(note.startTime * 20);
          const endIndex = Math.floor(note.endTime * 20);
          const amplitude = note.velocity / 127;
          
          for (let i = startIndex; i < endIndex && i < data.length; i++) {
            const phase = (i / data.length) * Math.PI * 2;
            const modulation = Math.sin(phase + timeRef.current * 5) * 0.3;
            processedData[i] = ((note.pitch - 60) / 72) * amplitude * (1 + modulation);
          }
        });

        // Clean up tensors
        z.dispose();
        modifiedZ.dispose();

        return processedData;
      } catch (error) {
        console.error('Error processing audio with Magenta:', error);
        return data;
      }
    };

    let lastFrameTime = 0;
    const minFrameInterval = 1000 / 60; // Cap at 60 FPS

    const drawFrame = async (timestamp: number) => {
      if (isUnmountedRef.current || !ctx || !offscreenCtx) return;

      // Throttle frame rate
      const elapsed = timestamp - lastFrameTime;
      if (elapsed < minFrameInterval) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
        return;
      }
      lastFrameTime = timestamp;

      timeRef.current = timestamp * 0.001;

      // Dynamic fade based on audio intensity
      const fadeAmount = isPlaying && audioData ? 
        Math.min(0.3, Math.max(0.1, Math.abs(audioData.reduce((a, b) => a + b, 0) / audioData.length))) : 
        0.1;
      
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`;
      ctx.fillRect(0, 0, width, height);

      const centerY = height / 2;

      if (audioData && isPlaying) {
        try {
          const processedData = await processAudioWithMagenta(audioData);
          const maxAmplitude = Math.max(...processedData.map(Math.abs));
          
          // Draw multiple neural layers with dynamic effects
          for (let layer = 0; layer < 5; layer++) {
            const layerOffset = layer * 20;
            const t = timestamp * 0.001;
            
            ctx.strokeStyle = `rgba(255, ${31 + layer * 20}, ${31 + layer * 20}, ${0.5 - layer * 0.1})`;
            ctx.lineWidth = 3 - layer * 0.5;
            ctx.beginPath();

            const sliceWidth = width / processedData.length;
            processedData.forEach((sample, i) => {
              const x = i * sliceWidth;
              const phase = (i / processedData.length) * Math.PI * 2;
              const modulation = Math.sin(phase * (layer + 1) + t * (2 + layer)) * layerOffset;
              const y = centerY + sample * (height * 0.4) + modulation;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                const tension = 0.3 + maxAmplitude * 0.7;
                const prevX = (i - 1) * sliceWidth;
                const prevY = centerY + processedData[i-1] * (height * 0.4);
                const cpx = prevX + (x - prevX) * tension;
                const cpy = prevY + (y - prevY) * tension;
                ctx.quadraticCurveTo(cpx, cpy, x, y);
              }
            });

            ctx.stroke();
          }

          lastWaveformRef.current = processedData;
        } catch (error) {
          console.error('Error in drawFrame:', error);
        }
      }

      // Enhanced scan line effect
      const scanLineCount = 3;
      for (let i = 0; i < scanLineCount; i++) {
        const offset = i * (Math.PI * 2 / scanLineCount);
        const scanLinePos = (Math.sin(timestamp * 0.002 + offset) * 0.5 + 0.5) * height;
        const gradient = ctx.createLinearGradient(0, scanLinePos - 5, 0, scanLinePos + 5);
        gradient.addColorStop(0, 'rgba(255, 31, 31, 0)');
        gradient.addColorStop(0.5, `rgba(255, 31, 31, ${0.3 + Math.sin(timestamp * 0.001) * 0.2})`);
        gradient.addColorStop(1, 'rgba(255, 31, 31, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, scanLinePos - 5, width, 10);
      }

      if (!isUnmountedRef.current) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame(0);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, width, height, color, backgroundColor, isPlaying]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black/40 p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay" />
        <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay" />
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full bg-[#0a0a0a] rounded-lg"
      />

      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
      <div className="absolute inset-0 pointer-events-none rounded-lg border border-red-900/20" />
    </div>
  );
};

export default WaveformDisplay;