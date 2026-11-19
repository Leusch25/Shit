/**
 * View Toggle component
 */

import { cn } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Grid, List, LayoutDashboard } from 'lucide-react';
import type { ViewMode } from '../../types';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
  showLabels?: boolean;
}

export function ViewToggle({ value, onChange, className, showLabels = false }: ViewToggleProps) {
  const modes: Array<{ mode: ViewMode; icon: React.ReactNode; label: string }> = [
    { mode: 'grid', icon: <Grid className="h-4 w-4" />, label: 'Grid' },
    { mode: 'list', icon: <List className="h-4 w-4" />, label: 'List' },
    { mode: 'compact', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Compact' },
  ];

  return (
    <div className={cn('inline-flex rounded-xl bg-muted p-1', className)} role="group" aria-label="View mode">
      {modes.map(({ mode, icon, label }) => (
        <Button
          key={mode}
          type="button"
          variant={value === mode ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => onChange(mode)}
          aria-pressed={value === mode}
          className={cn('gap-1', !showLabels && 'px-2')}
        >
          {icon}
          {showLabels && <span className="text-xs">{label}</span>}
        </Button>
      ))}
    </div>
  );
}