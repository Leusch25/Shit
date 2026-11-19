/**
 * ScrollArea component with custom scrollbars
 */

import { forwardRef, HTMLAttributes, useRef, useEffect, useState } from 'react';
import { cn } from '../../utils/helpers';

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'always' | 'hover' | 'auto';
  scrollHideDelay?: number;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, type = 'auto', scrollHideDelay = 1000, ...props }, ref) => {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [showScrollbar, setShowScrollbar] = useState(false);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const handleScroll = () => {
      if (type === 'auto' || type === 'hover') {
        setShowScrollbar(true);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => setShowScrollbar(false), scrollHideDelay);
      }
    };

    useEffect(() => {
      const element = scrollAreaRef.current;
      if (!element) return;

      element.addEventListener('scroll', handleScroll, { passive: true });
      if (type === 'hover') {
        element.addEventListener('mouseenter', () => setShowScrollbar(true));
        element.addEventListener('mouseleave', () => setShowScrollbar(false));
      }
      return () => {
        element.removeEventListener('scroll', handleScroll);
        element.removeEventListener('mouseenter', () => setShowScrollbar(true));
        element.removeEventListener('mouseleave', () => setShowScrollbar(false));
      };
    }, [type, scrollHideDelay]);

    return (
      <div
        ref={scrollAreaRef}
        className={cn(
          'relative overflow-auto',
          type === 'always' && 'scrollbar-thin',
          className
        )}
        {...props}
      >
        {children}
        <style jsx>{`
          .scroll-area::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .scroll-area::-webkit-scrollbar-track {
            background: transparent;
          }
          .scroll-area::-webkit-scrollbar-thumb {
            background: hsl(var(--muted-foreground) / 0.3);
            border-radius: 4px;
            border: 2px solid transparent;
            background-clip: content-box;
          }
          .scroll-area::-webkit-scrollbar-thumb:hover {
            background: hsl(var(--muted-foreground) / 0.5);
          }
          .scroll-area::-webkit-scrollbar-corner {
            background: transparent;
          }
        `}</style>
        <div className="scroll-area" style={{ overflow: 'auto' }}>
          {children}
        </div>
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';

export const ScrollBar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { orientation?: 'vertical' | 'horizontal' }>(
  ({ className, orientation = 'vertical', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex touch-none select-none transition-opacity',
        orientation === 'vertical' ? 'h-full w-2.5' : 'h-2.5 w-full',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex-1 rounded-full bg-border/50',
          orientation === 'vertical' ? 'mx-0.5' : 'my-0.5'
        )}
      >
        <div className="absolute inset-0 rounded-full bg-muted-foreground/30" />
      </div>
    </div>
  )
);

ScrollBar.displayName = 'ScrollBar';

export const Viewport = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1', className)} {...props} />
  )
);

Viewport.displayName = 'Viewport';