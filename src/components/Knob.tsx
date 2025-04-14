import React, { useState, useEffect, useRef } from 'react';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  size?: number;
  color?: string;
  label?: string | React.ReactNode;
  defaultValue?: number;
  disabled?: boolean;
}

const Knob: React.FC<KnobProps> = ({
  value = 0,
  min,
  max,
  onChange,
  size = 80,
  color = '#ff0000',
  label,
  defaultValue = 0,
  disabled = false
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(defaultValue);
  const [currentRotation, setCurrentRotation] = useState(0);

  const normalize = (value: number) => {
    return ((value - min) / (max - min)) * 270 - 135;
  };

  const denormalize = (degree: number) => {
    const normalized = (degree + 135) / 270;
    return min + (max - min) * normalized;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
    document.body.style.cursor = 'ns-resize';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled || typeof onChange !== 'function') return;

    const deltaY = startY - e.clientY;
    const sensitivity = 200;
    const deltaValue = (deltaY / sensitivity) * (max - min);
    const newValue = Math.min(max, Math.max(min, startValue + deltaValue));
    
    onChange(Math.round(newValue * 100) / 100);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartValue(value);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || disabled || typeof onChange !== 'function') return;

    const deltaY = startY - e.touches[0].clientY;
    const sensitivity = 200;
    const deltaValue = (deltaY / sensitivity) * (max - min);
    const newValue = Math.min(max, Math.max(min, startValue + deltaValue));
    
    onChange(Math.round(newValue * 100) / 100);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, startY, startValue]);

  useEffect(() => {
    setCurrentRotation(normalize(value));
  }, [value]);

  const displayValue = typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : '0.00';

  return (
    <div className={`flex flex-col items-center gap-3 ${disabled ? 'opacity-50' : ''}`}>
      <div
        ref={knobRef}
        className={`relative select-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div 
          className={`absolute inset-0 rounded-full bg-black border transition-colors duration-300 ${
            disabled ? 'border-red-900/20' : isDragging ? 'border-red-600' : 'border-red-900/30 hover:border-red-900/50'
          }`}
          style={{ transform: 'rotate(135deg)' }}
        />
        
        <div
          className={`absolute inset-2 rounded-full bg-zinc-900 border transition-all duration-300 ${
            disabled 
              ? 'border-red-900/20' 
              : isDragging
                ? 'border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]'
                : 'border-red-900/50 hover:border-red-600/50'
          }`}
          style={{
            transform: `rotate(${currentRotation}deg)`,
            transition: isDragging ? 'none' : 'all 0.2s ease-out'
          }}
        >
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 w-0.5 h-[40%] rounded-full origin-bottom transition-colors duration-300 ${
              disabled ? 'bg-red-600/30' : isDragging ? 'bg-red-600' : 'bg-red-600/70'
            }`}
          />
        </div>

        <svg
          className="absolute inset-0 -rotate-135"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size / 2) - 4}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={`${(normalize(value) + 135) * Math.PI * size / 360} ${Math.PI * size}`}
            className={`transition-opacity duration-300 ${
              disabled ? 'opacity-20' : isDragging ? 'opacity-50' : 'opacity-30'
            }`}
          />
        </svg>

        {!disabled && isDragging && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-900/90 px-2 py-1 text-xs font-mono text-red-200">
            {displayValue}
          </div>
        )}
      </div>
      {label && (
        <span className={`text-xs font-mono uppercase tracking-wider transition-colors duration-300 ${
          disabled ? 'text-red-500/30' : isDragging ? 'text-red-500' : 'text-red-500/70'
        }`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default Knob;