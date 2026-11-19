/**
 * Separator component
 */

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

export const Separator = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement> & { orientation?: 'horizontal' | 'vertical'; decorative?: boolean }>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <hr
      ref={ref}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      {...props}
    />
  )
);

Separator.displayName = 'Separator';