/**
 * Queue Panel component
 */

import { useState } from 'react';
import { cn } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { TrackRow } from './TrackRow';
import { ScrollArea } from '../ui/ScrollArea';
import type { SpotifyTrack } from '../../types';
import { X, ListMusic, Trash2, GripVertical } from 'lucide-react';

interface QueueProps {
  queue: SpotifyTrack[];
  currentTrack: SpotifyTrack | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayTrack: (track: SpotifyTrack) => void;
  onRemoveTrack: (track: SpotifyTrack) => void;
  onClearQueue: () => void;
}

export function Queue({
  queue,
  currentTrack,
  isOpen,
  onClose,
  onPlayTrack,
  onRemoveTrack,
  onClearQueue,
}: QueueProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed right-0 bottom-20 top-16 z-40 w-96 glass-strong border-l border-white/10 dark:border-black/10',
        'animate-in slide-in-from-right duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
      role="dialog"
      aria-label="Playback queue"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-black/10">
          <div className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            <h3 className="font-semibold">Queue</h3>
            <span className="text-sm text-muted-foreground">({queue.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <Button variant="ghost" size="icon" onClick={onClearQueue} aria-label="Clear queue">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close queue">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Currently Playing */}
        {currentTrack && (
          <div className="p-4 border-b border-white/10 dark:border-black/10 bg-primary/10">
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">Now Playing</p>
            <TrackRow
              track={currentTrack}
              isPlaying={true}
              showIndex={false}
              onPlay={onPlayTrack}
            />
          </div>
        )}

        {/* Queue List */}
        <div className="flex-1 overflow-hidden">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 text-muted-foreground">
              <ListMusic className="h-12 w-12 mb-4 opacity-30" />
              <p className="font-medium">Queue is empty</p>
              <p className="text-sm mt-1">Add tracks to build your queue</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <table className="w-full" role="list" aria-label="Up next">
                <tbody>
                  {queue.map((track, index) => (
                    <TrackRow
                      key={`${track.id}-${index}`}
                      track={track}
                      index={index}
                      isPlaying={false}
                      showIndex={true}
                      onPlay={onPlayTrack}
                      onAddToQueue={() => {}}
                      onAddToPlaylist={() => {}}
                      onViewAlbum={() => {}}
                      onViewArtist={() => {}}
                    />
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}