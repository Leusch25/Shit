/**
 * Toast notification system
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { cn } from '../../utils/helpers';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { Toast } from '../../types';

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast = { ...toast, id, duration: toast.duration ?? 5000 };
    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => removeToast(id), newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };
  const Icon = icons[toast.type];

  const typeClasses = {
    success: 'border-green-500/50 bg-green-500/10 text-green-500',
    error: 'border-destructive/50 bg-destructive/10 text-destructive',
    warning: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500',
    info: 'border-primary/50 bg-primary/10 text-primary',
  };

  useEffect(() => {
    const timer = toast.duration ? setTimeout(() => onRemove(toast.id), toast.duration) : null;
    return () => timer && clearTimeout(timer);
  }, [toast.duration, toast.id, onRemove]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg min-w-[300px] max-w-md',
        'animate-in slide-in-from-right-full duration-300',
        typeClasses[toast.type]
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-medium text-foreground">{toast.title}</p>
        )}
        {toast.message && (
          <p className="mt-1 text-sm text-muted-foreground">{toast.message}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {toast.action && (
          <button
            className="text-sm font-medium hover:underline"
            onClick={() => {
              toast.action.onClick();
              onRemove(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        )}
        <button
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
          onClick={() => onRemove(toast.id)}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}