import React, { useState, useEffect } from 'react';
import { Save, Trash2, Download, Upload, Plus, Check, X, Settings2 } from 'lucide-react';
import type { Preset } from '../lib/presets';
import { savePreset, loadPresets, deletePreset, updatePreset } from '../lib/presets';

interface PresetManagerProps {
  currentParameters: Preset['parameters'];
  onLoadPreset: (parameters: Preset['parameters']) => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({
  currentParameters,
  onLoadPreset
}) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserPresets();
  }, []);

  const loadUserPresets = async () => {
    setIsLoading(true);
    const userPresets = await loadPresets();
    setPresets(userPresets);
    setIsLoading(false);
  };

  const handleSaveNewPreset = async () => {
    if (!newPresetName.trim()) return;

    const savedPreset = await savePreset(newPresetName, currentParameters);
    if (savedPreset) {
      setPresets(prev => [savedPreset, ...prev]);
      setIsCreating(false);
      setNewPresetName('');
    }
  };

  const handleDeletePreset = async (id: string) => {
    const success = await deletePreset(id);
    if (success) {
      setPresets(prev => prev.filter(p => p.id !== id));
      if (selectedPreset === id) {
        setSelectedPreset(null);
      }
    }
  };

  const handleUpdatePreset = async (id: string) => {
    const updatedPreset = await updatePreset(id, currentParameters);
    if (updatedPreset) {
      setPresets(prev => prev.map(p => p.id === id ? updatedPreset : p));
    }
  };

  return (
    <div className="bg-black/40 p-4 border border-red-900/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          Presets
        </h3>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Preset
        </button>
      </div>

      {isCreating && (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Preset name..."
            className="flex-1 bg-black/30 text-red-200 px-2 py-1 text-sm font-mono border border-red-900/30 focus:outline-none focus:border-red-500/50"
          />
          <button
            onClick={handleSaveNewPreset}
            className="p-1 text-red-500/70 hover:text-red-500 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsCreating(false);
              setNewPresetName('');
            }}
            className="p-1 text-red-500/70 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-2">
        {isLoading ? (
          <div className="text-red-500/50 text-sm font-mono text-center py-4">
            Loading presets...
          </div>
        ) : presets.length === 0 ? (
          <div className="text-red-500/50 text-sm font-mono text-center py-4">
            No presets saved
          </div>
        ) : (
          presets.map(preset => (
            <div
              key={preset.id}
              className={`
                flex items-center justify-between p-2 border transition-colors
                ${selectedPreset === preset.id
                  ? 'border-red-600/50 bg-red-900/20'
                  : 'border-red-900/20 hover:border-red-900/50'
                }
              `}
            >
              <button
                onClick={() => {
                  setSelectedPreset(preset.id);
                  onLoadPreset(preset.parameters);
                }}
                className="flex-1 text-left"
              >
                <div className="text-sm font-mono text-red-300">{preset.name}</div>
                <div className="text-xs font-mono text-red-500/50">
                  {new Date(preset.created_at).toLocaleDateString()}
                </div>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdatePreset(preset.id)}
                  className="p-1 text-red-500/50 hover:text-red-500 transition-colors"
                  title="Update preset"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePreset(preset.id)}
                  className="p-1 text-red-500/50 hover:text-red-500 transition-colors"
                  title="Delete preset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {presets.length > 0 && (
        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-red-900/20">
          <button
            onClick={() => {
              const preset = presets.find(p => p.id === selectedPreset);
              if (preset) {
                const json = JSON.stringify(preset.parameters, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${preset.name}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }
            }}
            className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors"
            disabled={!selectedPreset}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <label className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    try {
                      const parameters = JSON.parse(event.target?.result as string);
                      const name = file.name.replace('.json', '');
                      const savedPreset = await savePreset(name, parameters);
                      if (savedPreset) {
                        setPresets(prev => [savedPreset, ...prev]);
                      }
                    } catch (error) {
                      console.error('Error importing preset:', error);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default PresetManager;