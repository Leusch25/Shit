/**
 * Progress component
 */

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showValue?: boolean;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showValue = false, ...props }, ref) => {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));

    return (
      <div
        ref={ref}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
        {...props}
      >
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={showValue ? `${Math.round(percentage)}%` : undefined}
        />
        {showValue && (
          <span className="absolute right-0 top-0 text-xs text-muted-foreground -translate-y-full pr-1">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export function CircularProgress({
  value = 0,
  max = 100,
  size = 48,
  strokeWidth = 4,
  className,
  showValue = false,
  ...props
}: React.SVGAttributes<SVGSVGElement> & {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
}) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className={cn('rotate-[-90deg]', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${Math.round(percentage)}%`}
      {...props}
    >
      <circle
        className="text-muted"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke="currentColor"
      />
      <circle
        className="text-primary transition-all duration-300 ease-out"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      {showValue && (
        <text
          x={size / 2}
          y={size / 2}
          dominantBaseline="middle"
          textAnchor="middle"
          className="text-xs font-medium"
          fill="currentColor"
        >
          {Math.round(percentage)}%
        </text>
      )}
    </svg>
  );
}