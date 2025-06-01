import React, { forwardRef } from 'react';
import { Slider } from 'lucide-react';

// Update the interface to include onStepAmountChange
interface PolyTrackProps {
  currentStep: number;
  stepAmount: number;
  onStepAmountChange?: (steps: number) => void;
}

const PolyTrack = forwardRef<HTMLDivElement, PolyTrackProps>(({
  currentStep,
  stepAmount,
  onStepAmountChange
}, ref) => {
  return (
    <div ref={ref} className="w-full bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Poly Track</h3>
        <div className="flex items-center gap-2">
          <Slider className="w-4 h-4 text-white" />
          <input
            type="number"
            min={1}
            max={32}
            value={stepAmount}
            onChange={(e) => onStepAmountChange?.(parseInt(e.target.value))}
            className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: stepAmount }).map((_, index) => (
          <div
            key={index}
            className={`h-12 rounded ${
              currentStep === index
                ? 'bg-purple-500'
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
});

PolyTrack.displayName = 'PolyTrack';

export default PolyTrack;