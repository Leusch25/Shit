/**
 * Music Player Bar - Fixed bottom player
 */

import { useMemo } from 'react';
import { cn } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { useMusic } from '../../contexts/MusicContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Mic,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { formatDuration } from '../../utils/helpers';

export function MusicPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    repeatState,
    shuffleState,
    queue,
    mode,
    play,
    pause,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    setRepeat,
    setShuffle,
    addToQueue,
    clearError,
    error,
  } = useMusic();

  if (mode === 'none' && !error) {
    return null;
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const bufferedPercent = 0; // Would need Web Playback SDK for this

  const handleSeek = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    seek(Math.round((val / 100) * duration));
  };

  const handleVolumeChange = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setVolume(val);
  };

  const toggleRepeat = () => {
    const states: Array<'off' | 'track' | 'context'> = ['off', 'context', 'track'];
    const currentIndex = states.indexOf(repeatState);
    setRepeat(states[(currentIndex + 1) % 3]);
  };

  const toggleShuffle = () => setShuffle(!shuffleState);

  const track = currentTrack;

  return (
    <div
      className={cn(
        'music-player-bar',
        'animate-in slide-up duration-300'
      )}
      role="region"
      aria-label="Music player"
    >
      {error && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-destructive/50 animate-in fade-in" role="alert" />
      )}

      <div className="container-main h-full px-4">
        <div className="flex h-full items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1 lg:max-w-xs">
            {track?.album.images[0] ? (
              <img
                src={track.album.images[0].url}
                alt=""
                className="h-12 w-12 rounded-lg object-cover shadow-lg flex-shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/50 to-accent-green/50 flex items-center justify-center flex-shrink-0">
                <Mic className="h-6 w-6 text-primary/50" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate" title={track?.name}>
                {track?.name || 'No track playing'}
              </p>
              <p className="text-sm text-muted-foreground truncate" title={track?.artists.map((a) => a.name).join(', ')}>
                {track?.artists.map((a) => a.name).join(', ') || 'Unknown artist'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {}}
                aria-label="Add to favorites"
                className="text-muted-foreground hover:text-red-500"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {}}
                aria-label="Add to playlist"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                aria-label={shuffleState ? 'Disable shuffle' : 'Enable shuffle'}
                aria-pressed={shuffleState}
                className={cn(shuffleState && 'text-accent-green')}
              >
                <Shuffle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={previous}
                aria-label="Previous track"
                disabled={mode === 'none'}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                disabled={mode === 'none'}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={next}
                aria-label="Next track"
                disabled={mode === 'none'}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRepeat}
                aria-label={`Repeat: ${repeatState === 'off' ? 'off' : repeatState === 'track' ? 'track' : 'context'}`}
                aria-pressed={repeatState !== 'off'}
                className={cn(repeatState !== 'off' && 'text-accent-green')}
              >
                <Repeat className={cn('h-5 w-5', repeatState === 'track' && '[&>svg]:absolute')} />
                {repeatState === 'track' && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span>
                )}
              </Button>
            </div>
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono tabular-nums w-10 text-right">
                {formatDuration(progress)}
              </span>
              <Slider
                value={progressPercent}
                onValueChange={handleSeek}
                min={0}
                max={100}
                step={0.1}
                disabled={mode === 'none' || duration === 0}
                className="flex-1 h-1.5"
                aria-label="Playback progress"
              />
              <span className="text-xs text-muted-foreground font-mono tabular-nums w-10">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Queue */}
          <div className="flex items-center gap-3 min-w-0 lg:max-w-xs justify-end">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setVolume(volume > 0 ? 0 : 50)}
                aria-label={volume > 0 ? 'Mute' : 'Unmute'}
                aria-pressed={volume === 0}
              >
                {volume > 0 ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                min={0}
                max={100}
                step={1}
                className="w-24 h-1.5"
                aria-label="Volume"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {}}
              aria-label="Open queue"
              className="relative"
            >
              <ListMusic className="h-5 w-5" />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {queue.length > 99 ? '99+' : queue.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {}}
              aria-label="Connect device"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}