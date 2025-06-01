import React, { useState, forwardRef } from 'react';
import { Music, Clock, ChevronDown, ChevronRight } from 'lucide-react';

interface PolyTrackProps {
  currentStep: number;
  stepAmount: number;
  bpm: number;
  onStepAmountChange?: (steps: number) => void;
  onBpmChange?: (bpm: number) => void;
}

export interface PolyTrackRef {
  getCurrentNotes: () => string[];
  stopCurrentNotes: () => void;
  playStep: (step: number, time?: number) => void;
  stop: () => void;
}

const STEP_OPTIONS = [4, 8, 16, 32, 64] as const;
type StepAmount = typeof STEP_OPTIONS[number];

const PolyTrack = forwardRef<PolyTrackRef, PolyTrackProps>(({
  currentStep,
  stepAmount,
  bpm,
  onStepAmountChange,
  onBpmChange
}, ref) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localStepAmount, setLocalStepAmount] = useState<StepAmount>(stepAmount as StepAmount);

  const handleStepAmountChange = (steps: number) => {
    setLocalStepAmount(steps as StepAmount);
    if (onStepAmountChange) {
      onStepAmountChange(steps);
    }
  };

  return (
    <div className="bg-black/40 p-4 border border-red-900/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
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
            <Music className="w-4 h-4" />
            Poly Track
          </h3>
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500/70" />
              <input
                type="number"
                value={bpm}
                onChange={(e) => onBpmChange?.(parseInt(e.target.value))}
                className="w-16 bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-sm font-mono"
                min="20"
                max="300"
              />
              <span className="text-red-500/70 text-xs font-mono">BPM</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-red-500/70 text-xs font-mono">Steps:</span>
              <select
                value={localStepAmount}
                onChange={(e) => handleStepAmountChange(parseInt(e.target.value))}
                className="bg-black/30 border border-red-900/30 text-red-200 px-2 py-1 text-xs font-mono"
              >
                {STEP_OPTIONS.map(amount => (
                  <option key={amount} value={amount}>{amount}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: stepAmount }).map((_, index) => (
            <div
              key={index}
              className={`h-12 rounded ${
                currentStep === index
                  ? 'bg-red-900/40 border-red-600/50'
                  : 'bg-black/30 border-red-900/20'
              } border`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

PolyTrack.displayName = 'PolyTrack';

export default PolyTrack;