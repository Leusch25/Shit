/**
 * Home Page
 */

import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { GameGrid } from '../components/games/GameGrid';
import { SYSTEM_CONFIG, SYSTEM_IDS } from '../utils/config';
import { useAuth } from '../contexts/AuthContext';
import { useMusic } from '../contexts/MusicContext';
import { formatPlaytime, getSystemColor } from '../utils/helpers';
import {
  Gamepad2,
  Music,
  Play,
  ArrowRight,
  Zap,
  Cloud,
  Heart,
  Settings,
  Plus,
  Search,
  TrendingUp,
  Clock,
  Trophy,
} from 'lucide-react';

const features = [
  {
    icon: Gamepad2,
    title: 'Multi-System Emulation',
    description: 'Play games from NES, SNES, Game Boy, GBA, N64, PS1, Sega Genesis, Arcade, and DOS all in your browser.',
  },
  {
    icon: Cloud,
    title: 'Cloud Saves & Sync',
    description: 'Your save states, screenshots, and game progress sync automatically across all your devices.',
  },
  {
    icon: Music,
    title: 'Spotify Integration',
    description: 'Listen to your favorite gaming soundtracks and playlists with full Spotify Premium playback support.',
  },
  {
    icon: Zap,
    title: 'WebAssembly Performance',
    description: 'Near-native performance using RetroArch.js with WebAssembly cores optimized for the web.',
  },
  {
    icon: Heart,
    title: 'Favorites & Collections',
    description: 'Organize your library with favorites, custom tags, playtime tracking, and smart filters.',
  },
  {
    icon: Settings,
    title: 'Customizable Experience',
    description: 'Shaders, filters, controller mapping, rewind, fast-forward, and per-game settings.',
  },
];

const stats = [
  { label: 'Supported Systems', value: '9', icon: Gamepad2 },
  { label: 'Emulator Cores', value: '20+', icon: Zap },
  { label: 'Save State Slots', value: '10', icon: Cloud },
  { label: 'Shader Presets', value: '50+', icon: Settings },
];

export function Home() {
  const { user, profile, loading: authLoading } = useAuth();
  const { mode, initialize } = useMusic();

  // Mock data for demo
  const recentGames = [
    {
      id: '1',
      title: 'Super Mario World',
      system_id: 'snes' as const,
      cover_url: '',
      file_size: 524288,
      total_playtime: 7200,
      play_count: 15,
      last_played_at: new Date(Date.now() - 86400000).toISOString(),
      favorite: true,
      filename: 'super_mario_world.sfc',
      hash_md5: '',
      hash_sha1: '',
      metadata: {},
      hidden: false,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
    },
    {
      id: '2',
      title: 'The Legend of Zelda: Ocarina of Time',
      system_id: 'n64' as const,
      cover_url: '',
      file_size: 33554432,
      total_playtime: 18000,
      play_count: 8,
      last_played_at: new Date(Date.now() - 172800000).toISOString(),
      favorite: true,
      filename: 'zelda_oot.z64',
      hash_md5: '',
      hash_sha1: '',
      metadata: {},
      hidden: false,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
    },
    {
      id: '3',
      title: 'Pokémon Red',
      system_id: 'gameboy' as const,
      cover_url: '',
      file_size: 1048576,
      total_playtime: 36000,
      play_count: 25,
      last_played_at: new Date(Date.now() - 259200000).toISOString(),
      favorite: false,
      filename: 'pokemon_red.gb',
      hash_md5: '',
      hash_sha1: '',
      metadata: {},
      hidden: false,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
    },
  ];

  const favoriteGames = recentGames.filter((g) => g.favorite).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent-green/10 to-transparent p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-50" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
              Now with Spotify Integration
            </span>
            {mode === 'web-playback' && (
              <Badge variant="success" className="text-xs">Premium Playback Active</Badge>
            )}
            {mode === 'web-api' && (
              <Badge variant="warning" className="text-xs">Free Tier (Web API)</Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
            Retro Gaming{' '}
            <span className="gradient-text">Reimagined</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            Play classic games from 9 systems in your browser with cloud saves,
            Spotify soundtracks, and modern features. No installation required.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/games">
              <Button size="lg" className="gap-2" icon={<Play className="h-5 w-5" />}>
                Start Playing
              </Button>
            </Link>
            {!user && (
              <Link to="/auth?mode=signup">
                <Button size="lg" variant="outline" className="gap-2" icon={<Plus className="h-5 w-5" />}>
                  Create Free Account
                </Button>
              </Link>
            )}
            {user && mode === 'none' && (
              <Button size="lg" variant="outline" onClick={initialize} className="gap-2" icon={<Music className="h-5 w-5" />}>
                Connect Spotify
              </Button>
            )}
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-full max-w-md opacity-20">
          <Gamepad2 className="h-full w-full text-primary" />
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center py-6">
            <CardContent className="pt-0">
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Features */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold">Why RetroPlay?</h2>
            <p className="text-muted-foreground">Everything you need for the ultimate retro gaming experience</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group card-hover">
              <CardContent className="pt-6">
                <div className="relative h-12 w-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex items-center justify-center">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {user && (
        <>
          {/* Continue Playing */}
          {recentGames.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold">Continue Playing</h2>
                  <p className="text-muted-foreground">Pick up where you left off</p>
                </div>
                <Link to="/games">
                  <Button variant="ghost" icon={<ArrowRight className="h-4 w-4" />}>
                    View All
                  </Button>
                </Link>
              </div>
              <GameGrid
                games={recentGames}
                viewMode="grid"
                onViewModeChange={() => {}}
                filters={{ systems: [], search: '', favoritesOnly: false, hidden: false, sortBy: 'recent', sortOrder: 'desc' }}
                onFiltersChange={() => {}}
              />
            </section>
          )}

          {/* Favorites */}
          {favoriteGames.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                    <Heart className="h-6 w-6 text-red-500" />
                    Favorites
                  </h2>
                  <p className="text-muted-foreground">Your most loved games</p>
                </div>
              </div>
              <GameGrid
                games={favoriteGames}
                viewMode="grid"
                onViewModeChange={() => {}}
                filters={{ systems: [], search: '', favoritesOnly: false, hidden: false, sortBy: 'playtime', sortOrder: 'desc' }}
                onFiltersChange={() => {}}
              />
            </section>
          )}

          {/* Quick Stats */}
          <section>
            <h2 className="text-2xl font-display font-bold mb-6">Your Library Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">24</p>
                      <p className="text-sm text-muted-foreground">Total Games</p>
                    </div>
                    <Gamepad2 className="h-12 w-12 text-primary/30" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{formatPlaytime(61200)}</p>
                      <p className="text-sm text-muted-foreground">Total Playtime</p>
                    </div>
                    <Clock className="h-12 w-12 text-accent-green/30" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">8</p>
                      <p className="text-sm text-muted-foreground">Systems</p>
                    </div>
                    <Trophy className="h-12 w-12 text-yellow-500/30" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Save States</p>
                    </div>
                    <Cloud className="h-12 w-12 text-purple-500/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}

      {/* Systems Overview */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold">Supported Systems</h2>
            <p className="text-muted-foreground">9 classic platforms, one unified experience</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {SYSTEM_IDS.map((systemId) => {
            const config = SYSTEM_CONFIG[systemId];
            const color = getSystemColor(systemId);
            return (
              <Link
                key={systemId}
                to={`/games?system=${systemId}`}
                className="card-hover p-4 text-center group"
              >
                <div
                  className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {config.icon}
                </div>
                <h3 className="font-semibold mb-1">{config.shortName}</h3>
                <p className="text-sm text-muted-foreground">{config.name}</p>
                <div className="mt-2 flex justify-center gap-1">
                  {config.cores.slice(0, 3).map((core) => (
                    <Badge key={core.id} variant="outline" className="text-xs">
                      {core.name}
                    </Badge>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-r from-primary to-accent-green p-8 md:p-12 text-center">
        <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">
          Ready to Play?
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          Create your free account and start building your retro game library today.
          Cloud saves, Spotify integration, and more included.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/auth?mode=signup">
            <Button size="lg" variant="secondary" className="gap-2" icon={<Plus className="h-5 w-5" />}>
              Get Started Free
            </Button>
          </Link>
          <Link to="/games">
            <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10" icon={<Gamepad2 className="h-5 w-5" />}>
              Browse Games
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}