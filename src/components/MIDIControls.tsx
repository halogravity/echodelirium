import React, { useState, useEffect } from 'react';
import { Piano, Settings } from 'lucide-react';
import { Input } from 'webmidi';

interface MIDIControlsProps {
  inputs: Input[];
  isEnabled: boolean;
  activeInput: Input | null;
  onSelectInput: (input: Input | null) => void;
}

const MIDIControls: React.FC<MIDIControlsProps> = ({ 
  inputs, 
  isEnabled,
  activeInput,
  onSelectInput
}) => {
  const [ccValues, setCCValues] = useState<Map<number, number>>(new Map());
  const [lastActivity, setLastActivity] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    let handleCC: ((e: any) => void) | undefined;
    
    if (activeInput) {
      handleCC = (e: any) => {
        if (mounted) {
          setCCValues(prev => new Map(prev).set(e.controller.number, e.value));
          setLastActivity(Date.now());
        }
      };

      try {
        activeInput.addListener('controlchange', handleCC);
      } catch (error) {
        console.warn('Failed to add MIDI listener:', error);
      }
    }

    return () => {
      mounted = false;
      if (activeInput && handleCC) {
        try {
          activeInput.removeListener('controlchange', handleCC);
        } catch (error) {
          console.warn('Failed to remove MIDI listener:', error);
        }
      }
    };
  }, [activeInput]);

  // CC mappings for display
  const ccMappings = {
    1: 'Modulation',
    7: 'Volume',
    71: 'Resonance',
    74: 'Cutoff',
    91: 'Reverb',
    93: 'Chorus',
    16: 'Pareidolia',
    17: 'Chaos',
    18: 'Dream Depth'
  };

  return (
    <div className="bg-black/40 p-4 border-l border-red-900/20">
      <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider flex items-center gap-2 mb-4">
        <Piano className="w-4 h-4" />
        MIDI Control
      </h3>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-red-500 animate-pulse' : 'bg-red-900'}`} />
          <span className="text-red-500/70 text-xs font-mono">
            {isEnabled ? 'MIDI ACTIVE' : 'MIDI INACTIVE'}
          </span>
        </div>

        {inputs.length > 0 ? (
          <div className="space-y-2">
            <div className="text-red-500/50 text-xs font-mono mb-2">Available MIDI Devices:</div>
            {inputs.map((input, index) => (
              <button 
                key={input.id || index}
                onClick={() => onSelectInput(input === activeInput ? null : input)}
                className={`
                  w-full flex items-center gap-2 text-xs font-mono p-2 border transition-colors
                  ${input === activeInput 
                    ? 'border-red-600/50 bg-red-900/20 text-red-300' 
                    : 'border-red-900/20 bg-black/20 text-red-300/70 hover:border-red-900/50'
                  }
                `}
              >
                <Settings className={`w-3 h-3 ${input === activeInput ? 'text-red-500' : 'text-red-500/50'}`} />
                <span>{input.name || 'Unknown Device'}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-red-500/50 text-xs font-mono">
            No MIDI devices detected
          </div>
        )}

        {activeInput && ccValues.size > 0 && (
          <div className="mt-6 space-y-2">
            <div className="text-red-500/50 text-xs font-mono mb-2 flex items-center gap-2">
              <Settings className="w-3 h-3" />
              CC Activity:
            </div>
            <div className="space-y-1">
              {Array.from(ccValues.entries()).map(([cc, value]) => (
                <div 
                  key={cc}
                  className={`text-xs font-mono transition-opacity duration-300 ${
                    Date.now() - (lastActivity || 0) < 1000 ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className="flex justify-between text-red-500/70 mb-1">
                    <span>{ccMappings[cc as keyof typeof ccMappings] || `CC ${cc}`}</span>
                    <span>{Math.round(value * 127)}</span>
                  </div>
                  <div className="h-1 bg-red-900/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500/50 transition-all duration-100"
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-red-500/30 text-xs font-mono mt-4">
          {inputs.length > 0 
            ? 'Click a device to activate/deactivate'
            : 'Connect a MIDI device to control the synthesizer'
          }
        </div>
      </div>
    </div>
  );
};

export default MIDIControls;