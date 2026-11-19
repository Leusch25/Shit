/**
 * Game Grid component with virtualized rendering support
 */

import { useMemo, useCallback } from 'react';
import { cn } from '../../utils/helpers';
import { GameCard } from './GameCard';
import { SkeletonGameCard } from '../ui/Skeleton';
import type { Game, ViewMode, FilterState } from '../../types';
import { Button } from '../ui/Button';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator, DropdownLabel } from '../ui/Dropdown';
import { Grid, List, LayoutDashboard, SlidersHorizontal } from 'lucide-react';

interface GameGridProps {
  games: Game[];
  loading?: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onPlay?: (game: Game) => void;
  onToggleFavorite?: (game: Game) => void;
  onToggleHidden?: (game: Game) => void;
  onDelete?: (game: Game) => void;
  onShowDetails?: (game: Game) => void;
  emptyMessage?: string;
  emptyAction?: { label: string; onClick: () => void };
}

export function GameGrid({
  games,
  loading = false,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  onPlay,
  onToggleFavorite,
  onToggleHidden,
  onDelete,
  onShowDetails,
  emptyMessage = 'No games found',
  emptyAction,
}: GameGridProps) {
  const cardVariant = useMemo(() => {
    switch (viewMode) {
      case 'grid': return 'grid';
      case 'list': return 'list';
      case 'compact': return 'compact';
      default: return 'grid';
    }
  }, [viewMode]);

  const handleSortChange = useCallback((sortBy: FilterState['sortBy']) => {
    onFiltersChange({
      sortBy,
      sortOrder: filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  }, [filters.sortBy, filters.sortOrder, onFiltersChange]);

  if (loading) {
    return (
      <div className="game-grid" role="status" aria-label="Loading games">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonGameCard key={i} />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="text-6xl mb-4">🎮</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {filters.search
            ? `No games match "${filters.search}". Try adjusting your search or filters.`
            : filters.systems.length > 0
            ? 'No games found for the selected systems.'
            : 'Your game library is empty. Add some ROMs to get started!'}
        </p>
        {emptyAction && (
          <Button onClick={emptyAction.onClick} className="gap-2">
            {emptyAction.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {games.length} game{games.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode */}
          <Dropdown>
            <DropdownTrigger variant="outline" size="sm" className="gap-1">
              <span className="hidden sm:inline">View</span>
              {viewMode === 'grid' && <Grid className="h-4 w-4" />}
              {viewMode === 'list' && <List className="h-4 w-4" />}
              {viewMode === 'compact' && <LayoutDashboard className="h-4 w-4" />}
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownLabel>Layout</DropdownLabel>
              <DropdownItem
                onClick={() => onViewModeChange('grid')}
                icon={viewMode === 'grid' && <Grid className="h-4 w-4 text-primary" />}
              >
                Grid
              </DropdownItem>
              <DropdownItem
                onClick={() => onViewModeChange('list')}
                icon={viewMode === 'list' && <List className="h-4 w-4 text-primary" />}
              >
                List
              </DropdownItem>
              <DropdownItem
                onClick={() => onViewModeChange('compact')}
                icon={viewMode === 'compact' && <LayoutDashboard className="h-4 w-4 text-primary" />}
              >
                Compact
              </DropdownItem>
            </DropdownContent>
          </Dropdown>

          {/* Sort */}
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
                        ? <span>↑</span>
                        : <span>↓</span>
                      : null
                  }
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </div>
      </div>

      {/* Grid */}
      <div
        className={cn(
          'game-grid',
          viewMode === 'list' && 'grid-cols-1',
          viewMode === 'compact' && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
        )}
        role="list"
        aria-label="Game library"
      >
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            variant={cardVariant}
            onPlay={onPlay}
            onToggleFavorite={onToggleFavorite}
            onToggleHidden={onToggleHidden}
            onDelete={onDelete}
            onShowDetails={onShowDetails}
          />
        ))}
      </div>
    </div>
  );
}