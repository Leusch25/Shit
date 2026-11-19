/**
 * Game Card component
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from '../ui/Dropdown';
import { formatFileSize, formatPlaytime, getSystemColor } from '../../utils/helpers';
import type { Game, SystemId } from '../../types';
import { SYSTEM_CONFIG } from '../../utils/config';
import {
  Play,
  Heart,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Info,
  Settings,
  MoreHorizontal,
  Clock,
  Star,
} from 'lucide-react';

interface GameCardProps {
  game: Game;
  variant?: 'grid' | 'list' | 'compact';
  onPlay?: (game: Game) => void;
  onToggleFavorite?: (game: Game) => void;
  onToggleHidden?: (game: Game) => void;
  onDelete?: (game: Game) => void;
  onShowDetails?: (game: Game) => void;
}

export function GameCard({
  game,
  variant = 'grid',
  onPlay,
  onToggleFavorite,
  onToggleHidden,
  onDelete,
  onShowDetails,
}: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const systemConfig = SYSTEM_CONFIG[game.system_id];
  const systemColor = getSystemColor(game.system_id);

  const coverUrl = game.cover_url || `https://via.placeholder.com/300x400/${systemColor.slice(1)}/ffffff?text=${game.system_id.toUpperCase()}`;

  const playIcon = variant === 'compact' ? null : <Play className="h-5 w-5" />;

  if (variant === 'list') {
    return (
      <div className="flex items-center gap-4 p-3 card-hover group">
        <Link to={`/games/${game.id}`} className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={coverUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" onClick={(e) => { e.preventDefault(); onPlay?.(game); }} aria-label="Play">
              <Play className="h-5 w-5" />
            </Button>
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/games/${game.id}`} className="font-medium text-foreground hover:text-primary truncate block">
                {game.title}
              </Link>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-muted">
                  <span className="w-2 h-2 rounded" style={{ backgroundColor: systemColor }} />
                  {systemConfig.shortName}
                </span>
                <span>{formatFileSize(game.file_size)}</span>
                {game.total_playtime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatPlaytime(game.total_playtime)}
                  </span>
                )}
              </div>
            </div>
            <Dropdown>
              <DropdownTrigger variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownTrigger>
              <DropdownContent align="end">
                <DropdownItem onClick={() => onPlay?.(game)} icon={<Play className="h-4 w-4" />}>
                  Play
                </DropdownItem>
                <DropdownItem onClick={() => onShowDetails?.(game)} icon={<Info className="h-4 w-4" />}>
                  Details
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={() => onToggleFavorite?.(game)} icon={<Heart className="h-4 w-4" />}>
                  {game.favorite ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownItem>
                <DropdownItem onClick={() => onToggleHidden?.(game)} icon={game.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}>
                  {game.hidden ? 'Show' : 'Hide'}
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={() => onDelete?.(game)} icon={<Trash2 className="h-4 w-4" />} danger>
                  Delete
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card variant="hover" className="flex flex-col h-full group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link to={`/games/${game.id}`} className="relative aspect-[3/4] overflow-hidden rounded-xl">
        <img
          src={coverUrl}
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {onPlay && (
            <Button size="lg" variant="secondary" onClick={(e) => { e.preventDefault(); onPlay(game); }} aria-label={`Play ${game.title}`}>
              <Play className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* System badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="default"
            className="text-xs px-2 py-1"
            style={{ backgroundColor: `${systemColor}CC`, borderColor: systemColor }}
          >
            {systemConfig.shortName}
          </Badge>
        </div>

        {/* Favorite badge */}
        {game.favorite && (
          <div className="absolute top-2 right-2">
            <Button variant="ghost" size="icon" className="text-yellow-500" onClick={(e) => { e.preventDefault(); onToggleFavorite?.(game); }} aria-label="Remove from favorites">
              <Star className="h-5 w-5 fill-current" />
            </Button>
          </div>
        )}

        {/* Hidden indicator */}
        {game.hidden && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur text-xs text-center px-2 py-1 rounded">
            Hidden
          </div>
        )}
      </Link>

      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <Link to={`/games/${game.id}`}>
          <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {game.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1 truncate">
            <span className="w-2 h-2 rounded" style={{ backgroundColor: systemColor }} />
            {systemConfig.shortName}
          </span>
          <span>{formatFileSize(game.file_size)}</span>
        </div>

        {game.total_playtime > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatPlaytime(game.total_playtime)}</span>
            {game.play_count > 0 && <span>• {game.play_count} plays</span>}
          </div>
        )}

        {/* Action buttons on hover */}
        <div className={cn('flex items-center gap-1 mt-2 pt-2 border-t border-border/50', 'opacity-0 group-hover:opacity-100 transition-opacity')}>
          <Button variant="ghost" size="icon" className="flex-1" onClick={(e) => { e.preventDefault(); onPlay?.(game); }} aria-label={`Play ${game.title}`}>
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onShowDetails?.(game)} aria-label="Details">
            <Info className="h-4 w-4" />
          </Button>
          <Dropdown>
            <DropdownTrigger variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownItem onClick={() => onPlay?.(game)} icon={<Play className="h-4 w-4" />}>
                Play
              </DropdownItem>
              <DropdownItem onClick={() => onShowDetails?.(game)} icon={<Info className="h-4 w-4" />}>
                Details
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => onToggleFavorite?.(game)} icon={<Heart className="h-4 w-4" />}>
                {game.favorite ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownItem>
              <DropdownItem onClick={() => onToggleHidden?.(game)} icon={game.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}>
                {game.hidden ? 'Show' : 'Hide'}
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => onDelete?.(game)} icon={<Trash2 className="h-4 w-4" />} danger>
                Delete
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>
    </Card>
  );
}