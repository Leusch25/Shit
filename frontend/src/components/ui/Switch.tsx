/**
 * Switch component
 */

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

export interface SwitchProps extends HTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, label, description, id, ...props }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <label className={cn('flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 pointer-events-none', className)}>
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled}
          id={switchId}
          aria-describedby={description ? `${switchId}-description` : undefined}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-primary border-primary' : 'bg-secondary border-border'
          )}
          onClick={() => !disabled && onCheckedChange?.(!checked)}
          {...props}
        >
          <span
            className={cn(
              'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0',
              'transition-transform duration-200 ease-in-out',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
        {label && (
          <div className="text-sm leading-none">
            <span className="font-medium text-foreground">{label}</span>
            {description && (
              <p id={`${switchId}-description`} className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';