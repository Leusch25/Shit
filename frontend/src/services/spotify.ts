/**
 * Spotify Web API and Web Playback SDK service
 */

import { config } from '../utils/config';
import type {
  SpotifyTokenResponse,
  SpotifyUser,
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyDevice,
  PlaybackState,
  QueueItem,
} from '../types';

// Re-export types for convenience
export type {
  SpotifyTokenResponse,
  SpotifyUser,
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyDevice,
  PlaybackState,
  QueueItem,
};

// ============================================
// OAuth & Token Management
// ============================================

const TOKEN_KEY = 'spotify_tokens';
const STATE_KEY = 'spotify_auth_state';

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function pkceChallenge(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateState() + generateState();
  const challenge = btoa(
    String.fromCharCode(...new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
    ))
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return { verifier, challenge };
}

// Simplified PKCE for now - using state only
export function getAuthUrl(): { url: string; state: string } {
  const state = generateState();
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: config.spotify.clientId,
    response_type: 'code',
    redirect_uri: config.spotify.redirectUri,
    scope: config.spotify.scopes.join(' '),
    state,
    show_dialog: 'true',
  });

  return {
    url: `https://accounts.spotify.com/authorize?${params.toString()}`,
    state,
  };
}

export async function exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
  const params = new URLSearchParams({
    client_id: config.spotify.clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.spotify.redirectUri,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to exchange code for tokens');
  }

  const data: SpotifyTokenResponse = await response.json();
  const tokens: SpotifyTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token!,
    expires_at: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };

  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  return tokens;
}

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
  const params = new URLSearchParams({
    client_id: config.spotify.clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data: SpotifyTokenResponse = await response.json();
  const tokens: SpotifyTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };

  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  return tokens;
}

export function getStoredTokens(): SpotifyTokens | null {
  const stored = sessionStorage.getItem(TOKEN_KEY);
  if (!stored) return null;

  try {
    const tokens: SpotifyTokens = JSON.parse(stored);
    // Check if token is expired (with 30s buffer)
    if (tokens.expires_at - Date.now() < 30000) {
      return null;
    }
    return tokens;
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(STATE_KEY);
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  // Token still valid
  if (tokens.expires_at - Date.now() > 30000) {
    return tokens.access_token;
  }

  // Try to refresh
  try {
    const newTokens = await refreshAccessToken(tokens.refresh_token);
    return newTokens.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

// ============================================
// Web API Service
// ============================================

const API_BASE = 'https://api.spotify.com/v1';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error('No valid access token');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    clearTokens();
    throw new Error('Unauthorized - token expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// User Profile
export async function getCurrentUser(): Promise<SpotifyUser> {
  return apiRequest<SpotifyUser>('/me');
}

// Playback
export async function getPlaybackState(): Promise<PlaybackState | null> {
  try {
    return await apiRequest<PlaybackState>('/me/player');
  } catch (error) {
    if ((error as Error).message.includes('204') || (error as Error).message.includes('No active device')) {
      return null;
    }
    throw error;
  }
}

export async function getAvailableDevices(): Promise<SpotifyDevice[]> {
  const response = await apiRequest<{ devices: SpotifyDevice[] }>('/me/player/devices');
  return response.devices;
}

export async function transferPlayback(deviceIds: string[], play = false): Promise<void> {
  await apiRequest('/me/player', {
    method: 'PUT',
    body: JSON.stringify({ device_ids: deviceIds, play }),
  });
}

export async function play(contextUri?: string, uris?: string[], offset?: { position: number }): Promise<void> {
  await apiRequest('/me/player/play', {
    method: 'PUT',
    body: JSON.stringify({ context_uri: contextUri, uris, offset }),
  });
}

export async function pause(): Promise<void> {
  await apiRequest('/me/player/pause', { method: 'PUT' });
}

export async function nextTrack(): Promise<void> {
  await apiRequest('/me/player/next', { method: 'POST' });
}

export async function previousTrack(): Promise<void> {
  await apiRequest('/me/player/previous', { method: 'POST' });
}

export async function seek(positionMs: number): Promise<void> {
  await apiRequest(`/me/player/seek?position_ms=${positionMs}`, { method: 'PUT' });
}

export async function setVolume(volumePercent: number): Promise<void> {
  await apiRequest(`/me/player/volume?volume_percent=${volumePercent}`, { method: 'PUT' });
}

export async function setRepeat(state: 'off' | 'track' | 'context'): Promise<void> {
  await apiRequest(`/me/player/repeat?state=${state}`, { method: 'PUT' });
}

export async function setShuffle(state: boolean): Promise<void> {
  await apiRequest(`/me/player/shuffle?state=${state}`, { method: 'PUT' });
}

export async function addToQueue(uri: string): Promise<void> {
  await apiRequest(`/me/player/queue?uri=${encodeURIComponent(uri)}`, { method: 'POST' });
}

export async function getRecentlyPlayed(limit = 20): Promise<{ items: Array<{ track: SpotifyTrack; played_at: string }> }> {
  return apiRequest(`/me/player/recently-played?limit=${limit}`);
}

export async function getQueue(): Promise<{ currently_playing: SpotifyTrack; queue: SpotifyTrack[] }> {
  return apiRequest('/me/player/queue');
}

// Library
export async function getSavedTracks(limit = 50, offset = 0): Promise<{ items: Array<{ track: SpotifyTrack; added_at: string }> }> {
  return apiRequest(`/me/tracks?limit=${limit}&offset=${offset}`);
}

export async function saveTracks(ids: string[]): Promise<void> {
  await apiRequest('/me/tracks', {
    method: 'PUT',
    body: JSON.stringify({ ids }),
  });
}

export async function removeSavedTracks(ids: string[]): Promise<void> {
  await apiRequest(`/me/tracks?ids=${ids.join(',')}`, { method: 'DELETE' });
}

export async function getUserPlaylists(limit = 50): Promise<{ items: SpotifyPlaylist[] }> {
  return apiRequest(`/me/playlists?limit=${limit}`);
}

export async function getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
  return apiRequest(`/playlists/${playlistId}`);
}

export async function getPlaylistTracks(playlistId: string, limit = 100, offset = 0): Promise<{ items: Array<{ track: SpotifyTrack }> }> {
  return apiRequest(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
}

// Search
export async function search(
  query: string,
  types: ('track' | 'artist' | 'album' | 'playlist')[],
  limit = 20
): Promise<{
  tracks?: { items: SpotifyTrack[] };
  artists?: { items: SpotifyArtist[] };
  albums?: { items: SpotifyAlbum[] };
  playlists?: { items: SpotifyPlaylist[] };
}> {
  const params = new URLSearchParams({
    q: query,
    type: types.join(','),
    limit: limit.toString(),
  });
  return apiRequest(`/search?${params.toString()}`);
}

// Recommendations
export async function getRecommendations(
  seedTracks?: string[],
  seedArtists?: string[],
  seedGenres?: string[],
  limit = 20
): Promise<{ tracks: SpotifyTrack[] }> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (seedTracks?.length) params.append('seed_tracks', seedTracks.join(','));
  if (seedArtists?.length) params.append('seed_artists', seedArtists.join(','));
  if (seedGenres?.length) params.append('seed_genres', seedGenres.join(','));
  return apiRequest(`/recommendations?${params.toString()}`);
}

// ============================================
// Web Playback SDK
// ============================================

declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyWebPlaybackPlayer;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export interface SpotifyWebPlaybackPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: string, callback: (...args: unknown[]) => void): void;
  removeListener(event: string, callback: (...args: unknown[]) => void): void;
  getCurrentState(): Promise<PlaybackState | null>;
  setName(name: string): Promise<void>;
  getVolume(): Promise<number>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
}

let playerInstance: SpotifyWebPlaybackPlayer | null = null;
let deviceId: string | null = null;
let playbackStateListeners: Set<(state: PlaybackState) => void> = new Set();
let deviceReadyListeners: Set<(deviceId: string) => void> = new Set();

export function loadWebPlaybackSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Spotify?.Player) {
      resolve();
      return;
    }

    // Check if script already loading
    const existingScript = document.getElementById('spotify-web-playback-sdk');
    if (existingScript) {
      window.onSpotifyWebPlaybackSDKReady = () => resolve();
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => resolve();

    const script = document.createElement('script');
    script.id = 'spotify-web-playback-sdk';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    script.onerror = () => reject(new Error('Failed to load Spotify Web Playback SDK'));
    document.head.appendChild(script);
  });
}

export async function initializePlayer(
  name: string,
  volume = 0.5
): Promise<{ player: SpotifyWebPlaybackPlayer; deviceId: string }> {
  await loadWebPlaybackSDK();

  const token = await getValidAccessToken();
  if (!token) {
    throw new Error('No valid access token for Web Playback SDK');
  }

  playerInstance = new window.Spotify.Player({
    name,
    getOAuthToken: (callback) => callback(token),
    volume,
  });

  // Error handling
  playerInstance.addListener('initialization_error', ({ message }) => {
    console.error('Spotify Player initialization error:', message);
  });

  playerInstance.addListener('authentication_error', ({ message }) => {
    console.error('Spotify Player authentication error:', message);
  });

  playerInstance.addListener('account_error', ({ message }) => {
    console.error('Spotify Player account error:', message);
  });

  playerInstance.addListener('playback_error', ({ message }) => {
    console.error('Spotify Player playback error:', message);
  });

  // Ready
  playerInstance.addListener('ready', ({ device_id }) => {
    deviceId = device_id;
    console.log('Spotify Player ready with device ID:', device_id);
    deviceReadyListeners.forEach((listener) => listener(device_id));
  });

  // State changes
  playerInstance.addListener('player_state_changed', (state) => {
    if (state) {
      playbackStateListeners.forEach((listener) => listener(state));
    }
  });

  // Connect
  const connected = await playerInstance.connect();
  if (!connected) {
    throw new Error('Failed to connect to Spotify Player');
  }

  return { player: playerInstance, deviceId: deviceId! };
}

export function getPlayer(): SpotifyWebPlaybackPlayer | null {
  return playerInstance;
}

export function getDeviceId(): string | null {
  return deviceId;
}

export function onPlaybackStateChange(listener: (state: PlaybackState) => void): () => void {
  playbackStateListeners.add(listener);
  return () => playbackStateListeners.delete(listener);
}

export function onDeviceReady(listener: (deviceId: string) => void): () => void {
  deviceReadyListeners.add(listener);
  return () => deviceReadyListeners.delete(listener);
}

export async function disconnectPlayer(): Promise<void> {
  if (playerInstance) {
    playerInstance.disconnect();
    playerInstance = null;
    deviceId = null;
  }
}

// ============================================
// Web API Fallback (for Free tier)
// ============================================

export interface WebApiPlayerState {
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  progressMs: number;
  durationMs: number;
  device: SpotifyDevice | null;
  volume: number;
  repeatState: 'off' | 'track' | 'context';
  shuffleState: boolean;
  queue: SpotifyTrack[];
}

let webApiState: WebApiPlayerState = {
  isPlaying: false,
  currentTrack: null,
  progressMs: 0,
  durationMs: 0,
  device: null,
  volume: 50,
  repeatState: 'off',
  shuffleState: false,
  queue: [],
};

const webApiListeners: Set<(state: WebApiPlayerState) => void> = new Set();
let pollingInterval: ReturnType<typeof setInterval> | null = null;

function notifyWebApiListeners() {
  webApiListeners.forEach((listener) => listener({ ...webApiState }));
}

export function onWebApiStateChange(listener: (state: WebApiPlayerState) => void): () => void {
  webApiListeners.add(listener);
  // Immediately notify with current state
  listener({ ...webApiState });
  return () => webApiListeners.delete(listener);
}

export async function startWebApiPolling(intervalMs = 2000): Promise<void> {
  if (pollingInterval) return;

  const poll = async () => {
    try {
      const state = await getPlaybackState();
      if (state) {
        webApiState = {
          isPlaying: state.is_playing,
          currentTrack: state.item,
          progressMs: state.progress_ms,
          durationMs: state.item?.duration_ms || 0,
          device: state.device,
          volume: state.device.volume_percent || 50,
          repeatState: state.repeat_state,
          shuffleState: state.shuffle_state,
          queue: [], // Would need separate queue call
        };
        notifyWebApiListeners();
      }
    } catch (error) {
      console.error('Web API polling error:', error);
    }
  };

  await poll(); // Initial poll
  pollingInterval = setInterval(poll, intervalMs);
}

export function stopWebApiPolling(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

export async function webApiPlay(contextUri?: string, uris?: string[]): Promise<void> {
  await play(contextUri, uris);
  // Update local state optimistically
  webApiState.isPlaying = true;
  notifyWebApiListeners();
}

export async function webApiPause(): Promise<void> {
  await pause();
  webApiState.isPlaying = false;
  notifyWebApiListeners();
}

export async function webApiNext(): Promise<void> {
  await nextTrack();
  // State will update on next poll
}

export async function webApiPrevious(): Promise<void> {
  await previousTrack();
}

export async function webApiSeek(positionMs: number): Promise<void> {
  await seek(positionMs);
  webApiState.progressMs = positionMs;
  notifyWebApiListeners();
}

export async function webApiSetVolume(volume: number): Promise<void> {
  await setVolume(volume);
  webApiState.volume = volume;
  notifyWebApiListeners();
}

export async function webApiSetRepeat(state: 'off' | 'track' | 'context'): Promise<void> {
  await setRepeat(state);
  webApiState.repeatState = state;
  notifyWebApiListeners();
}

export async function webApiSetShuffle(state: boolean): Promise<void> {
  await setShuffle(state);
  webApiState.shuffleState = state;
  notifyWebApiListeners();
}

export function getWebApiState(): WebApiPlayerState {
  return { ...webApiState };
}