/**
 * Badge component
 */

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  dotColor?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot, dotColor, children, ...props }, ref) => {
    const variantClasses = {
      default: 'badge',
      primary: 'badge-primary',
      secondary: 'badge-secondary',
      outline: 'badge-outline',
      success: 'badge border-transparent bg-green-500/20 text-green-500 dark:bg-green-500/30 dark:text-green-400',
      warning: 'badge border-transparent bg-yellow-500/20 text-yellow-500 dark:bg-yellow-500/30 dark:text-yellow-400',
      destructive: 'badge border-transparent bg-destructive/20 text-destructive dark:bg-destructive/30',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className="relative flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';