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
  value,
  min,
  max,
  onChange,
  size = 60,
  color = '#ff1f1f',
  label,
  defaultValue = 0,
  disabled = false
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(value);
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const normalize = (value: number) => {
    return ((value - min) / (max - min)) * 270 - 135;
  };

  const updateValue = (clientY: number) => {
    if (!isDragging || disabled) return;

    const sensitivity = 2;
    const range = max - min;
    const deltaY = startY - clientY;
    const valueChange = (deltaY / 100) * range * sensitivity;
    const newValue = Math.min(max, Math.max(min, startValue + valueChange));
    const roundedValue = Math.round(newValue * 100) / 100;
    
    setCurrentValue(roundedValue);
    onChange(roundedValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(currentValue);
    document.body.style.cursor = 'ns-resize';
  };

  const handleMouseMove = (e: MouseEvent) => {
    updateValue(e.clientY);
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
    setStartValue(currentValue);
  };

  const handleTouchMove = (e: TouchEvent) => {
    updateValue(e.touches[0].clientY);
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
  }, [isDragging, startValue, startY]);

  return (
    <div className={`flex flex-col items-center gap-2 ${disabled ? 'opacity-50' : ''}`}>
      <div
        ref={knobRef}
        className={`relative select-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Base ring */}
        <div 
          className={`absolute inset-0 rounded-full bg-black border transition-colors duration-300 ${
            disabled ? 'border-red-900/20' : isDragging ? 'border-red-600' : 'border-red-900/30 hover:border-red-900/50'
          }`}
          style={{ transform: 'rotate(135deg)' }}
        />
        
        {/* Knob body */}
        <div
          className={`absolute inset-1.5 rounded-full bg-zinc-900 border transition-all duration-300 ${
            disabled 
              ? 'border-red-900/20' 
              : isDragging
                ? 'border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]'
                : 'border-red-900/50 hover:border-red-600/50'
          }`}
          style={{
            transform: `rotate(${normalize(currentValue)}deg)`,
            transition: isDragging ? 'none' : 'all 0.2s ease-out'
          }}
        >
          {/* Indicator line */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 w-0.5 h-[40%] rounded-full origin-bottom transition-colors duration-300 ${
              disabled ? 'bg-red-600/30' : isDragging ? 'bg-red-600' : 'bg-red-600/70'
            }`}
          />
        </div>

        {/* Progress arc */}
        <svg
          className="absolute inset-0 -rotate-135"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size / 2) - 3}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray={`${(normalize(currentValue) + 135) * Math.PI * size / 360} ${Math.PI * size}`}
            className={`transition-opacity duration-300 ${
              disabled ? 'opacity-20' : isDragging ? 'opacity-50' : 'opacity-30'
            }`}
          />
        </svg>

        {/* Value tooltip */}
        {!disabled && isDragging && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-900/90 px-1.5 py-0.5 text-[10px] font-mono text-red-200 whitespace-nowrap">
            {currentValue.toFixed(2)}
          </div>
        )}
      </div>

      {/* Label */}
      {label && (
        <span className={`text-[10px] font-mono uppercase tracking-wider transition-colors duration-300 ${
          disabled ? 'text-red-500/30' : isDragging ? 'text-red-500' : 'text-red-500/70'
        }`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default Knob;