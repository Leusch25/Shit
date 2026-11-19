-- Supabase Database Schema for Retro Gaming Platform
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Custom Types
-- ============================================

CREATE TYPE user_tier AS ENUM ('free', 'premium');
CREATE TYPE system_id AS ENUM ('nes', 'snes', 'gameboy', 'gba', 'n64', 'ps1', 'genesis', 'arcade', 'dos');
CREATE TYPE theme_mode AS ENUM ('light', 'dark', 'system');
CREATE TYPE music_quality AS ENUM ('low', 'medium', 'high', 'very_high');

-- ============================================
-- Profiles Table (extends auth.users)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  tier user_tier DEFAULT 'free',
  spotify_connected BOOLEAN DEFAULT FALSE,
  spotify_user_id TEXT,
  spotify_access_token TEXT,
  spotify_refresh_token TEXT,
  spotify_token_expires_at TIMESTAMPTZ,
  preferences JSONB NOT NULL DEFAULT '{
    "theme": "system",
    "language": "en",
    "auto_save_enabled": true,
    "cloud_sync_enabled": true,
    "music_quality": "high",
    "emulator_settings": {
      "video_driver": "gl",
      "audio_driver": "web",
      "aspect_ratio": "4:3",
      "integer_scaling": true,
      "vsync": true,
      "bilinear_filter": false,
      "rewind_enabled": true,
      "fast_forward_ratio": 2
    }
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Games Table
-- ============================================

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_id system_id NOT NULL,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  hash_md5 TEXT NOT NULL,
  hash_sha1 TEXT NOT NULL,
  cover_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  play_count INTEGER DEFAULT 0,
  total_playtime INTEGER DEFAULT 0, -- in seconds
  last_played_at TIMESTAMPTZ,
  favorite BOOLEAN DEFAULT FALSE,
  hidden BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_system_id ON games(system_id);
CREATE INDEX idx_games_favorite ON games(user_id, favorite) WHERE favorite = TRUE;
CREATE INDEX idx_games_last_played ON games(user_id, last_played_at DESC);
CREATE INDEX idx_games_search ON games USING GIN (to_tsvector('english', title));
CREATE INDEX idx_games_tags ON games USING GIN (tags);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Users can view own games" ON games
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games" ON games
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own games" ON games
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own games" ON games
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Game Saves Table (Save States)
-- ============================================

CREATE TABLE game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  slot INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  data TEXT NOT NULL, -- Base64 encoded save state
  thumbnail TEXT, -- Base64 encoded screenshot
  size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, slot)
);

-- Indexes
CREATE INDEX idx_game_saves_game_id ON game_saves(game_id);
CREATE INDEX idx_game_saves_user_id ON game_saves(user_id);

-- Enable RLS
ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saves" ON game_saves
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves" ON game_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saves" ON game_saves
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves" ON game_saves
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Game Sessions Table (Play History)
-- ============================================

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration INTEGER NOT NULL, -- in seconds
  save_slot_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_game_sessions_started_at ON game_sessions(started_at DESC);

-- Enable RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON game_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Playlists Table (User-created music playlists)
-- ============================================

CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  track_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- in milliseconds
  public BOOLEAN DEFAULT FALSE,
  collaborative BOOLEAN DEFAULT FALSE,
  spotify_playlist_id TEXT, -- For synced Spotify playlists
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own playlists" ON playlists
  FOR SELECT USING (auth.uid() = user_id OR public = TRUE);

CREATE POLICY "Users can insert own playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" ON playlists
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Playlist Tracks Table
-- ============================================

CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_uri TEXT NOT NULL, -- Spotify track URI
  track_data JSONB NOT NULL, -- Cached track metadata
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(playlist_id, position)
);

-- Enable RLS
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view playlist tracks" ON playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists p
      WHERE p.id = playlist_tracks.playlist_id
      AND (p.user_id = auth.uid() OR p.public = TRUE)
    )
  );

CREATE POLICY "Users can manage own playlist tracks" ON playlist_tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM playlists p
      WHERE p.id = playlist_tracks.playlist_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================
-- Achievements Table (Future)
-- ============================================

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  system_id system_id,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  points INTEGER DEFAULT 0,
  rarity TEXT, -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (TRUE);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- Netplay Sessions Table (Future)
-- ============================================

CREATE TABLE netplay_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT,
  max_players INTEGER DEFAULT 2,
  current_players INTEGER DEFAULT 1,
  status TEXT DEFAULT 'waiting', -- 'waiting', 'active', 'finished'
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

CREATE TABLE netplay_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES netplay_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot INTEGER NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(session_id, slot)
);

ALTER TABLE netplay_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE netplay_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public sessions" ON netplay_sessions FOR SELECT USING (status = 'waiting' OR host_id = auth.uid());
CREATE POLICY "Users can join sessions" ON netplay_players FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Helper Functions
-- ============================================

-- Function to increment game stats
CREATE OR REPLACE FUNCTION increment_game_stats(game_id UUID, play_duration INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE games
  SET
    play_count = play_count + 1,
    total_playtime = total_playtime + play_duration,
    last_played_at = NOW(),
    updated_at = NOW()
  WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_saves_updated_at BEFORE UPDATE ON game_saves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Storage Buckets (Create via Supabase Dashboard or CLI)
-- ============================================

-- Buckets needed:
-- 1. 'roms' - Private, for game ROM files
-- 2. 'covers' - Public, for game cover images
-- 3. 'saves' - Private, for save state thumbnails
-- 4. 'avatars' - Public, for user avatars

-- Example RLS policies for storage (run after creating buckets):

-- ROMs bucket (private)
-- CREATE POLICY "Users can upload own ROMs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'roms' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can view own ROMs" ON storage.objects FOR SELECT USING (bucket_id = 'roms' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own ROMs" ON storage.objects FOR DELETE USING (bucket_id = 'roms' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Covers bucket (public)
-- CREATE POLICY "Anyone can view covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
-- CREATE POLICY "Users can upload covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- Realtime Publications (Enable in Supabase Dashboard)
-- ============================================

-- Enable realtime for tables:
-- ALTER PUBLICATION supabase_realtime ADD TABLE games;
-- ALTER PUBLICATION supabase_realtime ADD TABLE game_saves;
-- ALTER PUBLICATION supabase_realtime ADD TABLE playlists;
-- ALTER PUBLICATION supabase_realtime ADD TABLE playlist_tracks;