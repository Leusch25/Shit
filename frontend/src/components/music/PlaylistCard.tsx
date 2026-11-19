/**
 * Playlist Card component
 */

import { cn } from '../../utils/helpers';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDuration } from '../../utils/helpers';
import type { SpotifyPlaylist } from '../../types';
import { Play, MoreHorizontal, User, Calendar, Clock } from 'lucide-react';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
  variant?: 'grid' | 'list' | 'compact';
  onPlay?: (playlist: SpotifyPlaylist) => void;
  onClick?: (playlist: SpotifyPlaylist) => void;
  className?: string;
}

export function PlaylistCard({
  playlist,
  variant = 'grid',
  onPlay,
  onClick,
  className,
}: PlaylistCardProps) {
  const totalDuration = 0; // Would need track data to calculate
  const trackCount = playlist.tracks.total;
  const imageUrl = playlist.images[0]?.url;
  const ownerName = playlist.owner.display_name;

  if (variant === 'list') {
    return (
      <div className="flex items-center gap-4 p-3 card-hover group" onClick={() => onClick?.(playlist)}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0" loading="lazy" />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/50 to-purple-500/50 flex items-center justify-center flex-shrink-0">
            <Play className="h-8 w-8 text-primary/50" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <button className="font-medium text-foreground hover:text-primary truncate block text-left w-full" onClick={(e) => { e.stopPropagation(); onClick?.(playlist); }}>
            {playlist.name}
          </button>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {ownerName}
            </span>
            <span className="flex items-center gap-1">
              <Music className="h-3 w-3" />
              {trackCount} tracks
            </span>
            {playlist.public && <Badge variant="secondary" className="text-xs">Public</Badge>}
            {!playlist.public && <Badge variant="outline" className="text-xs">Private</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onPlay && (
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onPlay(playlist); }} aria-label={`Play ${playlist.name}`}>
              <Play className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card variant="hover" className={cn('flex flex-col h-full group', className)} onClick={() => onClick?.(playlist)}>
      <div className="relative aspect-square overflow-hidden rounded-xl">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/50 to-purple-500/50 flex items-center justify-center">
            <Play className="h-16 w-16 text-primary/50" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {onPlay && (
            <Button size="lg" variant="secondary" onClick={(e) => { e.stopPropagation(); onPlay(playlist); }} aria-label={`Play ${playlist.name}`}>
              <Play className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* Playlist type badge */}
        <div className="absolute top-2 left-2">
          {playlist.collaborative ? (
            <Badge variant="secondary" className="text-xs">Collaborative</Badge>
          ) : playlist.public ? (
            <Badge variant="secondary" className="text-xs">Public</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">Private</Badge>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {playlist.name}
        </h3>

        <p className="text-sm text-muted-foreground truncate" title={ownerName}>
          By {ownerName}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <span className="flex items-center gap-1">
            <Music className="h-3 w-3" />
            {trackCount} track{trackCount !== 1 ? 's' : ''}
          </span>
          {totalDuration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(totalDuration)}
            </span>
          )}
        </div>

        {/* Action buttons on hover */}
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
          {onPlay && (
            <Button variant="ghost" size="icon" className="flex-1" onClick={(e) => { e.stopPropagation(); onPlay(playlist); }} aria-label={`Play ${playlist.name}`}>
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function PlaylistCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' }) {
  if (variant === 'list') {
    return (
      <div className="flex items-center gap-4 p-3 animate-pulse">
        <div className="h-16 w-16 rounded-lg skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 skeleton" />
          <div className="h-3 w-32 skeleton" />
        </div>
      </div>
    );
  }

  return (
    <Card className="animate-pulse flex flex-col h-full">
      <div className="aspect-square skeleton rounded-xl" />
      <div className="p-3 space-y-2 flex-1">
        <div className="h-4 w-3/4 skeleton" />
        <div className="h-3 w-1/2 skeleton" />
        <div className="h-3 w-24 skeleton mt-auto" />
      </div>
    </Card>
  );
}