/**
 * Filter Bar component
 */

import { cn } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator, DropdownLabel } from '../ui/Dropdown';
import { SearchInput } from './SearchInput';
import { ViewToggle } from './ViewToggle';
import { SlidersHorizontal, Funnel, X } from 'lucide-react';
import type { FilterState, SystemId } from '../../types';
import { SYSTEM_IDS, SYSTEM_CONFIG } from '../../utils/config';

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  viewMode: 'grid' | 'list' | 'compact';
  onViewModeChange: (mode: 'grid' | 'list' | 'compact') => void;
  gameCounts?: Record<SystemId, number>;
  totalGames?: number;
  className?: string;
  showSearch?: boolean;
  showViewToggle?: boolean;
  showSystemFilters?: boolean;
  placeholder?: string;
}

export function FilterBar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  gameCounts = SYSTEM_IDS.reduce((acc, id) => ({ ...acc, [id]: 0 }), {} as Record<SystemId, number>),
  totalGames = 0,
  className,
  showSearch = true,
  showViewToggle = true,
  showSystemFilters = true,
  placeholder = 'Search games...',
}: FilterBarProps) {
  const hasActiveFilters =
    filters.systems.length > 0 ||
    filters.search ||
    filters.favoritesOnly ||
    filters.hidden;

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    onFiltersChange({
      sortBy,
      sortOrder: filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      systems: [],
      search: '',
      favoritesOnly: false,
      hidden: false,
    });
  };

  return (
    <div className={cn('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        {showSearch && (
          <SearchInput
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder={placeholder}
            className="w-full sm:w-64"
          />
        )}

        {showViewToggle && <ViewToggle value={viewMode} onChange={onViewModeChange} showLabels={false} />}

        {showSystemFilters && filters.systems.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filters.systems.map((systemId) => {
              const config = SYSTEM_CONFIG[systemId];
              return (
                <span
                  key={systemId}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: `${config.color}20`,
                    borderColor: config.color,
                    color: config.color,
                  }}
                >
                  {config.shortName}
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ systems: filters.systems.filter((s) => s !== systemId) })}
                    className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                    aria-label={`Remove ${config.name} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {filters.favoritesOnly && (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-yellow-500/20 text-yellow-500 border border-yellow-500/50">
            <span>Favorites</span>
            <button
              type="button"
              onClick={() => onFiltersChange({ favoritesOnly: false })}
              className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded"
              aria-label="Remove favorites filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {filters.hidden && (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground border border-border">
            <span>Hidden</span>
            <button
              type="button"
              onClick={() => onFiltersChange({ hidden: false })}
              className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded"
              aria-label="Remove hidden filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* Sort Dropdown */}
        <Dropdown>
          <DropdownTrigger variant="outline" size="sm" className="gap-1 hidden sm:flex">
            <SlidersHorizontal className="h-4 w-4" />
            Sort: {filters.sortBy}
            {filters.sortOrder === 'desc' ? ' ↓' : ' ↑'}
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownLabel>Sort by</DropdownLabel>
            {(['title', 'recent', 'playtime', 'play_count', 'system'] as const).map((sort) => (
              <DropdownItem
                key={sort}
                onClick={() => handleSortChange(sort)}
                icon={
                  filters.sortBy === sort
                    ? filters.sortOrder === 'asc'
                      ? <span className="text-primary">↑</span>
                      : <span className="text-primary">↓</span>
                    : null
                }
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </DropdownItem>
            ))}
          </DropdownContent>
        </Dropdown>

        {/* Systems Filter Dropdown */}
        {showSystemFilters && (
          <Dropdown>
            <DropdownTrigger variant="outline" size="sm" className="gap-1">
              <Funnel className="h-4 w-4" />
              Systems
              {filters.systems.length > 0 && <span className="text-primary">({filters.systems.length})</span>}
            </DropdownTrigger>
            <DropdownContent align="end" className="w-64 max-h-96 overflow-y-auto">
              <DropdownLabel>Filter by System</DropdownLabel>
              <DropdownItem
                onClick={() => onFiltersChange({ systems: filters.systems.length === SYSTEM_IDS.length ? [] : SYSTEM_IDS })}
                icon={filters.systems.length === 0 || filters.systems.length === SYSTEM_IDS.length ? <span className="text-primary">✓</span> : null}
              >
                All Systems ({totalGames})
              </DropdownItem>
              <DropdownSeparator />
              {SYSTEM_IDS.map((systemId) => {
                const config = SYSTEM_CONFIG[systemId];
                const count = gameCounts[systemId] || 0;
                const isSelected = filters.systems.includes(systemId);

                return (
                  <DropdownItem
                    key={systemId}
                    onClick={() => {
                      const newSystems = isSelected
                        ? filters.systems.filter((s) => s !== systemId)
                        : [...filters.systems, systemId];
                      onFiltersChange({ systems: newSystems });
                    }}
                    icon={isSelected ? <span className="text-primary">✓</span> : null}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: config.color }} />
                      <span className="truncate font-medium">{config.shortName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </DropdownItem>
                );
              })}
            </DropdownContent>
          </Dropdown>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} icon={<X className="h-4 w-4" />}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}