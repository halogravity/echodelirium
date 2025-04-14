from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from scipy.io import wavfile
import io
import torch
import torch.nn as nn
import torch.nn.functional as F

app = Flask(__name__)
CORS(app)

class PareidoliaEngine(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv1d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv1d(32, 64, kernel_size=3, padding=1)
        self.fc1 = nn.Linear(64 * 128, 512)
        self.fc2 = nn.Linear(512, 128 * 44100)  # Output 1 second of audio at 44.1kHz

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = x.view(-1, 64 * 128)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x.view(-1, 1, 44100)

# Initialize model
model = PareidoliaEngine()

@app.route('/process_audio', methods=['POST'])
def process_audio():
    try:
        # Get audio data from request
        audio_data = request.files['audio'].read()
        
        # Convert to numpy array
        audio_buffer = io.BytesIO(audio_data)
        sample_rate, audio_np = wavfile.read(audio_buffer)
        
        # Normalize audio
        audio_np = audio_np.astype(np.float32) / 32768.0
        
        # Process with model (mock processing for now)
        with torch.no_grad():
            audio_tensor = torch.from_numpy(audio_np).view(1, 1, -1)
            processed = model(audio_tensor)
            
        # Apply effects based on parameters
        delirium_intensity = float(request.form.get('delirium', 0.5))
        chaos_level = float(request.form.get('chaos', 0.3))
        
        # Mock effect processing
        processed = processed.numpy() * delirium_intensity
        processed += np.random.normal(0, chaos_level, processed.shape)
        
        return jsonify({
            'status': 'success',
            'processed_audio': processed.tolist(),
            'sample_rate': sample_rate
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)