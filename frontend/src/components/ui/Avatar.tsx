/**
 * Avatar component
 */

import { forwardRef, HTMLAttributes, useState } from 'react';
import { cn } from '../../utils/helpers';
import { getInitials } from '../../utils/helpers';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-24 w-24 text-2xl',
};

const statusSizeClasses = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
  '2xl': 'h-4 w-4',
};

const statusPositionClasses = {
  'bottom-right': 'bottom-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'top-right': 'top-0 right-0',
  'top-left': 'top-0 left-0',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      name,
      size = 'md',
      shape = 'circle',
      status,
      statusPosition = 'bottom-right',
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const showFallback = !src || imageError;

    const bgColor = name ? `bg-[${stringToColor(name)}]` : 'bg-muted';

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex shrink-0 overflow-hidden', sizeClasses[size], className)}
        {...props}
      >
        {showFallback ? (
          <div
            className={cn(
              'flex items-center justify-center font-medium text-foreground',
              shape === 'circle' ? 'rounded-full' : 'rounded-xl',
              bgColor
            )}
            aria-label={name || alt || 'User avatar'}
          >
            {name ? getInitials(name) : '?'}
          </div>
        ) : (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className={cn('h-full w-full object-cover', shape === 'circle' ? 'rounded-full' : 'rounded-xl')}
            onError={() => setImageError(true)}
          />
        )}
        {status && (
          <span
            className={cn(
              'absolute border-2 border-background rounded-full',
              statusColors[status],
              statusSizeClasses[size],
              statusPositionClasses[statusPosition]
            )}
            aria-label={status}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export const AvatarGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { max?: number }>(
  ({ className, max = 5, children, ...props }, ref) => {
    const kids = Array.isArray(children) ? children : [children];
    const visible = kids.slice(0, max);
    const remaining = kids.length - max;

    return (
      <div ref={ref} className={cn('flex -space-x-2', className)} {...props}>
        {visible.map((child, index) => (
          <div key={index} className="relative z-[auto]">
            {child}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className={cn(
              'flex items-center justify-center font-medium text-muted-foreground border border-background',
              sizeClasses.md,
              'rounded-full'
            )}
          >
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';