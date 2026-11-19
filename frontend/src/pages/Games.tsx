/**
 * Games Library Page
 */

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GameGrid } from '../components/games/GameGrid';
import { GameModal } from '../components/games/GameModal';
import { Sidebar } from '../components/layout/Sidebar';
import { FilterBar } from '../components/common/FilterBar';
import { SearchInput } from '../components/common/SearchInput';
import { SkeletonGameCard } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { getGames, type Game, type FilterState, type SystemId } from '../services/supabase';
import { SYSTEM_IDS, SYSTEM_CONFIG } from '../utils/config';
import { Plus, Upload, Download, Filter, X } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  systems: [],
  search: '',
  favoritesOnly: false,
  hidden: false,
  sortBy: 'title',
  sortOrder: 'asc',
};

export function Games() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [gameCounts, setGameCounts] = useState<Record<SystemId, number>>({} as Record<SystemId, number>);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Sync filters with URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const newFilters: Partial<FilterState> = {};

    const systemsParam = params.get('systems');
    if (systemsParam) newFilters.systems = systemsParam.split(',') as SystemId[];

    const searchParam = params.get('search');
    if (searchParam) newFilters.search = searchParam;

    const favoritesParam = params.get('favorites');
    if (favoritesParam === 'true') newFilters.favoritesOnly = true;

    const hiddenParam = params.get('hidden');
    if (hiddenParam === 'true') newFilters.hidden = true;

    const sortByParam = params.get('sortBy');
    if (sortByParam) newFilters.sortBy = sortByParam as FilterState['sortBy'];

    const sortOrderParam = params.get('sortOrder');
    if (sortOrderParam) newFilters.sortOrder = sortOrderParam as FilterState['sortOrder'];

    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, [searchParams]);

  // Fetch games
  const fetchGames = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await getGames(user.id, {
        systemId: filters.systems[0],
        search: filters.search,
        favoritesOnly: filters.favoritesOnly,
        hidden: filters.hidden,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        pageSize: 100,
      });

      if (response.data) {
        setGames(response.data.data);
        setTotalCount(response.data.total);
      }

      // Get counts per system
      const counts: Record<SystemId, number> = {} as Record<SystemId, number>;
      for (const systemId of SYSTEM_IDS) {
        const sysResponse = await getGames(user.id, { systemId, pageSize: 1 });
        counts[systemId] = sysResponse.data?.total || 0;
      }
      setGameCounts(counts);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [user, filters]);

  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));

    // Update URL
    const params = new URLSearchParams();
    const merged = { ...filters, ...newFilters };

    if (merged.systems.length > 0) params.set('systems', merged.systems.join(','));
    if (merged.search) params.set('search', merged.search);
    if (merged.favoritesOnly) params.set('favorites', 'true');
    if (merged.hidden) params.set('hidden', 'true');
    if (merged.sortBy !== 'title') params.set('sortBy', merged.sortBy);
    if (merged.sortOrder !== 'asc') params.set('sortOrder', merged.sortOrder);

    setSearchParams(params, { replace: true });
  };

  const handleViewModeChange = (mode: 'grid' | 'list' | 'compact') => {
    setViewMode(mode);
  };

  const handlePlay = (game: Game) => {
    // Navigate to play page
    window.location.href = `/play/${game.id}`;
  };

  const handleShowDetails = (game: Game) => {
    setSelectedGame(game);
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Game Library</h1>
            <p className="text-muted-foreground">
              {totalCount} game{totalCount !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button variant="outline" icon={<Upload className="h-4 w-4" />}>
              Add ROMs
            </Button>
            <Button icon={<Plus className="h-4 w-4" />}>
              Add Game
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          gameCounts={gameCounts}
          totalGames={totalCount}
          showSearch={true}
          showViewToggle={true}
          showSystemFilters={true}
        />
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <Sidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          gameCounts={gameCounts}
          totalGames={totalCount}
        />

        {/* Game Grid */}
        <div className="flex-1 min-w-0">
          <GameGrid
            games={games}
            loading={loading}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onPlay={handlePlay}
            onToggleFavorite={(game) => {}}
            onToggleHidden={(game) => {}}
            onDelete={(game) => {}}
            onShowDetails={handleShowDetails}
            emptyMessage="No games found"
            emptyAction={{
              label: 'Add your first game',
              onClick: () => {},
            }}
          />
        </div>
      </div>

      {/* Game Detail Modal */}
      <GameModal
        game={selectedGame}
        isOpen={!!selectedGame}
        onClose={handleCloseModal}
        onPlay={handlePlay}
      />
    </div>
  );
}