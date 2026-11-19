/**
 * Core type definitions for the Retro Gaming Platform
 */

// ============================================
// User & Authentication Types
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  tier: 'free' | 'premium';
  spotify_connected: boolean;
  spotify_user_id?: string;
  created_at: string;
  updated_at: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  auto_save_enabled: boolean;
  cloud_sync_enabled: boolean;
  music_quality: 'low' | 'medium' | 'high' | 'very_high';
  emulator_settings: EmulatorSettings;
}

export interface EmulatorSettings {
  video_driver: 'gl' | 'vulkan' | 'software';
  audio_driver: 'wasapi' | 'alsa' | 'pulse' | 'web';
  aspect_ratio: '4:3' | '16:9' | 'core' | 'custom';
  integer_scaling: boolean;
  vsync: boolean;
  bilinear_filter: boolean;
  shader?: string;
  rewind_enabled: boolean;
  fast_forward_ratio: number;
}

// ============================================
// Game & Emulation Types
// ============================================

export type SystemId =
  | 'nes'
  | 'snes'
  | 'gameboy'
  | 'gba'
  | 'n64'
  | 'ps1'
  | 'genesis'
  | 'arcade'
  | 'dos';

export interface SystemInfo {
  id: SystemId;
  name: string;
  short_name: string;
  manufacturer: string;
  release_year: number;
  description: string;
  extensions: string[];
  cores: CoreInfo[];
  color: string;
  icon: string;
}

export interface CoreInfo {
  id: string;
  name: string;
  version: string;
  author: string;
  url: string;
  extensions: string[];
  features: CoreFeature[];
}

export type CoreFeature =
  | 'save_states'
  | 'rewind'
  | 'netplay'
  | 'achievements'
  | 'cheats'
  | 'screenshots'
  | 'video_record';

export interface Game {
  id: string;
  user_id: string;
  system_id: SystemId;
  title: string;
  filename: string;
  file_path: string;
  file_size: number;
  hash_md5: string;
  hash_sha1: string;
  cover_url?: string;
  metadata: GameMetadata;
  play_count: number;
  total_playtime: number;
  last_played_at?: string;
  favorite: boolean;
  hidden: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface GameMetadata {
  title?: string;
  publisher?: string;
  developer?: string;
  release_date?: string;
  genre?: string[];
  players?: number;
  description?: string;
  region?: string;
  language?: string[];
  rating?: string;
  crc32?: string;
  serial?: string;
}

export interface GameSave {
  id: string;
  user_id: string;
  game_id: string;
  slot: number;
  name: string;
  data: string; // base64 encoded save state
  thumbnail?: string; // base64 encoded screenshot
  size: number;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_id: string;
  started_at: string;
  ended_at?: string;
  duration: number;
  save_slot_used?: number;
}

// ============================================
// Music & Spotify Types
// ============================================

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  product: 'free' | 'premium' | 'open';
  country: string;
  followers: { total: number };
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  explicit: boolean;
  external_urls: { spotify: string };
  preview_url: string | null;
  uri: string;
  is_playable: boolean;
  popularity: number;
  track_number: number;
  disc_number: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: { spotify: string };
  uri: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  images: SpotifyImage[];
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  total_tracks: number;
  type: 'album' | 'single' | 'compilation';
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  tracks: { total: number };
  owner: SpotifyUser;
  public: boolean;
  collaborative: boolean;
  external_urls: { spotify: string };
  uri: string;
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_restricted: boolean;
  name: string;
  type: 'Computer' | 'Smartphone' | 'Speaker' | 'TV' | 'AVR' | 'STB' | 'AudioDongle' | 'GameConsole' | 'CastVideo' | 'CastAudio' | 'Automobile' | 'Unknown';
  volume_percent: number | null;
  supports_volume: boolean;
}

export interface PlaybackState {
  device: SpotifyDevice;
  repeat_state: 'off' | 'track' | 'context';
  shuffle_state: boolean;
  context: PlaybackContext | null;
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: SpotifyTrack | null;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  actions: PlaybackActions;
}

export interface PlaybackContext {
  type: 'artist' | 'playlist' | 'album' | 'show' | 'episode';
  href: string;
  external_urls: { spotify: string };
  uri: string;
}

export interface PlaybackActions {
  pausing: boolean;
  resuming: boolean;
  seeking: boolean;
  skipping_next: boolean;
  skipping_prev: boolean;
  toggling_repeat_context: boolean;
  toggling_shuffle: boolean;
  toggling_repeat_track: boolean;
  transferring_playback: boolean;
}

export interface QueueItem {
  id: string;
  track: SpotifyTrack;
  added_at: string;
  added_by: string;
}

// ============================================
// UI & Component Types
// ============================================

export type ViewMode = 'grid' | 'list' | 'compact';

export interface FilterState {
  systems: SystemId[];
  search: string;
  favoritesOnly: boolean;
  hidden: boolean;
  sortBy: 'title' | 'recent' | 'playtime' | 'play_count' | 'system';
  sortOrder: 'asc' | 'desc';
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface DropdownItem {
  label?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  children?: React.ReactNode;
}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

// ============================================
// Environment & Config Types
// ============================================

export interface AppConfig {
  supabase: {
    url: string;
    anon_key: string;
  };
  spotify: {
    client_id: string;
    redirect_uri: string;
    scopes: string[];
  };
  emulator: {
    retroarch_cdn: string;
    cores_cdn: string;
  };
  features: {
    cloud_saves: boolean;
    netplay: boolean;
    achievements: boolean;
    spotify_integration: boolean;
  };
}