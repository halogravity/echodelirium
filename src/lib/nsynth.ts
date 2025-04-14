import * as tf from '@tensorflow/tfjs';
import * as nsynth from '@magenta/nsynth';

export class NSynthProcessor {
  private model: nsynth.WaveNet | null = null;
  private isInitialized: boolean = false;
  private readonly sampleRate: number = 16000;
  private readonly frameSize: number = 1024;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      // Initialize the WaveNet model
      this.model = new nsynth.WaveNet();
      await this.model.initialize();
      this.isInitialized = true;
      console.log('NSynth model initialized successfully');
    } catch (error) {
      console.error('Error initializing NSynth model:', error);
    }
  }

  public async processAudio(audioData: Float32Array, settings: {
    temperature?: number;
    lengthMultiplier?: number;
  } = {}): Promise<Float32Array | null> {
    if (!this.isInitialized || !this.model) {
      console.warn('NSynth model not initialized');
      return null;
    }

    try {
      // Convert audio to the correct format
      const normalizedData = this.normalizeAudio(audioData);
      
      // Create input tensor
      const inputTensor = tf.tensor2d(normalizedData, [1, normalizedData.length]);

      // Process with WaveNet
      const output = await this.model.synthesize(inputTensor, {
        temperature: settings.temperature || 0.8,
        lengthMultiplier: settings.lengthMultiplier || 1.0
      });

      // Convert back to audio data
      const processedAudio = await this.tensorToAudio(output);
      
      // Clean up tensors
      inputTensor.dispose();
      output.dispose();

      return processedAudio;
    } catch (error) {
      console.error('Error processing audio with NSynth:', error);
      return null;
    }
  }

  private normalizeAudio(audioData: Float32Array): Float32Array {
    // Resample if necessary
    let resampled = audioData;
    if (this.sampleRate !== 16000) {
      resampled = this.resampleAudio(audioData, this.sampleRate, 16000);
    }

    // Normalize amplitude
    const maxAmp = Math.max(...resampled.map(Math.abs));
    return new Float32Array(resampled.map(x => x / (maxAmp || 1)));
  }

  private resampleAudio(audioData: Float32Array, fromSampleRate: number, toSampleRate: number): Float32Array {
    const ratio = fromSampleRate / toSampleRate;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const position = i * ratio;
      const index = Math.floor(position);
      const fraction = position - index;

      if (index + 1 < audioData.length) {
        result[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
      } else {
        result[i] = audioData[index];
      }
    }

    return result;
  }

  private async tensorToAudio(tensor: tf.Tensor): Promise<Float32Array> {
    const data = await tensor.data();
    return new Float32Array(data);
  }

  public isModelReady(): boolean {
    return this.isInitialized;
  }

  public dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isInitialized = false;
    }
  }
}