/**
 * Supabase client and database service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Session, User } from '@supabase/supabase-js';
import { config } from '../utils/config';
import type {
  UserProfile,
  Game,
  GameSave,
  GameSession,
  PaginatedResponse,
  ApiResponse,
} from '../types';

// ============================================
// Supabase Client Initialization
// ============================================

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    if (!config.supabase.url || !config.supabase.anonKey) {
      throw new Error('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
    supabaseInstance = createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return supabaseInstance;
}

export const supabase = getSupabaseClient();

// ============================================
// Auth Helpers
// ============================================

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// ============================================
// User Profile Service
// ============================================

export async function getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data, error: null };
}

export async function upsertUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<ApiResponse<UserProfile>> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data, error: null };
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserProfile['preferences']>
): Promise<ApiResponse<UserProfile>> {
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', userId)
    .single();

  if (fetchError) {
    return { data: null, error: { code: fetchError.code, message: fetchError.message } };
  }

  const updatedPreferences = { ...profile.preferences, ...preferences };

  const { data, error } = await supabase
    .from('profiles')
    .update({ preferences: updatedPreferences, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data, error: null };
}

// ============================================
// Game Library Service
// ============================================

export interface GetGamesOptions {
  systemId?: string;
  search?: string;
  favoritesOnly?: boolean;
  hidden?: boolean;
  sortBy?: 'title' | 'recent' | 'playtime' | 'play_count' | 'system';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export async function getGames(
  userId: string,
  options: GetGamesOptions = {}
): Promise<ApiResponse<PaginatedResponse<Game>>> {
  const {
    systemId,
    search,
    favoritesOnly = false,
    hidden = false,
    sortBy = 'title',
    sortOrder = 'asc',
    page = 1,
    pageSize = 50,
  } = options;

  let query = supabase
    .from('games')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('hidden', hidden);

  if (systemId) {
    query = query.eq('system_id', systemId);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (favoritesOnly) {
    query = query.eq('favorite', true);
  }

  // Apply sorting
  const sortColumn = sortBy === 'recent' ? 'last_played_at' : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === 'asc', nullsLast: true });

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }

  return {
    data: {
      data: data || [],
      total: count || 0,
      page,
      page_size: pageSize,
      has_more: (count || 0) > to + 1,
    },
    error: null,
  };
}

export async function getGame(gameId: string, userId: string): Promise<ApiResponse<Game>> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .eq('user_id', userId)
    .single();

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data, error: null };
}

export async function addGame(
  game: Omit<Game, 'id' | 'created_at' | 'updated_at' | 'play_count' | 'total_playtime'>
): Promise<ApiResponse<Game>> {
  const { data, error } = await supabase
    .from('games')
    .insert({
      ...game,
      play_count: 0,
      total_playtime: 0,
      favorite: false,
      hidden: false,
      tags: [],
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data, error: null };
}

export async function updateGame(
  gameId: string,
  userId: string,
  updates: Partial<Game>
): Promise<ApiResponse<Game>> {
  const { data, error } = await supabase
    .from('games')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', gameId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data, error: null };
}

export async function deleteGame(gameId: string, userId: string): Promise<ApiResponse<void>> {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId)
    .eq('user_id', userId);

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data: null, error: null };
}

export async function toggleFavorite(gameId: string, userId: string): Promise<ApiResponse<Game>> {
  const { data: game, error: fetchError } = await supabase
    .from('games')
    .select('favorite')
    .eq('id', gameId)
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    return { data: null, error: { code: fetchError.code, message: fetchError.message } };
  }

  return updateGame(gameId, userId, { favorite: !game.favorite });
}

export async function recordPlaySession(
  gameId: string,
  userId: string,
  duration: number
): Promise<ApiResponse<GameSession>> {
  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .insert({
      user_id: userId,
      game_id: gameId,
      started_at: new Date(Date.now() - duration).toISOString(),
      ended_at: new Date().toISOString(),
      duration,
    })
    .select()
    .single();

  if (sessionError) {
    return { data: null, error: { code: sessionError.code, message: sessionError.message } };
  }

  // Update game stats
  await supabase.rpc('increment_game_stats', {
    game_id: gameId,
    play_duration: duration,
  });

  return { data: session, error: null };
}

// ============================================
// Game Saves Service
// ============================================

export async function getGameSaves(gameId: string, userId: string): Promise<ApiResponse<GameSave[]>> {
  const { data, error } = await supabase
    .from('game_saves')
    .select('*')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data: data || [], error: null };
}

export async function createGameSave(
  save: Omit<GameSave, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<GameSave>> {
  const { data, error } = await supabase
    .from('game_saves')
    .insert(save)
    .select()
    .single();

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data, error: null };
}

export async function updateGameSave(
  saveId: string,
  userId: string,
  updates: Partial<GameSave>
): Promise<ApiResponse<GameSave>> {
  const { data, error } = await supabase
    .from('game_saves')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', saveId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data, error: null };
}

export async function deleteGameSave(saveId: string, userId: string): Promise<ApiResponse<void>> {
  const { error } = await supabase
    .from('game_saves')
    .delete()
    .eq('id', saveId)
    .eq('user_id', userId);

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data: null, error: null };
}

// ============================================
// Storage Service (for ROMs, covers, save thumbnails)
// ============================================

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
): Promise<ApiResponse<{ path: string; publicUrl: string }>> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      upsert: options?.upsert ?? false,
    });

  if (error) {
    return { data: null, error: { code: error.name, message: error.message } };
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { data: { path: data.path, publicUrl: urlData.publicUrl }, error: null };
}

export async function downloadFile(bucket: string, path: string): Promise<ApiResponse<Blob>> {
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    return { data: null, error: { code: error.name, message: error.message } };
  }
  return { data, error: null };
}

export async function deleteFile(bucket: string, paths: string[]): Promise<ApiResponse<void>> {
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    return { data: null, error: { code: error.name, message: error.message } };
  }
  return { data: null, error: null };
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ============================================
// Realtime Subscriptions
// ============================================

export function subscribeToGameChanges(
  userId: string,
  callback: (payload: { new: Game | null; old: Game | null; eventType: string }) => void
) {
  return supabase
    .channel(`games:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback({
          new: payload.new as Game | null,
          old: payload.old as Game | null,
          eventType: payload.eventType,
        });
      }
    )
    .subscribe();
}

export function subscribeToGameSaves(
  gameId: string,
  userId: string,
  callback: (payload: { new: GameSave | null; old: GameSave | null; eventType: string }) => void
) {
  return supabase
    .channel(`saves:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_saves',
        filter: `game_id=eq.${gameId} AND user_id=eq.${userId}`,
      },
      (payload) => {
        callback({
          new: payload.new as GameSave | null,
          old: payload.old as GameSave | null,
          eventType: payload.eventType,
        });
      }
    )
    .subscribe();
}

export function unsubscribe(channel: ReturnType<typeof supabase.channel>) {
  supabase.removeChannel(channel);
}