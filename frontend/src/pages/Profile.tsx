/**
 * Profile Page
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { Switch } from '../components/ui/Switch';
import { Separator } from '../components/ui/Separator';
import { formatRelativeTime, formatPlaytime } from '../utils/helpers';
import { GameGrid } from '../components/games/GameGrid';
import { getGames, type Game, type UserProfile } from '../services/supabase';
import { SYSTEM_CONFIG, getSystemColor } from '../utils/config';
import {
  User,
  Settings,
  Gamepad2,
  Music,
  Heart,
  Clock,
  Trophy,
  Edit,
  Camera,
  Shield,
  Bell,
  Palette,
  Globe,
  Key,
  LogOut,
  Save,
  Loader2,
} from 'lucide-react';

const mockSessions = [
  { id: '1', game_id: '1', started_at: new Date(Date.now() - 86400000).toISOString(), ended_at: new Date(Date.now() - 82800000).toISOString(), duration: 3600, game: { title: 'Super Mario World', system_id: 'snes' as const } },
  { id: '2', game_id: '2', started_at: new Date(Date.now() - 172800000).toISOString(), ended_at: new Date(Date.now() - 169200000).toISOString(), duration: 7200, game: { title: 'Zelda OOT', system_id: 'n64' as const } },
];

export function Profile() {
  const { user, profile, updateProfile, updatePreferences, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'activity' | 'settings'>('overview');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        display_name: formData.display_name,
        username: formData.username,
      });
      setEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    await updatePreferences({ [key]: value });
  };

  if (authLoading || !user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPlaytime = 61200; // Would come from stats
  const totalGames = 24;
  const favoriteCount = 5;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar
                src={profile.avatar_url}
                name={profile.display_name || profile.username}
                size="2xl"
              />
              {editing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-0 right-0 bg-background"
                  onClick={() => {}}
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div>
                  {editing ? (
                    <Input
                      value={formData.display_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                      className="w-64"
                    />
                  ) : (
                    <h1 className="text-2xl font-display font-bold">{profile.display_name || profile.username}</h1>
                  )}
                  {editing ? null : (
                    <Badge variant="outline" className="text-sm">
                      @{profile.username}
                    </Badge>
                  )}
                </div>
                {profile.tier === 'premium' && (
                  <Badge variant="success" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{profile.email}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Member since {formatRelativeTime(profile.created_at)}
                </span>
                {profile.spotify_connected && (
                  <span className="flex items-center gap-1 text-accent-green">
                    <Music className="h-3 w-3" />
                    Spotify Connected
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving} icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)} icon={<Edit className="h-4 w-4" />}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Gamepad2 className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold">{totalGames}</p>
            <p className="text-sm text-muted-foreground">Games in Library</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-10 w-10 text-accent-green mx-auto mb-2" />
            <p className="text-3xl font-bold">{formatPlaytime(totalPlaytime)}</p>
            <p className="text-sm text-muted-foreground">Total Playtime</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{favoriteCount}</p>
            <p className="text-sm text-muted-foreground">Favorites</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Recently Played
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Gamepad2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{session.game.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {SYSTEM_CONFIG[session.game.system_id].shortName} • {formatPlaytime(session.duration)} • {formatRelativeTime(session.started_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Favorite Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Would show favorite games */}
                    <p className="text-sm text-muted-foreground text-center py-4">No favorites yet</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Password</h4>
                    <p className="text-sm text-muted-foreground mb-3">Last changed 30 days ago</p>
                    <Button variant="outline" size="sm" icon={<Key className="h-3 w-3" />}>Change Password</Button>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Two-Factor Auth</h4>
                    <p className="text-sm text-muted-foreground mb-3">Not enabled</p>
                    <Button variant="outline" size="sm" icon={<Shield className="h-3 w-3" />}>Enable 2FA</Button>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Connected Accounts</h4>
                    <p className="text-sm text-muted-foreground mb-3">GitHub, Google</p>
                    <Button variant="outline" size="sm" icon={<User className="h-3 w-3" />}>Manage</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games">
          <div className="mt-6">
            <GameGrid
              games={[]}
              loading={false}
              viewMode="grid"
              onViewModeChange={() => {}}
              filters={{ systems: [], search: '', favoritesOnly: false, hidden: false, sortBy: 'recent', sortOrder: 'desc' }}
              onFiltersChange={() => {}}
              emptyMessage="Your game library is empty"
              emptyAction={{
                label: 'Add your first game',
                onClick: () => {},
              }}
            />
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockSessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Gamepad2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{session.game.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {SYSTEM_CONFIG[session.game.system_id].name} • {formatPlaytime(session.duration)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">{formatRelativeTime(session.started_at)}</p>
                        <p className="text-xs text-muted-foreground">{formatPlaytime(session.duration)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {['light', 'dark', 'system'].map((theme) => (
                      <Button
                        key={theme}
                        variant={profile.preferences.theme === theme ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePreferenceChange('theme', theme as any)}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Language</h4>
                    <p className="text-sm text-muted-foreground">Interface language</p>
                  </div>
                  <select
                    value={profile.preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="input w-48"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Gaming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Switch
                  checked={profile.preferences.auto_save_enabled}
                  onCheckedChange={(checked) => handlePreferenceChange('auto_save_enabled', checked)}
                  label="Auto-save"
                  description="Automatically save game state on exit"
                />
                <Switch
                  checked={profile.preferences.cloud_sync_enabled}
                  onCheckedChange={(checked) => handlePreferenceChange('cloud_sync_enabled', checked)}
                  label="Cloud Sync"
                  description="Sync saves and settings across devices"
                />
                <Switch
                  checked={profile.preferences.emulator_settings.rewind_enabled}
                  onCheckedChange={(checked) => handlePreferenceChange('emulator_settings', { ...profile.preferences.emulator_settings, rewind_enabled: checked })}
                  label="Rewind"
                  description="Enable rewind feature in emulators"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Switch
                  checked={true}
                  onCheckedChange={() => {}}
                  label="Push Notifications"
                  description="Receive notifications for game updates"
                />
                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  label="Email Updates"
                  description="Receive email newsletters and updates"
                />
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" onClick={() => {}}>Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}