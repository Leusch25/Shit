/**
 * Music Context with Spotify Web Playback SDK + Web API fallback
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import {
  initializePlayer,
  disconnectPlayer,
  getPlayer,
  getDeviceId,
  onPlaybackStateChange,
  onDeviceReady,
  startWebApiPolling,
  stopWebApiPolling,
  onWebApiStateChange,
  webApiPlay,
  webApiPause,
  webApiNext,
  webApiPrevious,
  webApiSeek,
  webApiSetVolume,
  webApiSetRepeat,
  webApiSetShuffle,
  getWebApiState,
  getValidAccessToken,
  getAvailableDevices,
  transferPlayback,
  getQueue,
  getCurrentUser,
} from '../services/spotify';
import type { SpotifyTrack, PlaybackState, SpotifyDevice, WebApiPlayerState } from '../types';
import { useAuth } from './AuthContext';

export type PlayerMode = 'web-playback' | 'web-api' | 'none';

interface MusicContextType {
  // State
  mode: PlayerMode;
  isPremium: boolean;
  playbackState: PlaybackState | null;
  webApiState: WebApiPlayerState | null;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  repeatState: 'off' | 'track' | 'context';
  shuffleState: boolean;
  queue: SpotifyTrack[];
  devices: SpotifyDevice[];
  activeDevice: SpotifyDevice | null;
  loading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  play: (contextUri?: string, uris?: string[]) => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setRepeat: (state: 'off' | 'track' | 'context') => Promise<void>;
  setShuffle: (state: boolean) => Promise<void>;
  transferToDevice: (deviceId: string) => Promise<void>;
  refreshDevices: () => Promise<void>;
  addToQueue: (uri: string) => Promise<void>;
  clearError: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();

  const [mode, setMode] = useState<PlayerMode>('none');
  const [isPremium, setIsPremium] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const [webApiState, setWebApiState] = useState<WebApiPlayerState | null>(null);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [activeDevice, setActiveDevice] = useState<SpotifyDevice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playerRef = useRef<ReturnType<typeof getPlayer>>(null);
  const deviceIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  // Derived state
  const currentTrack = playbackState?.item ?? webApiState?.currentTrack ?? null;
  const isPlaying = playbackState?.is_playing ?? webApiState?.isPlaying ?? false;
  const progress = playbackState?.progress_ms ?? webApiState?.progressMs ?? 0;
  const duration = playbackState?.item?.duration_ms ?? webApiState?.durationMs ?? 0;
  const volume = playbackState?.device.volume_percent ?? webApiState?.volume ?? 50;
  const repeatState = playbackState?.repeat_state ?? webApiState?.repeatState ?? 'off';
  const shuffleState = playbackState?.shuffle_state ?? webApiState?.shuffleState ?? false;
  const queue = webApiState?.queue ?? [];

  const clearError = useCallback(() => setError(null), []);

  const refreshDevices = useCallback(async () => {
    try {
      const deviceList = await getAvailableDevices();
      setDevices(deviceList);
      const active = deviceList.find((d) => d.is_active);
      if (active) setActiveDevice(active);
    } catch (err) {
      console.error('Failed to refresh devices:', err);
    }
  }, []);

  const initialize = useCallback(async () => {
    if (initializedRef.current || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Check if user has Spotify connected
      if (!profile?.spotify_connected) {
        setMode('none');
        setLoading(false);
        initializedRef.current = true;
        return;
      }

      // Get user profile to check premium status
      try {
        const spotifyUser = await getCurrentUser();
        setIsPremium(spotifyUser.product === 'premium');
      } catch {
        setIsPremium(false);
      }

      // Try Web Playback SDK first (requires Premium)
      if (isPremium) {
        try {
          await initializePlayer('RetroPlay', 0.5);
          playerRef.current = getPlayer();
          deviceIdRef.current = getDeviceId();

          // Listen for state changes
          const unsubPlayback = onPlaybackStateChange(setPlaybackState);
          const unsubDevice = onDeviceReady((id) => {
            deviceIdRef.current = id;
            // Transfer playback to this device
            transferPlayback([id], true).catch(console.error);
          });

          // Store cleanup functions
          (window as any).__spotify_cleanup = () => {
            unsubPlayback();
            unsubDevice();
          };

          setMode('web-playback');
          setLoading(false);
          initializedRef.current = true;
          return;
        } catch (sdkError) {
          console.warn('Web Playback SDK failed, falling back to Web API:', sdkError);
        }
      }

      // Fallback to Web API (works for Free and Premium)
      try {
        await startWebApiPolling();
        const unsubWebApi = onWebApiStateChange(setWebApiState);
        (window as any).__spotify_cleanup = () => {
          stopWebApiPolling();
          unsubWebApi();
        };
        await refreshDevices();
        setMode('web-api');
      } catch (apiError) {
        console.error('Web API initialization failed:', apiError);
        setMode('none');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize music player');
      setMode('none');
    } finally {
      setLoading(false);
      initializedRef.current = true;
    }
  }, [user, profile?.spotify_connected, isPremium, refreshDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ((window as any).__spotify_cleanup) {
        (window as any).__spotify_cleanup();
      }
      disconnectPlayer();
      stopWebApiPolling();
    };
  }, []);

  // Auto-initialize when user/profile changes
  useEffect(() => {
    if (user && profile?.spotify_connected && !initializedRef.current) {
      initialize();
    }
  }, [user, profile?.spotify_connected, initialize]);

  const play = useCallback(async (contextUri?: string, uris?: string[]) => {
    if (mode === 'web-playback') {
      const player = getPlayer();
      if (player) {
        await player.resume();
      }
    } else if (mode === 'web-api') {
      await webApiPlay(contextUri, uris);
    }
  }, [mode]);

  const pause = useCallback(async () => {
    if (mode === 'web-playback') {
      const player = getPlayer();
      if (player) {
        await player.pause();
      }
    } else if (mode === 'web-api') {
      await webApiPause();
    }
  }, [mode]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  const next = useCallback(async () => {
    if (mode === 'web-playback') {
      const player = getPlayer();
      if (player) {
        await player.nextTrack();
      }
    } else if (mode === 'web-api') {
      await webApiNext();
    }
  }, [mode]);

  const previous = useCallback(async () => {
    if (mode === 'web-playback') {
      const player = getPlayer();
      if (player) {
        await player.previousTrack();
      }
    } else if (mode === 'web-api') {
      await webApiPrevious();
    }
  }, [mode]);

  const seek = useCallback(async (positionMs: number) => {
    if (mode === 'web-playback') {
      const player = getPlayer();
      if (player) {
        await player.seek(positionMs);
      }
    } else if (mode === 'web-api') {
      await webApiSeek(positionMs);
    }
  }, [mode]);

  const setVolume = useCallback(async (volume: number) => {
    if (mode === 'web-playback') {
      const player = getPlayer();
      if (player) {
        await player.setVolume(volume / 100);
      }
    } else if (mode === 'web-api') {
      await webApiSetVolume(volume);
    }
  }, [mode]);

  const setRepeat = useCallback(async (state: 'off' | 'track' | 'context') => {
    if (mode === 'web-playback') {
      // Web Playback SDK doesn't have direct repeat control, use Web API
      await setRepeat(state);
    } else if (mode === 'web-api') {
      await webApiSetRepeat(state);
    }
  }, [mode]);

  const setShuffle = useCallback(async (state: boolean) => {
    if (mode === 'web-playback') {
      await setShuffle(state);
    } else if (mode === 'web-api') {
      await webApiSetShuffle(state);
    }
  }, [mode]);

  const transferToDevice = useCallback(async (deviceId: string) => {
    await transferPlayback([deviceId], true);
    await refreshDevices();
  }, [refreshDevices]);

  const addToQueue = useCallback(async (uri: string) => {
    // This would need Web API call
    try {
      const token = await getValidAccessToken();
      if (token) {
        await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error('Failed to add to queue:', err);
    }
  }, []);

  return (
    <MusicContext.Provider
      value={{
        mode,
        isPremium,
        playbackState,
        webApiState,
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        repeatState,
        shuffleState,
        queue,
        devices,
        activeDevice,
        loading,
        error,
        initialize,
        play,
        pause,
        togglePlay,
        next,
        previous,
        seek,
        setVolume,
        setRepeat,
        setShuffle,
        transferToDevice,
        refreshDevices,
        addToQueue,
        clearError,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicContextType {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}