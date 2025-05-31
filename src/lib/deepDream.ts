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

      await this.initializeMagenta();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing model:', error);
    }
  }

  private async initializeMagenta(retryCount = 0) {
    try {
      // Use smaller models to reduce memory usage
      this.musicVAE = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small');
      this.musicRNN = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');

      await Promise.all([
        this.musicVAE.initialize(),
        this.musicRNN.initialize()
      ]);

      console.log('Magenta models initialized successfully');
    } catch (error) {
      console.error(`Error initializing Magenta (attempt ${retryCount + 1}/${this.maxRetries}):`, error);
      
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        await this.initializeMagenta(retryCount + 1);
      } else {
        console.error('Failed to initialize Magenta after maximum retries');
      }
    }
  }

  public async processAudio(audioData: Float32Array, intensity: number = 1.0): Promise<Float32Array> {
    if (!this.isInitialized || !this.model || intensity === 0) {
      return audioData;
    }

    try {
      const tensor = tf.tensor2d([Array.from(audioData)]);
      let processed = tensor;

      // Basic audio processing
      processed = this.model.predict(processed) as tf.Tensor;

      // Apply intensity
      processed = processed.mul(tf.scalar(intensity));

      // Convert back to audio data
      const result = await processed.array();
      tensor.dispose();
      processed.dispose();

      return new Float32Array(result[0]);
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
      this.musicVAE.dispose();
      this.musicVAE = null;
    }
    if (this.musicRNN) {
      this.musicRNN.dispose();
      this.musicRNN = null;
    }
    this.isInitialized = false;
  }

  public isEnabled(): boolean {
    return this.isInitialized;
  }
}