/**
 * Search Input component
 */

import { forwardRef, InputHTMLAttributes, useState, useEffect } from 'react';
import { cn } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  showClearButton?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      placeholder = 'Search...',
      onSearch,
      debounceMs = 300,
      showClearButton = true,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value || '');
    const [showClear, setShowClear] = useState(false);

    useEffect(() => {
      setInternalValue(value || '');
    }, [value]);

    useEffect(() => {
      if (internalValue) {
        setShowClear(true);
      } else {
        setShowClear(false);
      }
    }, [internalValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(e);
    };

    const handleSearch = () => {
      onSearch?.(internalValue);
    };

    const clear = () => {
      setInternalValue('');
      onSearch?.('');
      onChange?.({ target: { value: '' } } as any);
    };

    // Debounced search
    useEffect(() => {
      const timer = setTimeout(() => {
        if (!props.onKeyDown) {
          onSearch?.(internalValue);
        }
      }, debounceMs);
      return () => clearTimeout(timer);
    }, [internalValue, debounceMs, onSearch]);

    return (
      <div className={cn('relative flex items-center', className)}>
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
        <input
          ref={ref}
          type="search"
          value={internalValue}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
            props.onKeyDown?.(e);
          }}
          placeholder={placeholder}
          className={cn(
            'input pl-10 pr-10',
            'bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20'
          )}
          {...props}
        />
        {showClearButton && showClear && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={clear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';