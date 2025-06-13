import * as tf from '@tensorflow/tfjs';
import * as mm from '@magenta/music';

export class AudioDeepDream {
  private readonly layerSize = 256;
  private model: tf.LayersModel | null = null;
  private musicVAE: mm.MusicVAE | null = null;
  private musicRNN: mm.MusicRNN | null = null;
  private isInitialized = false;
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000;
  private initializationAttempted = false;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      // Create a simple model for audio processing
      const input = tf.input({ shape: [this.layerSize] });
      const dense1 = tf.layers.dense({ units: 128, activation: 'relu' }).apply(input);
      const dense2 = tf.layers.dense({ units: 64, activation: 'relu' }).apply(dense1);
      const output = tf.layers.dense({ units: this.layerSize, activation: 'tanh' }).apply(dense2);

      this.model = tf.model({ inputs: input, outputs: output });
      await this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError'
      });

      // Only attempt Magenta initialization once
      if (!this.initializationAttempted) {
        this.initializationAttempted = true;
        await this.initializeMagenta();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing model:', error);
      this.isInitialized = true; // Still mark as initialized so basic processing works
    }
  }

  private async initializeMagenta(retryCount = 0): Promise<void> {
    try {
      // Check if we're in a development environment and skip if network issues
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn('Skipping Magenta initialization in development environment due to potential network restrictions');
        return;
      }

      // Use smaller models to reduce memory usage and improve reliability
      this.musicVAE = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small');
      this.musicRNN = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');

      // Set a timeout for initialization
      const initPromise = Promise.all([
        this.musicVAE.initialize(),
        this.musicRNN.initialize()
      ]);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Initialization timeout')), 30000);
      });

      await Promise.race([initPromise, timeoutPromise]);
      console.log('Magenta models initialized successfully');
    } catch (error) {
      console.error(`Error initializing Magenta (attempt ${retryCount + 1}/${this.maxRetries}):`, error);
      
      // Clean up failed instances
      if (this.musicVAE) {
        try { this.musicVAE.dispose(); } catch (e) { /* ignore */ }
        this.musicVAE = null;
      }
      if (this.musicRNN) {
        try { this.musicRNN.dispose(); } catch (e) { /* ignore */ }
        this.musicRNN = null;
      }
      
      if (retryCount < this.maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount)));
        await this.initializeMagenta(retryCount + 1);
      } else {
        console.warn('Failed to initialize Magenta after maximum retries - continuing without Magenta features');
      }
    }
  }

  public async processAudio(audioData: Float32Array, intensity: number = 1.0): Promise<Float32Array> {
    if (!this.isInitialized || !this.model || intensity === 0) {
      return audioData;
    }

    try {
      // Ensure we have the right size for processing
      const processSize = Math.min(this.layerSize, audioData.length);
      const inputData = Array.from(audioData.slice(0, processSize));
      
      // Pad with zeros if needed
      while (inputData.length < this.layerSize) {
        inputData.push(0);
      }

      const tensor = tf.tensor2d([inputData]);
      let processed = tensor;

      // Basic audio processing
      processed = this.model.predict(processed) as tf.Tensor;

      // Apply intensity
      processed = processed.mul(tf.scalar(intensity));

      // Convert back to audio data
      const result = await processed.array();
      tensor.dispose();
      processed.dispose();

      // Return the processed data, trimmed to original size
      const processedArray = new Float32Array(audioData.length);
      const resultData = result[0] as number[];
      
      for (let i = 0; i < audioData.length; i++) {
        processedArray[i] = i < resultData.length ? resultData[i] : audioData[i];
      }

      return processedArray;
    } catch (error) {
      console.error('Error processing audio:', error);
      return audioData;
    }
  }

  public dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    if (this.musicVAE) {
      try { this.musicVAE.dispose(); } catch (e) { /* ignore */ }
      this.musicVAE = null;
    }
    if (this.musicRNN) {
      try { this.musicRNN.dispose(); } catch (e) { /* ignore */ }
      this.musicRNN = null;
    }
    this.isInitialized = false;
    this.initializationAttempted = false;
  }

  public isEnabled(): boolean {
    return this.isInitialized;
  }
}