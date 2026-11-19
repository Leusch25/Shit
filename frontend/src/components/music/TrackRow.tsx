/**
 * Track Row component for music tables
 */

import { cn } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from '../ui/Dropdown';
import { formatDuration } from '../../utils/helpers';
import type { SpotifyTrack } from '../../types';
import {
  Play,
  Pause,
  Heart,
  Plus,
  MoreHorizontal,
  Calendar,
  Clock,
  ExternalLink,
  Music,
} from 'lucide-react';

interface TrackRowProps {
  track: SpotifyTrack;
  index?: number;
  isPlaying?: boolean;
  onPlay?: (track: SpotifyTrack) => void;
  onAddToQueue?: (track: SpotifyTrack) => void;
  onAddToPlaylist?: (track: SpotifyTrack) => void;
  onViewAlbum?: (albumId: string) => void;
  onViewArtist?: (artistId: string) => void;
  showIndex?: boolean;
  className?: string;
}

export function TrackRow({
  track,
  index,
  isPlaying = false,
  onPlay,
  onAddToQueue,
  onAddToPlaylist,
  onViewAlbum,
  onViewArtist,
  showIndex = true,
  className,
}: TrackRowProps) {
  const artists = track.artists.map((a) => a.name).join(', ');
  const duration = formatDuration(track.duration_ms);

  return (
    <tr className={cn('hover:bg-accent/50 transition-colors', isPlaying && 'bg-primary/10', className)}>
      {showIndex && (
        <td className="px-4 py-3 text-center text-muted-foreground font-mono text-sm w-12">
          {isPlaying ? (
            <span className="text-primary animate-pulse">
              {index !== undefined ? index + 1 : '▶'}
            </span>
          ) : (
            index !== undefined ? index + 1 : ''
          )}
        </td>
      )}

      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {track.album.images[0] && (
            <img
              src={track.album.images[0].url}
              alt=""
              className="h-10 w-10 rounded object-cover flex-shrink-0"
              loading="lazy"
            />
          )}
          <div className="min-w-0">
            <button
              onClick={() => onPlay?.(track)}
              className="font-medium text-foreground hover:text-primary truncate block text-left w-full"
            >
              {track.name}
            </button>
            <p className="text-sm text-muted-foreground truncate">{artists}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 hidden md:table-cell">
        <button
          onClick={() => onViewAlbum?.(track.album.id)}
          className="text-sm text-muted-foreground hover:text-foreground truncate block max-w-[150px]"
        >
          {track.album.name}
        </button>
      </td>

      <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
        {duration}
      </td>

      <td className="px-4 py-3 text-right">
        <Dropdown>
          <DropdownTrigger variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownItem onClick={() => onPlay?.(track)} icon={isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}>
              {isPlaying ? 'Pause' : 'Play'}
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onClick={() => onAddToQueue?.(track)} icon={<Plus className="h-4 w-4" />}>
              Add to Queue
            </DropdownItem>
            <DropdownItem onClick={() => onAddToPlaylist?.(track)} icon={<Music className="h-4 w-4" />}>
              Add to Playlist
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onClick={() => onViewArtist?.(track.artists[0]?.id)} icon={<Music className="h-4 w-4" />}>
              View Artist
            </DropdownItem>
            <DropdownItem onClick={() => onViewAlbum?.(track.album.id)} icon={<Music className="h-4 w-4" />}>
              View Album
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onClick={() => window.open(track.external_urls.spotify, '_blank')} icon={<ExternalLink className="h-4 w-4" />}>
              Open in Spotify
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </td>
    </tr>
  );
}

interface TrackRowSkeletonProps {
  showIndex?: boolean;
}

export function TrackRowSkeleton({ showIndex = true }: TrackRowSkeletonProps) {
  return (
    <tr>
      {showIndex && <td className="px-4 py-3 w-12"><div className="h-4 w-8 skeleton rounded" /></td>}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded skeleton" />
          <div className="space-y-2">
            <div className="h-4 w-32 skeleton" />
            <div className="h-3 w-24 skeleton" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-24 skeleton" /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-16 skeleton" /></td>
      <td className="px-4 py-3 text-right"><div className="h-4 w-8 skeleton" /></td>
    </tr>
  );
}