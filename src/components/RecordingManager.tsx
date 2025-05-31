import React, { useState, useEffect } from 'react';
import { Save, Trash2, Play, Pause, Download, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { getRecordingUrl } from '../lib/storage';
import { supabase } from '../lib/supabase';
import AudioEditor from './AudioEditor';

interface Recording {
  id: string;
  name: string;
  storage_path: string;
  created_at: string;
}

interface RecordingManagerProps {
  onPlay: (url: string) => void;
  onStop: () => void;
  isPlaying: boolean;
  currentRecording: string | null;
}

const RecordingManager: React.FC<RecordingManagerProps> = ({
  onPlay,
  onStop,
  isPlaying,
  currentRecording
}) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRecording, setEditingRecording] = useState<Recording | null>(null);
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      setIsLoading(true);
      const { data: recordings, error } = await supabase
        .from('recordings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRecordings(recordings || []);
    } catch (error) {
      console.error('Error loading recordings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const recording = recordings.find(r => r.id === id);
      if (!recording) return;

      const { error: storageError } = await supabase.storage
        .from('echobucket')
        .remove([recording.storage_path]);

      if (storageError) {
        throw storageError;
      }

      const { error: dbError } = await supabase
        .from('recordings')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw dbError;
      }

      setRecordings(prev => prev.filter(r => r.id !== id));
      
      if (editingRecording?.id === id) {
        setEditingRecording(null);
        setEditingUrl(null);
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  const handlePlay = async (recording: Recording) => {
    try {
      if (isPlaying && currentRecording === recording.id) {
        onStop();
        return;
      }

      const url = await getRecordingUrl(recording.storage_path);
      if (!url) {
        throw new Error('Failed to get recording URL');
      }

      onPlay(url);
    } catch (error) {
      console.error('Error playing recording:', error);
    }
  };

  const handleEdit = async (recording: Recording) => {
    try {
      if (editingRecording?.id === recording.id) {
        setEditingRecording(null);
        setEditingUrl(null);
        return;
      }

      if (isPlaying) {
        onStop();
      }

      const url = await getRecordingUrl(recording.storage_path);
      if (!url) {
        throw new Error('Failed to get recording URL');
      }

      setEditingRecording(recording);
      setEditingUrl(url);
    } catch (error) {
      console.error('Error preparing recording for edit:', error);
    }
  };

  const handleSaveEdit = async (blob: Blob) => {
    if (!editingRecording) return;

    try {
      const fileName = `${Date.now()}-${editingRecording.name}.wav`;
      const filePath = `recordings/${(await supabase.auth.getUser()).data.user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('echobucket')
        .upload(filePath, blob, {
          contentType: 'audio/wav',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      await supabase.storage
        .from('echobucket')
        .remove([editingRecording.storage_path]);

      const { error: updateError } = await supabase
        .from('recordings')
        .update({ storage_path: filePath })
        .eq('id', editingRecording.id);

      if (updateError) {
        throw updateError;
      }

      await loadRecordings();
      setEditingRecording(null);
      setEditingUrl(null);
    } catch (error) {
      console.error('Error saving edited recording:', error);
    }
  };

  const handleDownload = async (recording: Recording) => {
    try {
      const url = await getRecordingUrl(recording.storage_path);
      if (!url) {
        throw new Error('Failed to get recording URL');
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${recording.name}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading recording:', error);
    }
  };

  return (
    <div className="bg-black/40 p-4 border border-red-900/20">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-red-500/50 hover:text-red-500 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
          <Save className="w-4 h-4" />
          Recordings
        </h3>
      </div>

      {!isCollapsed && (
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-red-500/50 text-sm font-mono text-center py-4">
              Loading recordings...
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-red-500/50 text-sm font-mono text-center py-4">
              No recordings saved
            </div>
          ) : (
            recordings.map(recording => (
              <div key={recording.id} className="space-y-2">
                <div
                  className={`
                    flex items-center justify-between p-2 border transition-colors
                    ${currentRecording === recording.id && isPlaying
                      ? 'border-red-600/50 bg-red-900/20'
                      : 'border-red-900/20 hover:border-red-900/50'
                    }
                  `}
                >
                  <div className="flex-1">
                    <div className="text-sm font-mono text-red-300">{recording.name}</div>
                    <div className="text-xs font-mono text-red-500/50">
                      {new Date(recording.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlay(recording)}
                      className="p-1 text-red-500/50 hover:text-red-500 transition-colors"
                      title={isPlaying && currentRecording === recording.id ? "Stop" : "Play"}
                    >
                      {isPlaying && currentRecording === recording.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(recording)}
                      className={`p-1 transition-colors ${
                        editingRecording?.id === recording.id
                          ? 'text-red-500'
                          : 'text-red-500/50 hover:text-red-500'
                      }`}
                      title={editingRecording?.id === recording.id ? "Close Editor" : "Edit"}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(recording)}
                      className="p-1 text-red-500/50 hover:text-red-500 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(recording.id)}
                      className="p-1 text-red-500/50 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {editingRecording?.id === recording.id && editingUrl && (
                  <div className="pl-4 border-l border-red-900/20">
                    <AudioEditor
                      audioUrl={editingUrl}
                      onSave={handleSaveEdit}
                      onClose={() => {
                        setEditingRecording(null);
                        setEditingUrl(null);
                      }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RecordingManager;