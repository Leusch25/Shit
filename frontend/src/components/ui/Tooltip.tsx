/**
 * Tooltip component
 */

import { useState, useRef, useEffect, ReactNode, forwardRef, HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/helpers';

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  skipDelay?: boolean;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delay = 200,
  skipDelay = false,
  className,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let x = 0;
    let y = 0;

    switch (side) {
      case 'top':
        y = -tooltipRect.height - gap;
        if (align === 'start') x = 0;
        else if (align === 'end') x = triggerRect.width - tooltipRect.width;
        else x = (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        y = triggerRect.height + gap;
        if (align === 'start') x = 0;
        else if (align === 'end') x = triggerRect.width - tooltipRect.width;
        else x = (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        x = -tooltipRect.width - gap;
        y = (triggerRect.height - tooltipRect.height) / 2;
        break;
      case 'right':
        x = triggerRect.width + gap;
        y = (triggerRect.height - tooltipRect.height) / 2;
        break;
    }

    setPosition({ x, y });
  };

  const show = () => {
    if (skipDelay) {
      setOpen(true);
      requestAnimationFrame(updatePosition);
    } else {
      timeoutRef.current = setTimeout(() => {
        setOpen(true);
        requestAnimationFrame(updatePosition);
      }, delay);
    }
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  const triggerProps = {
    ref: triggerRef,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  };

  if (!open) {
    return <div {...props} {...triggerProps}>{children}</div>;
  }

  const tooltip = (
    <div
      ref={tooltipRef}
      className={cn(
        'fixed z-50 px-3 py-1.5 text-xs font-medium text-popover-foreground bg-popover rounded-lg shadow-lg border border-border',
        'animate-in fade-in-0 zoom-in-95',
        'pointer-events-none'
      )}
      style={{
        left: position.x,
        top: position.y,
        transformOrigin: getTransformOrigin(side, align),
      }}
      role="tooltip"
    >
      {content}
    </div>
  );

  return (
    <div {...props} {...triggerProps} className={cn('relative inline-block', className)}>
      {children}
      {createPortal(tooltip, document.body)}
    </div>
  );
}

function getTransformOrigin(side: string, align: string): string {
  const origins: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  return `${origins[side]} ${align}`;
}

interface TooltipProviderProps {
  children: ReactNode;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}