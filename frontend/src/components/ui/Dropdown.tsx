/**
 * Dropdown menu component
 */

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  ForwardedRef,
} from 'react';
import { cn } from '../../utils/helpers';
import { X, ChevronDown } from 'lucide-react';
import type { DropdownItem } from '../../types';

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
  triggerRef: ForwardedRef<HTMLButtonElement>;
  contentRef: ForwardedRef<HTMLDivElement>;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
}

export function Dropdown({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, close]);

  return (
    <DropdownContext.Provider
      value={{ open, setOpen, close, triggerRef, contentRef }}
    >
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({
  children,
  className,
  'aria-label': ariaLabel,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  const { open, setOpen, triggerRef } = useDropdownContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        'btn btn-ghost btn-sm gap-1',
        'hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-label={ariaLabel}
      {...props}
    >
      {children}
      <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
    </button>
  );
}

export function DropdownContent({
  children,
  className,
  align = 'end',
  sideOffset = 4,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' | 'center'; sideOffset?: number }) {
  const { open, contentRef, close } = useDropdownContext();

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        'fixed z-50 mt-1.5 min-w-[180px] max-h-[300px] overflow-y-auto rounded-xl bg-popover text-popover-foreground shadow-lg border border-border',
        'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
        align === 'end' && 'right-0',
        align === 'start' && 'left-0',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        className
      )}
      style={{ marginTop: sideOffset }}
      role="menu"
      {...props}
    >
      <div className="py-1">{children}</div>
    </div>
  );
}

export function DropdownItem({
  children,
  className,
  onClick,
  disabled,
  danger,
  icon,
  divider,
  ...props
}: DropdownItem & { className?: string }) {
  const { close } = useDropdownContext();

  if (divider) {
    return <hr className="my-1 border-border" role="separator" />;
  }

  const handleClick = (event: React.MouseEvent) => {
    if (!disabled && onClick) {
      onClick();
    }
    close();
  };

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        danger && 'text-destructive focus:text-destructive',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex h-4 w-4 shrink-0">{icon}</span>}
      <span className="flex-1 text-left">{children}</span>
    </button>
  );
}

export function DropdownLabel({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-3 py-1.5 text-xs font-medium text-muted-foreground', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownSeparator({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('my-1 border-border', className)} role="separator" {...props} />;
}

export function DropdownShortcut({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('ml-auto text-xs text-muted-foreground', className)} {...props}>
      {children}
    </span>
  );
}