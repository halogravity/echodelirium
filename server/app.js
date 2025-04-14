import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import * as tf from '@tensorflow/tfjs';
import * as mm from '@magenta/music';
import dotenv from 'dotenv';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Magenta models
let musicRNN = null;
let musicVAE = null;

async function initializeMagenta() {
  try {
    if (process.env.GOOGLE_API_KEY) {
      mm.setGoogleApiKey(process.env.GOOGLE_API_KEY);
    }

    // Initialize MusicRNN for melody continuation
    musicRNN = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
    await musicRNN.initialize();

    // Initialize MusicVAE for timbre transfer
    musicVAE = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2');
    await musicVAE.initialize();

    console.log('Magenta models initialized successfully');
  } catch (error) {
    console.error('Error initializing Magenta:', error);
  }
}

initializeMagenta();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'audio/*', limit: '50mb' }));

async function processAudioWithMagenta(audioData, params) {
  try {
    if (!musicRNN || !musicVAE) {
      throw new Error('Magenta models not initialized');
    }

    // Convert audio data to MIDI-like sequence
    const sequence = {
      notes: audioData.map((sample, index) => ({
        pitch: Math.floor(sample * 60 + 60),
        startTime: index * 0.1,
        endTime: (index + 1) * 0.1,
        velocity: 80
      })).filter(note => note.pitch >= 0 && note.pitch <= 127),
      totalTime: audioData.length * 0.1
    };

    // Apply timbre transfer based on hallucination intensity
    const z = await musicVAE.encode([sequence]);
    const hallucinatedZ = z.arraySync().map(val => 
      val * (1 + params.delirium * 2)
    );
    const hallucinatedSequence = await musicVAE.decode(tf.tensor(hallucinatedZ));

    // Generate continuation with increased temperature
    const continuation = await musicRNN.continueSequence(
      hallucinatedSequence[0],
      sequence.totalTime,
      params.temperature || 1.5
    );

    // Apply echo effect
    const echoedNotes = [];
    continuation.notes.forEach(note => {
      echoedNotes.push(note);
      if (params.echoIntensity > 0) {
        const echoCount = Math.floor(params.echoLength * 3) + 1;
        for (let i = 1; i <= echoCount; i++) {
          echoedNotes.push({
            ...note,
            startTime: note.startTime + (i * 0.25),
            endTime: note.endTime + (i * 0.25),
            velocity: note.velocity * Math.pow(0.7, i)
          });
        }
      }
    });

    // Apply chaos and blend effects
    const processedNotes = echoedNotes.map(note => {
      const chaosAmount = params.chaos || 0.3;
      const noise = (Math.random() - 0.5) * chaosAmount;
      return {
        ...note,
        pitch: Math.max(0, Math.min(127, note.pitch + Math.floor(noise * 12))),
        velocity: Math.max(0, Math.min(127, note.velocity + Math.floor(noise * 20)))
      };
    });

    // Convert back to audio samples
    return processedNotes.map(note => (note.pitch - 60) / 60);
  } catch (error) {
    console.error('Error processing with Magenta:', error);
    return audioData;
  }
}

async function applyDeepDream(audioData, iterations = 1) {
  try {
    let processed = audioData;
    const batchSize = 128;

    for (let i = 0; i < iterations; i++) {
      // Process audio in batches to avoid memory issues
      for (let j = 0; j < processed.length; j += batchSize) {
        const batch = processed.slice(j, j + batchSize);
        
        // Convert to tensor
        const tensor = tf.tensor(batch);
        
        // Apply deep dream-like transformations
        const dreamed = tf.tidy(() => {
          // Create multiple frequency bands
          const bands = tf.split(tensor, 4);
          
          // Apply non-linear transformations to each band
          const processed = bands.map(band => {
            const amplified = band.mul(1.2);
            const shifted = amplified.add(0.1);
            return tf.tanh(shifted);
          });
          
          // Recombine bands with added harmonics
          return tf.concat(processed).mul(0.8);
        });
        
        // Update the processed audio
        const dreamedData = await dreamed.array();
        processed.set(dreamedData, j);
        
        // Cleanup
        tensor.dispose();
        dreamed.dispose();
      }
    }

    return processed;
  } catch (error) {
    console.error('Error in DeepDream:', error);
    return audioData;
  }
}

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Echo Delirium API is running',
    magentaStatus: {
      musicRNN: musicRNN ? 'initialized' : 'not initialized',
      musicVAE: musicVAE ? 'initialized' : 'not initialized'
    }
  });
});

app.post('/process_audio', async (req, res) => {
  try {
    const { audio, delirium, chaos, echoIntensity, echoLength, deepDream } = req.body;
    
    if (!Array.isArray(audio)) {
      throw new Error('Invalid audio data format');
    }

    let processedAudio = await processAudioWithMagenta(audio, {
      delirium: delirium || 0.5,
      chaos: chaos || 0.3,
      temperature: 1.5 + (delirium || 0.5),
      echoIntensity: echoIntensity || 0,
      echoLength: echoLength || 0
    });

    if (deepDream) {
      processedAudio = await applyDeepDream(processedAudio);
    }

    res.json({
      status: 'success',
      processed_audio: processedAudio
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.post('/deep_dream', async (req, res) => {
  try {
    const { audio, iterations } = req.body;
    
    if (!Array.isArray(audio)) {
      throw new Error('Invalid audio data format');
    }

    const processedAudio = await applyDeepDream(audio, iterations);

    res.json({
      status: 'success',
      processed_audio: processedAudio
    });
  } catch (error) {
    console.error('Error in DeepDream:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});