/**
 * Settings Page
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMusic } from '../contexts/MusicContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Switch } from '../components/ui/Switch';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Slider } from '../components/ui/Slider';
import { Separator } from '../components/ui/Separator';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from '../components/ui/Dropdown';
import {
  Gamepad2,
  Monitor,
  Volume2,
  Cloud,
  Shield,
  Bell,
  Palette,
  Keyboard,
  Zap,
  Save,
  Trash2,
  ExternalLink,
  ChevronDown,
  X,
  Check,
  Wifi,
  Bluetooth,
  Usb,
} from 'lucide-react';

export function Settings() {
  const { user, profile, updatePreferences } = useAuth();
  const { mode, isPremium, initialize, refreshDevices, devices, activeDevice } = useMusic();

  const [activeTab, setActiveTab] = useState<'emulator' | 'audio' | 'video' | 'input' | 'network' | 'advanced'>('emulator');
  const [emulatorSettings, setEmulatorSettings] = useState(profile?.preferences.emulator_settings || {
    video_driver: 'gl',
    audio_driver: 'web',
    aspect_ratio: '4:3',
    integer_scaling: true,
    vsync: true,
    bilinear_filter: false,
    rewind_enabled: true,
    fast_forward_ratio: 2,
  });

  const handleEmulatorSettingChange = (key: string, value: any) => {
    const newSettings = { ...emulatorSettings, [key]: value };
    setEmulatorSettings(newSettings);
    updatePreferences({ emulator_settings: newSettings });
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    await updatePreferences({ [key]: value });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your RetroPlay experience</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="emulator"><Gamepad2 className="h-4 w-4 mr-2" />Emulator</TabsTrigger>
          <TabsTrigger value="video"><Monitor className="h-4 w-4 mr-2" />Video</TabsTrigger>
          <TabsTrigger value="audio"><Volume2 className="h-4 w-4 mr-2" />Audio</TabsTrigger>
          <TabsTrigger value="input"><Keyboard className="h-4 w-4 mr-2" />Input</TabsTrigger>
          <TabsTrigger value="network"><Wifi className="h-4 w-4 mr-2" />Network</TabsTrigger>
          <TabsTrigger value="advanced"><Zap className="h-4 w-4 mr-2" />Advanced</TabsTrigger>
        </TabsList>

        {/* Emulator Tab */}
        <TabsContent value="emulator">
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Core Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="label">Video Driver</label>
                  <Dropdown>
                    <DropdownTrigger variant="outline">
                      {emulatorSettings.video_driver}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </DropdownTrigger>
                    <DropdownContent align="start">
                      {['gl', 'vulkan', 'software'].map((driver) => (
                        <DropdownItem
                          key={driver}
                          onClick={() => handleEmulatorSettingChange('video_driver', driver)}
                          icon={emulatorSettings.video_driver === driver ? <Check className="h-4 w-4" /> : null}
                        >
                          {driver.toUpperCase()}
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </Dropdown>
                </div>

                <div>
                  <label className="label">Audio Driver</label>
                  <Dropdown>
                    <DropdownTrigger variant="outline">
                      {emulatorSettings.audio_driver}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </DropdownTrigger>
                    <DropdownContent align="start">
                      {['web', 'wasapi', 'alsa', 'pulse'].map((driver) => (
                        <DropdownItem
                          key={driver}
                          onClick={() => handleEmulatorSettingChange('audio_driver', driver)}
                          icon={emulatorSettings.audio_driver === driver ? <Check className="h-4 w-4" /> : null}
                        >
                          {driver.charAt(0).toUpperCase() + driver.slice(1)}
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </Dropdown>
                </div>

                <Separator />

                <Switch
                  checked={emulatorSettings.rewind_enabled}
                  onCheckedChange={(checked) => handleEmulatorSettingChange('rewind_enabled', checked)}
                  label="Rewind"
                  description="Enable rewind feature (requires more memory)"
                />

                <div className="space-y-2">
                  <label className="label flex items-center justify-between">
                    Fast Forward Ratio
                    <span className="text-sm font-mono text-primary">{emulatorSettings.fast_forward_ratio}x</span>
                  </label>
                  <Slider
                    value={emulatorSettings.fast_forward_ratio}
                    onValueChange={(v) => handleEmulatorSettingChange('fast_forward_ratio', v)}
                    min={1}
                    max={8}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Save States
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Switch
                  checked={profile?.preferences.auto_save_enabled || false}
                  onCheckedChange={(checked) => handlePreferenceChange('auto_save_enabled', checked)}
                  label="Auto-save on Exit"
                  description="Automatically create a save state when closing a game"
                />
                <Switch
                  checked={profile?.preferences.cloud_sync_enabled || false}
                  onCheckedChange={(checked) => handlePreferenceChange('cloud_sync_enabled', checked)}
                  label="Cloud Sync"
                  description="Sync save states across devices via Supabase"
                />
                <div>
                  <label className="label">Max Save States per Game</label>
                  <Input type="number" value="10" className="w-24" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Video Tab */}
        <TabsContent value="video">
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Display
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="label">Aspect Ratio</label>
                  <Dropdown>
                    <DropdownTrigger variant="outline">
                      {emulatorSettings.aspect_ratio}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </DropdownTrigger>
                    <DropdownContent align="start">
                      {['4:3', '16:9', 'core', 'custom'].map((ratio) => (
                        <DropdownItem
                          key={ratio}
                          onClick={() => handleEmulatorSettingChange('aspect_ratio', ratio)}
                          icon={emulatorSettings.aspect_ratio === ratio ? <Check className="h-4 w-4" /> : null}
                        >
                          {ratio === 'core' ? 'Core Provided' : ratio}
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </Dropdown>
                </div>

                <Switch
                  checked={emulatorSettings.integer_scaling}
                  onCheckedChange={(checked) => handleEmulatorSettingChange('integer_scaling', checked)}
                  label="Integer Scaling"
                  description="Scale by whole integers only (sharp pixels)"
                />

                <Switch
                  checked={emulatorSettings.vsync}
                  onCheckedChange={(checked) => handleEmulatorSettingChange('vsync', checked)}
                  label="VSync"
                  description="Synchronize frame rate with display refresh"
                />

                <Switch
                  checked={emulatorSettings.bilinear_filter}
                  onCheckedChange={(checked) => handleEmulatorSettingChange('bilinear_filter', checked)}
                  label="Bilinear Filtering"
                  description="Smooth pixel scaling (disable for crisp pixels)"
                />

                <Separator />

                <div>
                  <label className="label">Shader Preset</label>
                  <Dropdown>
                    <DropdownTrigger variant="outline">
                      None
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </DropdownTrigger>
                    <DropdownContent align="start">
                      {['None', 'CRT', 'Scanlines', 'HQ2x', 'xBRZ', 'Custom'].map((shader) => (
                        <DropdownItem key={shader} onClick={() => {}} icon={shader === 'None' ? <Check className="h-4 w-4" /> : null}>
                          {shader}
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </Dropdown>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="label">Frame Throttling</label>
                  <Dropdown>
                    <DropdownTrigger variant="outline">
                      Auto
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </DropdownTrigger>
                    <DropdownContent align="start">
                      {['Auto', '60 FPS', '30 FPS', 'Unlimited'].map((opt) => (
                        <DropdownItem key={opt} onClick={() => {}}>
                          {opt}
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </Dropdown>
                </div>

                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  label="Run Ahead"
                  description="Reduce input latency (experimental, may cause instability)"
                />

                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  label="Second Instance"
                  description="Run second core instance for run-ahead"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio">
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Audio Output
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="label flex items-center justify-between">
                    Master Volume
                    <span className="text-sm font-mono">100%</span>
                  </label>
                  <Slider value={100} onValueChange={() => {}} min={0} max={100} />
                </div>

                <div>
                  <label className="label">Audio Latency (ms)</label>
                  <Slider value={64} onValueChange={() => {}} min={16} max={512} step={16} />
                </div>

                <Switch
                  checked={true}
                  onCheckedChange={() => {}}
                  label="Audio Sync"
                  description="Synchronize audio with video"
                />

                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  label="Mute when Unfocused"
                  description="Mute emulator audio when window loses focus"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Spotify Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Connection Status</h4>
                    <p className="text-sm text-muted-foreground">
                      {mode === 'none' ? 'Not connected' : mode === 'web-playback' ? 'Premium (Web Playback SDK)' : 'Free (Web API)'}
                    </p>
                  </div>
                  {mode === 'none' ? (
                    <Button onClick={initialize} disabled={false}>
                      Connect Spotify
                    </Button>
                  ) : (
                    <Badge variant={isPremium ? 'success' : 'warning'}>
                      {isPremium ? 'Premium Active' : 'Free Tier'}
                    </Badge>
                  )}
                </div>

                <Separator />

                <Switch
                  checked={true}
                  onCheckedChange={() => {}}
                  label="Show Playback Controls"
                  description="Display music player bar during gameplay"
                />

                <Switch
                  checked={true}
                  onCheckedChange={() => {}}
                  label="Auto-pause on Game Launch"
                  description="Pause music when starting a game"
                />

                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  label="Game Soundtracks"
                  description="Automatically play game OST when launching a game"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Input Tab */}
        <TabsContent value="input">
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Configure keyboard controls for each system. Click a button to remap.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {['NES', 'SNES', 'Game Boy', 'GBA', 'N64', 'PS1', 'Genesis', 'Arcade'].map((system) => (
                    <Button key={system} variant="outline" className="justify-start gap-2" onClick={() => {}}>
                      <Gamepad2 className="h-4 w-4" />
                      {system} Controls
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Usb className="h-5 w-5" />
                  Gamepad Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Switch
                  checked={true}
                  onCheckedChange={() => {}}
                  label="Auto-detect Gamepads"
                  description="Automatically configure connected gamepads"
                />

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Connected Devices</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5" />
                        <span>Xbox Wireless Controller</span>
                      </div>
                      <Badge variant="secondary">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5 opacity-50" />
                        <span>Generic USB Gamepad</span>
                      </div>
                      <Badge variant="outline">Disconnected</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network">
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Switch
                  checked={true}
                  onCheckedChange={() => {}}
                  label="Enable Netplay"
                  description="Allow multiplayer gaming over network (experimental)"
                />

                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  label="UPnP Port Forwarding"
                  description="Automatically configure router for hosting"
                />

                <div>
                  <label className="label">STUN Server</label>
                  <Input placeholder="stun.l.google.com:19302" className="w-full max-w-md" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Cloud Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Switch
                  checked={profile?.preferences.cloud_sync_enabled || false}
                  onCheckedChange={(checked) => handlePreferenceChange('cloud_sync_enabled', checked)}
                  label="Enable Cloud Sync"
                  description="Automatically sync saves, states, and settings"
                />

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Last Sync</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {}}>Sync Now</Button>
                </div>

                <Switch
                  checked={true}
                  onCheckedChange={() => {}}
                  label="Sync on Exit"
                  description="Upload changes when closing the app"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <div className="mt-6 space-y-6">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div>
                    <h4 className="font-medium text-destructive">Clear All Cache</h4>
                    <p className="text-sm text-muted-foreground">Remove cached ROMs, thumbnails, and temporary files</p>
                  </div>
                  <Button variant="destructive" onClick={() => {}}>Clear Cache</Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div>
                    <h4 className="font-medium text-destructive">Reset Settings</h4>
                    <p className="text-sm text-muted-foreground">Restore all settings to defaults</p>
                  </div>
                  <Button variant="destructive" onClick={() => {}}>Reset</Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" onClick={() => {}}>Delete Account</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => window.open('https://github.com/libretro/RetroArch', '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                  RetroArch Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => window.open('https://developer.spotify.com/documentation/web-playback-sdk', '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                  Spotify Web Playback SDK
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => window.open('https://supabase.com/docs', '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                  Supabase Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => window.open('https://github.com/your-repo', '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Debug
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Log Level</label>
                    <Dropdown>
                      <DropdownTrigger variant="outline">
                        Info
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </DropdownTrigger>
                      <DropdownContent align="start">
                        {['Debug', 'Info', 'Warn', 'Error'].map((level) => (
                          <DropdownItem key={level} onClick={() => {}}>{level}</DropdownItem>
                        ))}
                      </DropdownContent>
                    </Dropdown>
                  </div>
                  <div>
                    <label className="label">Core Log Level</label>
                    <Dropdown>
                      <DropdownTrigger variant="outline">
                        Info
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </DropdownTrigger>
                      <DropdownContent align="start">
                        {['Debug', 'Info', 'Warn', 'Error'].map((level) => (
                          <DropdownItem key={level} onClick={() => {}}>{level}</DropdownItem>
                        ))}
                      </DropdownContent>
                    </Dropdown>
                  </div>
                </div>

                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  label="Verbose Logging"
                  description="Enable detailed emulator logs (may impact performance)"
                />

                <Button variant="outline" onClick={() => {}}>Export Logs</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}