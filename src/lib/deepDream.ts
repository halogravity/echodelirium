import * as tf from '@tensorflow/tfjs';
import * as mm from '@magenta/music';
import ndarray from 'ndarray';
import resample from 'ndarray-resample';

export class AudioDeepDream {
  private readonly layerSize = 256;
  private model: tf.LayersModel | null = null;
  private musicVAE: mm.MusicVAE | null = null;
  private musicRNN: mm.MusicRNN | null = null;
  private dreamDepth: number = 3;
  private readonly sampleRate = 44100;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;
  private isInitialized = false;

  constructor() {
    this.initializeModel();
    this.initializeMagenta();
  }

  private async initializeMagenta() {
    let retryCount = 0;
    while (retryCount < this.maxRetries) {
      try {
        // Updated model URLs to use the correct checkpoint paths
        this.musicVAE = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_16bar_small_q2');
        await this.musicVAE.initialize();

        this.musicRNN = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn');
        await this.musicRNN.initialize();

        console.log('Magenta models initialized successfully');
        this.isInitialized = true;
        break;
      } catch (error) {
        console.error(`Error initializing Magenta (attempt ${retryCount + 1}/${this.maxRetries}):`, error);
        retryCount++;
        if (retryCount < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount)));
        }
      }
    }

    if (!this.isInitialized) {
      console.error('Failed to initialize Magenta models after maximum retries');
    }
  }

  private async initializeModel() {
    const input = tf.input({ shape: [this.layerSize] });
    const encoded = this.buildEncoderBlock(input, [192, 128, 64]);
    const paths = this.buildParallelPaths(encoded);
    const decoded = this.buildDecoderBlock(paths);
    const output = tf.layers.dense({
      units: this.layerSize,
      activation: 'tanh',
      kernelInitializer: 'glorotNormal'
    }).apply(decoded);

    this.model = tf.model({ inputs: input, outputs: output });
    await this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });
  }

  private buildEncoderBlock(input: tf.SymbolicTensor, units: number[]): tf.SymbolicTensor {
    let x = input;
    
    for (const size of units) {
      const mainPath = tf.layers.dense({
        units: size,
        activation: 'relu',
        kernelInitializer: 'glorotNormal'
      }).apply(x);

      const normPath = tf.layers.batchNormalization().apply(mainPath);
      
      if (x.shape[1] === size) {
        x = tf.layers.add().apply([normPath, x]);
      } else {
        x = normPath;
      }
    }

    return x;
  }

  private buildParallelPaths(input: tf.SymbolicTensor): tf.SymbolicTensor {
    const spectralPath = tf.layers.dense({
      units: 32,
      activation: 'relu'
    }).apply(input);

    const temporalPath = tf.layers.dense({
      units: 32,
      activation: 'sigmoid'
    }).apply(input);

    const harmonicPath = tf.layers.dense({
      units: 32,
      activation: 'tanh'
    }).apply(input);

    return this.applyAttention([spectralPath, temporalPath, harmonicPath]);
  }

  private applyAttention(tensors: tf.SymbolicTensor[]): tf.SymbolicTensor {
    const units = tensors[0].shape[1] as number;
    
    const attention = tf.layers.dense({
      units: units,
      activation: 'softmax'
    }).apply(tensors[0]);

    const weighted = tensors.map(tensor => {
      const reshapedTensor = tf.layers.reshape({ targetShape: [-1, units] }).apply(tensor);
      return tf.layers.multiply().apply([reshapedTensor, attention]);
    });

    return tf.layers.concatenate().apply(weighted);
  }

  private buildDecoderBlock(input: tf.SymbolicTensor): tf.SymbolicTensor {
    const sizes = [64, 128, 192, 256];
    let x = input;

    for (const size of sizes) {
      const dense = tf.layers.dense({
        units: size,
        activation: 'relu'
      }).apply(x);

      const attention = this.buildAttentionLayer(dense, size);

      x = tf.layers.add().apply([dense, attention]);
      x = tf.layers.batchNormalization().apply(x);
    }

    return x;
  }

  private buildAttentionLayer(input: tf.SymbolicTensor, units: number): tf.SymbolicTensor {
    const reshapedInput = tf.layers.reshape({ targetShape: [1, units] }).apply(input);
    
    const query = tf.layers.dense({ 
      units: units,
      kernelInitializer: 'glorotNormal',
      inputShape: [1, units]
    }).apply(reshapedInput);
    
    const key = tf.layers.dense({ 
      units: units,
      kernelInitializer: 'glorotNormal',
      inputShape: [1, units]
    }).apply(reshapedInput);
    
    const value = tf.layers.dense({ 
      units: units,
      kernelInitializer: 'glorotNormal',
      inputShape: [1, units]
    }).apply(reshapedInput);

    const scores = tf.layers.dot({ 
      axes: [2, 2],
      normalize: true
    }).apply([query, key]);
    
    const attention = tf.layers.activation({ activation: 'softmax' }).apply(scores);
    
    const weighted = tf.layers.dot({ 
      axes: [2, 1]
    }).apply([attention, value]);

    return tf.layers.reshape({ targetShape: [units] }).apply(weighted);
  }

  public setDreamDepth(depth: number) {
    this.dreamDepth = Math.floor(depth);
  }

  public async processAudio(audioData: Float32Array, intensity: number = 1.0): Promise<Float32Array> {
    if (!this.isInitialized || !this.model || !this.musicVAE || !this.musicRNN || intensity === 0) {
      console.warn('Deep Dream processing is unavailable, returning original audio');
      return audioData;
    }

    try {
      const windowSize = this.layerSize;
      const hopSize = windowSize / 2;
      const processedData = new Float32Array(audioData.length);
      
      for (let i = 0; i < audioData.length - windowSize; i += hopSize) {
        const window = audioData.slice(i, i + windowSize);
        const tensor = tf.tensor2d([Array.from(window)]);
        
        let dreamTensor = tensor;
        for (let j = 0; j < this.dreamDepth; j++) {
          const sequence = this.convertToNoteSequence(dreamTensor);
          
          if (!sequence) {
            console.warn('Invalid sequence generated, skipping iteration');
            continue;
          }

          const z = await this.musicVAE!.encode([sequence]);
          const transformed = await this.applyMusicalTransformations(z, intensity);
          const hallucinatedSequence = await this.musicVAE!.decode(transformed);
          
          const audioTensor = tf.tidy(() => this.convertToAudioTensor(hallucinatedSequence[0]));
          
          dreamTensor = await this.applySpectralProcessing(audioTensor, intensity, j);
          
          audioTensor.dispose();
          z.dispose();
          transformed.dispose();
        }

        const processedWindow = await dreamTensor.array();
        this.applyOverlapAdd(processedData, processedWindow[0], i, hopSize);

        tensor.dispose();
        dreamTensor.dispose();
      }

      return this.normalizeOutput(processedData, intensity);
    } catch (error) {
      console.error('Error in deep dream processing:', error);
      return audioData;
    }
  }

  private convertToNoteSequence(tensor: tf.Tensor): mm.INoteSequence | null {
    try {
      const data = tensor.dataSync();
      const notes = Array.from(data)
        .map((value, index) => ({
          pitch: Math.floor(value * 60 + 60),
          startTime: index * 0.1,
          endTime: (index + 1) * 0.1,
          velocity: 80
        }))
        .filter(note => note.pitch >= 0 && note.pitch <= 127);

      if (notes.length === 0) {
        return null;
      }

      return {
        notes,
        totalTime: data.length * 0.1,
        tempos: [{ time: 0, qpm: 120 }],
        timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
        quantizationInfo: {
          stepsPerQuarter: 4,
          qpm: 120
        }
      };
    } catch (error) {
      console.error('Error converting to note sequence:', error);
      return null;
    }
  }

  private async applyMusicalTransformations(z: tf.Tensor, intensity: number): Promise<tf.Tensor> {
    return tf.tidy(() => {
      const zData = z.arraySync();
      const transformed = zData.map(val => {
        const phase = Math.sin(val * Math.PI * 2) * intensity;
        return val * (1 + phase);
      });
      return tf.tensor(transformed);
    });
  }

  private convertToAudioTensor(sequence: mm.INoteSequence): tf.Tensor {
    const audioData = new Float32Array(this.layerSize);
    sequence.notes.forEach(note => {
      const startSample = Math.floor(note.startTime * this.sampleRate);
      const endSample = Math.min(Math.floor(note.endTime * this.sampleRate), this.layerSize);
      const frequency = mm.midiToHz(note.pitch);
      
      for (let i = startSample; i < endSample; i++) {
        const t = i / this.sampleRate;
        audioData[i] += Math.sin(2 * Math.PI * frequency * t) * (note.velocity / 127);
      }
    });
    
    return tf.tensor2d([Array.from(audioData)]);
  }

  private async applySpectralProcessing(tensor: tf.Tensor, intensity: number, iteration: number): Promise<tf.Tensor> {
    const spec = tf.spectral.rfft(tensor.reshape([this.layerSize]));
    const phase = spec.angle();
    const mag = spec.abs();
    
    const harmonicEnhancement = tf.scalar(1 + Math.sin(iteration * Math.PI / this.dreamDepth) * 0.3);
    const enhancedMag = mag.mul(harmonicEnhancement).pow(1.2);
    
    const phaseModulation = phase.mul(tf.scalar(1 + intensity * 0.2));
    const result = tf.spectral.irfft(
      tf.complex(enhancedMag.mul(tf.cos(phaseModulation)), enhancedMag.mul(tf.sin(phaseModulation)))
    ).reshape([1, this.layerSize]);

    spec.dispose();
    phase.dispose();
    mag.dispose();
    harmonicEnhancement.dispose();
    enhancedMag.dispose();
    phaseModulation.dispose();

    return result;
  }

  private applyOverlapAdd(output: Float32Array, window: Float32Array, position: number, hopSize: number) {
    for (let i = 0; i < window.length; i++) {
      if (position + i < output.length) {
        const weight = i < hopSize 
          ? 0.5 * (1 - Math.cos((Math.PI * i) / hopSize))
          : i > window.length - hopSize 
            ? 0.5 * (1 - Math.cos((Math.PI * (window.length - i)) / hopSize))
            : 1;
        output[position + i] += window[i] * weight;
      }
    }
  }

  private normalizeOutput(data: Float32Array, intensity: number): Float32Array {
    const maxAmp = Math.max(...data.map(Math.abs));
    const normalizedData = new Float32Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      const normalized = data[i] / (maxAmp || 1);
      const saturation = 1 + intensity * 0.5;
      normalizedData[i] = Math.tanh(normalized * saturation) * 0.9;
    }
    
    return normalizedData;
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
  }

  public isEnabled(): boolean {
    return this.isInitialized;
  }
}