/**
 * Modal component with Portal
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  forwardRef,
  HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/helpers';
import { X } from 'lucide-react';

interface ModalContextType {
  close: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within a Modal');
  }
  return context;
}

export function Modal({ isOpen, onClose, children, className, size, ...props }: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
} & HTMLAttributes<HTMLDivElement>) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    function handleOverlayClick(event: MouseEvent) {
      if (event.target === overlayRef.current) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    overlayRef.current?.addEventListener('click', handleOverlayClick);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      overlayRef.current?.removeEventListener('click', handleOverlayClick);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      {...props}
    >
      <div
        ref={contentRef}
        className={cn(
          'relative w-full rounded-2xl bg-background p-6 shadow-2xl',
          'animate-in zoom-in-95 slide-in-from-bottom-4',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-md',
          size === 'lg' && 'max-w-lg',
          size === 'xl' && 'max-w-xl',
          size === 'full' && 'max-w-4xl',
          className
        )}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export function ModalHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function ModalTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 id="modal-title" className={cn('text-xl font-semibold text-foreground', className)} {...props}>
      {children}
    </h2>
  );
}

export function ModalDescription({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('mt-1 text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

export function ModalContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-6 flex items-center justify-end gap-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ModalCloseButton({ children = 'Close', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { close } = useModalContext();
  return (
    <button type="button" className={cn('btn btn-secondary', className)} onClick={close} {...props}>
      {children}
    </button>
  );
}

export function ModalActionButton({
  children,
  className,
  variant = 'primary',
  onClick,
  closeOnClick = true,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'destructive'; closeOnClick?: boolean }) {
  const { close } = useModalContext();
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    destructive: 'btn-destructive',
  };

  return (
    <button
      type="button"
      className={cn('btn', variantClasses[variant], className)}
      onClick={(e) => {
        onClick?.(e);
        if (closeOnClick) close();
      }}
      {...props}
    >
      {children}
    </button>
  );
}