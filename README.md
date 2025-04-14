# Echo Delirium

A surreal audio experience that transforms ambient sounds into musical instruments using AI-powered sound processing.

## Architecture

### Unity Frontend
- Built with Unity 2022.3 LTS
- Uses Bolt Visual Scripting for interactive audio processing
- FMOD integration for real-time audio manipulation
- Custom UI for sound capture and instrument control

### Python Backend
- Flask API for audio processing
- Custom PyTorch models for sound transformation:
  - Pareidolia Engine: Converts ambient sounds to musical tones
  - Chaos-to-Music GAN: Transforms noise into structured sounds
  - Style Transfer: Applies musical styles to processed audio

## Setup Instructions

1. Unity Project
   - Open the project in Unity 2022.3 or later
   - Install required packages:
     - Bolt Visual Scripting
     - FMOD for Unity
     - REST Client for Unity

2. Python Backend
   - Install dependencies:
     ```bash
     pip install flask flask-cors numpy scipy torch
     ```
   - Run the server:
     ```bash
     python server/app.py
     ```

## Development

### Unity Development
- All audio processing logic is in Bolt graphs
- UI elements use Unity's new UI Toolkit
- Audio routing handled through FMOD

### Backend Development
- Audio processing models in `server/models/`
- API endpoints in `server/app.py`
- Real-time processing optimizations in progress

## Features

1. Sound Capture
   - Record ambient sounds (3-5 seconds)
   - Real-time audio visualization
   - Multiple recording slots

2. AI Processing
   - Sound-to-instrument conversion
   - Style transfer
   - Chaos/delirium controls

3. Playback
   - Virtual keyboard interface
   - Real-time effect controls
   - Preset system for saving sounds

## Contributing

See CONTRIBUTING.md for development guidelines and setup instructions.