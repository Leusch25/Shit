/**
 * Tabs component
 */

import { createContext, useContext, useState, ReactNode, forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs');
  }
  return context;
}

export function Tabs({ value, onValueChange, defaultValue, onChange, children, className, ...props }: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
  const currentValue = isControlled ? value : uncontrolledValue;

  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div className={cn('space-y-4', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-muted p-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  children,
  value,
  disabled,
  className,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { value: string; disabled?: boolean }) {
  const { value: currentValue, onChange } = useTabsContext();
  const isActive = currentValue === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      id={`trigger-${value}`}
      className={cn(
        'relative flex h-full items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
        className
      )}
      onClick={() => !disabled && onChange(value)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  children,
  value,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { value: string; forceMount?: boolean }) {
  const { value: currentValue } = useTabsContext();
  const isActive = currentValue === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`trigger-${value}`}
      className={cn('animate-in fade-in-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}