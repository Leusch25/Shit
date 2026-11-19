/**
 * Music Page - Spotify Integration
 */

import { useState, useEffect } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { Queue } from '../components/music/Queue';
import { PlaylistCard } from '../components/music/PlaylistCard';
import { TrackRow } from '../components/music/TrackRow';
import { SearchInput } from '../components/common/SearchInput';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { ScrollArea } from '../components/ui/ScrollArea';
import { Skeleton, SkeletonMusicPlayer } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { Modal, ModalContent } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Plus,
  Search,
  ListMusic,
  Volume2,
  VolumeX,
  Mic,
  Album,
  User,
  Clock,
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
  X,
} from 'lucide-react';
import { formatDuration } from '../utils/helpers';
import type { SpotifyTrack, SpotifyPlaylist, SpotifyAlbum, SpotifyArtist, PlaybackState } from '../types';

const mockTracks: SpotifyTrack[] = [
  {
    id: '1',
    name: 'Super Mario Bros. Theme',
    artists: [{ id: '1', name: 'Koji Kondo', external_urls: {}, uri: '' }],
    album: { id: '1', name: 'Super Mario Bros. OST', artists: [], images: [{ url: '', height: 64, width: 64 }], release_date: '1985', release_date_precision: 'year', total_tracks: 20, type: 'album', uri: '' },
    duration_ms: 123000,
    explicit: false,
    external_urls: { spotify: '' },
    preview_url: null,
    uri: 'spotify:track:1',
    is_playable: true,
    popularity: 80,
    track_number: 1,
    disc_number: 1,
  },
  {
    id: '2',
    name: 'Green Hill Zone',
    artists: [{ id: '2', name: 'Masato Nakamura', external_urls: {}, uri: '' }],
    album: { id: '2', name: 'Sonic the Hedgehog OST', artists: [], images: [{ url: '', height: 64, width: 64 }], release_date: '1991', release_date_precision: 'year', total_tracks: 15, type: 'album', uri: '' },
    duration_ms: 145000,
    explicit: false,
    external_urls: { spotify: '' },
    preview_url: null,
    uri: 'spotify:track:2',
    is_playable: true,
    popularity: 85,
    track_number: 1,
    disc_number: 1,
  },
  {
    id: '3',
    name: 'Pokemon Red/Blue Main Theme',
    artists: [{ id: '3', name: 'Junichi Masuda', external_urls: {}, uri: '' }],
    album: { id: '3', name: 'Pokemon Red/Blue OST', artists: [], images: [{ url: '', height: 64, width: 64 }], release_date: '1996', release_date_precision: 'year', total_tracks: 50, type: 'album', uri: '' },
    duration_ms: 180000,
    explicit: false,
    external_urls: { spotify: '' },
    preview_url: null,
    uri: 'spotify:track:3',
    is_playable: true,
    popularity: 90,
    track_number: 1,
    disc_number: 1,
  },
];

const mockPlaylists: SpotifyPlaylist[] = [
  {
    id: '1',
    name: 'Retro Gaming Classics',
    description: 'The best video game music from the 8-bit and 16-bit eras',
    images: [{ url: '', height: 300, width: 300 }],
    tracks: { total: 50 },
    owner: { id: '1', display_name: 'RetroPlay', email: '', images: [], product: 'premium', country: 'US', followers: { total: 1000 } },
    public: true,
    collaborative: false,
    external_urls: { spotify: '' },
    uri: 'spotify:playlist:1',
  },
  {
    id: '2',
    name: 'Chiptune Essentials',
    description: 'Pure 8-bit and 16-bit chiptune masterpieces',
    images: [{ url: '', height: 300, width: 300 }],
    tracks: { total: 100 },
    owner: { id: '1', display_name: 'RetroPlay', email: '', images: [], product: 'premium', country: 'US', followers: { total: 1000 } },
    public: true,
    collaborative: false,
    external_urls: { spotify: '' },
    uri: 'spotify:playlist:2',
  },
];

export function Music() {
  const { user, profile } = useAuth();
  const {
    mode,
    isPremium,
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
  } = useMusic();

  const [showQueue, setShowQueue] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    tracks: SpotifyTrack[];
    albums: SpotifyAlbum[];
    artists: SpotifyArtist[];
    playlists: SpotifyPlaylist[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'playlists' | 'search'>('browse');

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleSeek = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    seek(Math.round((val / 100) * duration));
  };

  const handleVolumeChange = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setVolume(val);
  };

  const toggleRepeatMode = () => {
    const states: Array<'off' | 'track' | 'context'> = ['off', 'context', 'track'];
    const currentIndex = states.indexOf(repeatState);
    setRepeat(states[(currentIndex + 1) % 3]);
  };

  if (!user || !profile?.spotify_connected) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="mb-8">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent-green mx-auto mb-6 flex items-center justify-center">
            <Mic className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">Connect Spotify</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Link your Spotify account to listen to gaming soundtracks, create playlists,
            and control playback directly from RetroPlay.
          </p>
          <Button size="lg" onClick={initialize} icon={<Plus className="h-5 w-5" />} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Spotify'}
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
            <Button variant="ghost" size="sm" className="ml-2" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        )}

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Premium Playback</h3>
              <p className="text-sm text-muted-foreground">Full control with Web Playback SDK - play any track, control volume, seek, and more.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Free Tier Support</h3>
              <p className="text-sm text-muted-foreground">Web API fallback for Free users - browse, search, and control playback on your devices.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Gaming Soundtracks</h3>
              <p className="text-sm text-muted-foreground">Curated playlists for every system - NES, SNES, Genesis, PlayStation, and more.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Music</h1>
          <p className="text-muted-foreground">
            {mode === 'web-playback' ? 'Premium Playback Active' : 'Free Tier (Web API)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isPremium ? 'success' : 'warning'} className="gap-1">
            {isPremium ? <Play className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {isPremium ? 'Premium' : 'Free'}
          </Badge>
          <Button variant="outline" size="icon" onClick={refreshDevices} icon={<ListMusic className="h-4 w-4" />} aria-label="Refresh devices" />
          <Button variant="outline" size="icon" onClick={() => setShowDevices(true)} icon={<Volume2 className="h-4 w-4" />} aria-label="Select device" />
        </div>
      </div>

      {/* Now Playing Card */}
      {currentTrack && (
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {currentTrack.album.images[0] ? (
                <img src={currentTrack.album.images[0].url} alt="" className="h-20 w-20 rounded-lg object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary/50 to-accent-green/50 flex items-center justify-center">
                  <Mic className="h-10 w-10 text-primary/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{currentTrack.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {currentTrack.artists.map((a) => a.name).join(', ')} • {currentTrack.album.name}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1 max-w-xs">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={progressPercent}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full h-1.5 appearance-none bg-muted rounded-full accent-primary"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono w-16 text-right">
                    {formatDuration(progress)} / {formatDuration(duration)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={addToQueue} aria-label="Add to queue">
                  <Plus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Favorite">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowQueue(true)} aria-label="Queue">
                  <ListMusic className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playback Controls (when no track playing) */}
      {!currentTrack && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Mic className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nothing Playing</h3>
              <p className="text-muted-foreground mb-6">Select a track, playlist, or album to start listening</p>
              <Button variant="outline" onClick={() => setActiveTab('browse')} icon={<Search className="h-4 w-4" />}>
                Browse Music
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse">
          <div className="space-y-6 mt-6">
            <div>
              <h3 className="font-semibold mb-4">Gaming Soundtracks</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mockPlaylists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onPlay={() => play(undefined, playlist.tracks.items?.map((t) => t.track.uri) || [])}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Popular Gaming Tracks</h3>
              <div className="overflow-x-auto">
                <table className="w-full" role="list">
                  <thead>
                    <tr className="border-b border-border text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3 w-12">#</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3 hidden md:table-cell">Album</th>
                      <th className="px-4 py-3 hidden lg:table-cell">Duration</th>
                      <th className="px-4 py-3 text-right w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTracks.map((track, index) => (
                      <TrackRow
                        key={track.id}
                        track={track}
                        index={index}
                        isPlaying={currentTrack?.id === track.id && isPlaying}
                        onPlay={play}
                        onAddToQueue={addToQueue}
                        onAddToPlaylist={() => {}}
                        onViewAlbum={() => {}}
                        onViewArtist={() => {}}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Playlists Tab */}
        <TabsContent value="playlists">
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Your Playlists</h3>
              <Button variant="outline" icon={<Plus className="h-4 w-4" />}>Create Playlist</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mockPlaylists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onPlay={() => play(undefined, playlist.tracks.items?.map((t) => t.track.uri) || [])}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search">
          <div className="mt-6 max-w-2xl">
            <SearchInput
              placeholder="Search tracks, albums, artists, playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={async (query) => {
                if (!query.trim()) {
                  setSearchResults(null);
                  return;
                }
                // In real app, call Spotify search API
                // setSearchResults(await search(query, ['track', 'album', 'artist', 'playlist']));
              }}
              className="mb-6"
            />

            {searchResults && (
              <div className="space-y-6">
                {searchResults.tracks.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Tracks</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {searchResults.tracks.map((track, index) => (
                            <TrackRow
                              key={track.id}
                              track={track}
                              index={index}
                              onPlay={play}
                              onAddToQueue={addToQueue}
                              onAddToPlaylist={() => {}}
                              onViewAlbum={() => {}}
                              onViewArtist={() => {}}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {searchResults.albums.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Albums</h4>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {searchResults.albums.map((album) => (
                        <Card key={album.id} className="p-4 flex items-center gap-4" onClick={() => {}}>
                          {album.images[0] && (
                            <img src={album.images[0].url} alt="" className="h-16 w-16 rounded object-cover" />
                          )}
                          <div>
                            <p className="font-medium truncate">{album.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {album.artists.map((a) => a.name).join(', ')}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}