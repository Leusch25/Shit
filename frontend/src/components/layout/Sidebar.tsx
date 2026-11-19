/**
 * Sidebar component for game library filtering
 */

import { useState } from 'react';
import { cn } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ScrollArea } from '../ui/ScrollArea';
import { Separator } from '../ui/Separator';
import { ChevronDown, ChevronRight, Filter, X, Gamepad2, Music, FolderOpen, Star, EyeOff } from 'lucide-react';
import type { SystemId, FilterState } from '../../types';
import { SYSTEM_CONFIG, SYSTEM_IDS } from '../../utils/config';

interface SidebarProps {
  filters?: FilterState;
  onFiltersChange?: (filters: Partial<FilterState>) => void;
  gameCounts?: Record<SystemId, number>;
  totalGames?: number;
  className?: string;
}

export function Sidebar({
  filters = { systems: [], search: '', favoritesOnly: false, hidden: false, sortBy: 'title', sortOrder: 'asc' },
  onFiltersChange = () => {},
  gameCounts = SYSTEM_IDS.reduce((acc, id) => ({ ...acc, [id]: 0 }), {} as Record<SystemId, number>),
  totalGames = 0,
  className,
}: SidebarProps) {
  const [expandedSystems, setExpandedSystems] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState(true);

  const toggleSystem = (systemId: SystemId) => {
    const newSystems = filters.systems.includes(systemId)
      ? filters.systems.filter((s) => s !== systemId)
      : [...filters.systems, systemId];
    onFiltersChange({ systems: newSystems });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      systems: [],
      search: '',
      favoritesOnly: false,
      hidden: false,
    });
  };

  const hasActiveFilters =
    filters.systems.length > 0 ||
    filters.search ||
    filters.favoritesOnly;

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-88 z-30 w-72 glass-strong border-r border-white/10 dark:border-black/10',
        'overflow-y-auto hidden lg:block',
        className
      )}
      role="complementary"
      aria-label="Game library filters"
    >
      <div className="p-4 space-y-6">
        {/* Systems Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Systems
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpandedSystems(!expandedSystems)}
              aria-expanded={expandedSystems}
              aria-label={expandedSystems ? 'Collapse systems' : 'Expand systems'}
            >
              {expandedSystems ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {expandedSystems && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.systems.length === 0 || filters.systems.length === SYSTEM_IDS.length}
                  onChange={() => onFiltersChange({ systems: filters.systems.length === 0 ? SYSTEM_IDS : [] })}
                  className="rounded border-input"
                />
                <span className="text-sm font-medium">All Systems</span>
                <Badge variant="secondary" className="ml-auto">
                  {totalGames}
                </Badge>
              </label>
              <Separator className="my-2" />
              {SYSTEM_IDS.map((systemId) => {
                const sysId = systemId as SystemId;
                const config = SYSTEM_CONFIG[sysId];
                const count = gameCounts[sysId] || 0;
                const isSelected = filters.systems.includes(sysId);

                return (
                  <label
                    key={systemId}
                    className={cn(
                      'flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-xl transition-colors',
                      'hover:bg-accent',
                      isSelected && 'bg-primary/10 text-primary'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSystem(sysId)}
                      className="rounded border-input"
                    />
                    <span
                      className="w-3 h-3 rounded flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium truncate flex-1">{config.shortName}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {count}
                    </Badge>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Additional Filters */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpandedFilters(!expandedFilters)}
              aria-expanded={expandedFilters}
              aria-label={expandedFilters ? 'Collapse filters' : 'Expand filters'}
            >
              {expandedFilters ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {expandedFilters && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.favoritesOnly}
                  onChange={(e) => onFiltersChange({ favoritesOnly: e.target.checked })}
                  className="rounded border-input"
                />
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Favorites only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hidden}
                  onChange={(e) => onFiltersChange({ hidden: e.target.checked })}
                  className="rounded border-input"
                />
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Show hidden</span>
              </label>
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={clearAllFilters}
            icon={<X className="h-4 w-4" />}
          >
            Clear all filters
          </Button>
        )}

        {/* Quick Stats */}
        <div className="pt-4 border-t border-white/10 dark:border-black/10">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Library Stats
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-accent/10">
              <p className="text-2xl font-bold text-foreground">{totalGames}</p>
              <p className="text-xs text-muted-foreground">Total Games</p>
            </div>
            <div className="p-3 rounded-xl bg-accent/10">
              <p className="text-2xl font-bold text-foreground">
                {filters.systems.length === 0 ? SYSTEM_IDS.length : filters.systems.length}
              </p>
              <p className="text-xs text-muted-foreground">Systems</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}