import React, { useState, useEffect } from 'react';
import { Save, Trash2, Play, Pause, Download, Upload, Plus } from 'lucide-react';
import { getSampleUrl, loadSamples, uploadSample, deleteSample, Sample } from '../lib/samples';

interface SampleManagerProps {
  onSelectSample: (url: string, type: string) => void;
  currentSample: string | null;
  isPlaying: boolean;
  onStop: () => void;
}

const SampleManager: React.FC<SampleManagerProps> = ({
  onSelectSample,
  currentSample,
  isPlaying,
  onStop
}) => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadType, setUploadType] = useState<string>('kick');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadUserSamples();
  }, []);

  const loadUserSamples = async () => {
    try {
      setIsLoading(true);
      const userSamples = await loadSamples();
      setSamples(userSamples);
    } catch (error) {
      console.error('Error loading samples:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteSample(id);
      if (success) {
        setSamples(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting sample:', error);
    }
  };

  const handlePlay = async (sample: Sample) => {
    try {
      if (isPlaying && currentSample === sample.id) {
        onStop();
        return;
      }

      const url = await getSampleUrl(sample.storage_path);
      if (!url) {
        throw new Error('Failed to get sample URL');
      }

      onSelectSample(url, sample.type);
    } catch (error) {
      console.error('Error playing sample:', error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      const storagePath = await uploadSample(file, fileName, uploadType);
      
      if (storagePath) {
        await loadUserSamples();
      }
    } catch (error) {
      console.error('Error uploading sample:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (sample: Sample) => {
    try {
      const url = await getSampleUrl(sample.storage_path);
      if (!url) {
        throw new Error('Failed to get sample URL');
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${sample.name}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading sample:', error);
    }
  };

  return (
    <div className="bg-black/40 p-4 border border-red-900/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
          <Save className="w-4 h-4" />
          Samples
        </h3>

        <div className="flex items-center gap-2">
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
          >
            <option value="kick">Kick</option>
            <option value="snare">Snare</option>
            <option value="hihat">Hi-hat</option>
            <option value="bass">Bass</option>
            <option value="sub">Sub</option>
          </select>
          
          <label className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors border border-red-900/20 hover:border-red-900/40 cursor-pointer">
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Upload'}
            <input
              type="file"
              accept=".wav"
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="text-red-500/50 text-sm font-mono text-center py-4">
            Loading samples...
          </div>
        ) : samples.length === 0 ? (
          <div className="text-red-500/50 text-sm font-mono text-center py-4">
            No samples saved
          </div>
        ) : (
          samples.map(sample => (
            <div
              key={sample.id}
              className={`
                flex items-center justify-between p-2 border transition-colors
                ${currentSample === sample.id && isPlaying
                  ? 'border-red-600/50 bg-red-900/20'
                  : 'border-red-900/20 hover:border-red-900/50'
                }
              `}
            >
              <div className="flex-1">
                <div className="text-sm font-mono text-red-300">{sample.name}</div>
                <div className="text-xs font-mono text-red-500/50">
                  {sample.type} • {new Date(sample.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlay(sample)}
                  className="p-1 text-red-500/50 hover:text-red-500 transition-colors"
                  title={isPlaying && currentSample === sample.id ? "Stop" : "Play"}
                >
                  {isPlaying && currentSample === sample.id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDownload(sample)}
                  className="p-1 text-red-500/50 hover:text-red-500 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(sample.id)}
                  className="p-1 text-red-500/50 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs font-mono text-red-500/30 text-center">
        Upload WAV files to use in the sequencer
      </div>
    </div>
  );
};

export default SampleManager;