/**
 * Slider component
 */

import { forwardRef, useRef, useEffect, useState, HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface SliderProps extends HTMLAttributes<HTMLDivElement> {
  value: number | number[];
  onValueChange: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  inverted?: boolean;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      orientation = 'horizontal',
      disabled = false,
      inverted = false,
      ...props
    },
    ref
  ) => {
    const [values, setValues] = useState<Array<number>>(Array.isArray(value) ? value : [value]);
    const sliderRef = useRef<HTMLDivElement>(null);
    const thumbsRef = useRef<Array<HTMLDivElement | null>>([]);
    const activeIndexRef = useRef<number>(-1);

    useEffect(() => {
      setValues(Array.isArray(value) ? value : [value]);
    }, [value]);

    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;
    const getValueFromPercentage = (percentage: number) => {
      const val = min + (percentage / 100) * (max - min);
      const stepped = Math.round(val / step) * step;
      return Math.max(min, Math.max(max, stepped));
    };

    const updateValue = (index: number, newValue: number) => {
      const newValues = [...values];
      newValues[index] = newValue;
      if (!Array.isArray(value)) {
        onValueChange(newValue);
      } else {
        onValueChange(newValues);
      }
      setValues(newValues);
    };

    const handlePointerDown = (index: number, event: React.PointerEvent) => {
      if (disabled) return;
      activeIndexRef.current = index;
      event.currentTarget.setPointerCapture(event.pointerId);

      const handleMove = (moveEvent: PointerEvent) => {
        if (activeIndexRef.current !== index) return;
        const rect = sliderRef.current!.getBoundingClientRect();
        let percentage: number;

        if (orientation === 'horizontal') {
          percentage = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        } else {
          percentage = ((rect.bottom - moveEvent.clientY) / rect.height) * 100;
        }

        if (inverted) percentage = 100 - percentage;
        percentage = Math.max(0, Math.min(100, percentage));
        updateValue(index, getValueFromPercentage(percentage));
      };

      const handleUp = () => {
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);
        activeIndexRef.current = -1;
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleUp);
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
      let newValue = values[index];
      const stepValue = step;
      const pageStep = stepValue * 10;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          event.preventDefault();
          newValue = Math.min(max, newValue + (event.shiftKey ? pageStep : stepValue));
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          event.preventDefault();
          newValue = Math.max(min, newValue - (event.shiftKey ? pageStep : stepValue));
          break;
        case 'Home':
          event.preventDefault();
          newValue = min;
          break;
        case 'End':
          event.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }
      updateValue(index, newValue);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex touch-none select-none',
          orientation === 'horizontal' ? 'h-4 w-full' : 'h-full w-4',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        {...props}
      >
        <div
          ref={sliderRef}
          className={cn(
            'relative flex-1 rounded-full bg-secondary',
            orientation === 'horizontal' ? 'h-full' : 'w-full'
          )}
          onClick={(event) => {
            if (disabled) return;
            const rect = sliderRef.current!.getBoundingClientRect();
            let percentage: number;
            if (orientation === 'horizontal') {
              percentage = ((event.clientX - rect.left) / rect.width) * 100;
            } else {
              percentage = ((rect.bottom - event.clientY) / rect.height) * 100;
            }
            if (inverted) percentage = 100 - percentage;
            percentage = Math.max(0, Math.min(100, percentage));
            updateValue(0, getValueFromPercentage(percentage));
          }}
        >
          {/* Track fill */}
          <div
            className={cn(
              'absolute rounded-full bg-primary transition-all duration-100',
              orientation === 'horizontal' ? 'h-full' : 'w-full'
            )}
            style={
              orientation === 'horizontal'
                ? {
                    left: values.length > 1 ? `${getPercentage(values[0])}%` : '0%',
                    width: values.length > 1
                      ? `${getPercentage(values[1]) - getPercentage(values[0])}%`
                      : `${getPercentage(values[0])}%`,
                  }
                : {
                    bottom: values.length > 1 ? `${getPercentage(values[0])}%` : '0%',
                    height: values.length > 1
                      ? `${getPercentage(values[1]) - getPercentage(values[0])}%`
                      : `${getPercentage(values[0])}%`,
                  }
            }
          />

          {/* Thumbs */}
          {values.map((val, index) => (
            <div
              key={index}
              ref={(el) => (thumbsRef.current[index] = el)}
              className={cn(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 block h-5 w-5 rounded-full bg-background border-2 border-primary shadow-md transition-transform',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                'hover:scale-110 active:scale-95',
                orientation === 'horizontal'
                  ? { left: `${getPercentage(val)}%`, transform: 'translate(-50%, -50%)' }
                  : { bottom: `${getPercentage(val)}%`, transform: 'translate(-50%, 50%)' }
              )}
              style={
                orientation === 'horizontal'
                  ? { left: `${getPercentage(val)}%` }
                  : { bottom: `${getPercentage(val)}%` }
              }
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={val}
              aria-orientation={orientation}
              aria-label={Array.isArray(value) ? `Value ${index + 1}` : undefined}
              onPointerDown={(e) => handlePointerDown(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          ))}
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';