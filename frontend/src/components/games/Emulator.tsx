/**
 * RetroArch.js Emulator Component
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Slider } from '../ui/Slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Switch } from '../ui/Switch';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from '../ui/Dropdown';
import type { Game, SystemId } from '../../types';
import { SYSTEM_CONFIG, getSystemConfig } from '../../utils/config';
import {
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
  Pause,
  Save,
  Load,
  Settings,
  Menu,
  X,
  Gamepad2,
  Keyboard,
  Monitor,
  Volume2,
  VolumeX,
  Camera,
  Zap,
} from 'lucide-react';

interface EmulatorProps {
  game: Game;
  romUrl: string;
  onClose: () => void;
  onSaveState?: (slot: number) => void;
  onLoadState?: (slot: number) => void;
}

declare global {
  interface Window {
    Module: {
      FS: {
        createPreloadedFile: (path: string, name: string, data: ArrayBuffer | Uint8Array, canRead: boolean, canWrite: boolean) => void;
        unlink: (path: string) => void;
      };
      callMain: (args: string[]) => void;
      onRuntimeInitialized: () => void;
      HEAPU8: Uint8Array;
      _malloc: (size: number) => number;
      _free: (ptr: number) => void;
      stringToUTF8: (str: string, ptr: number, maxBytes: number) => void;
    };
    RetroArch: any;
  }
}

const CORE_MAP: Record<SystemId, string> = {
  nes: 'nestopia_libretro',
  snes: 'snes9x_libretro',
  gameboy: 'gambatte_libretro',
  gba: 'mgba_libretro',
  n64: 'mupen64plus_libretro',
  ps1: 'pcsx_rearmed_libretro',
  genesis: 'genesis_plus_gx_libretro',
  arcade: 'fbneo_libretro',
  dos: 'dosbox_pure_libretro',
};

const CORE_EXTENSIONS: Record<SystemId, string[]> = {
  nes: ['.nes', '.unf', '.fds'],
  snes: ['.sfc', '.smc', '.fig', '.swc', '.mgd'],
  gameboy: ['.gb', '.gbc', '.dmg'],
  gba: ['.gba', '.agb'],
  n64: ['.z64', '.n64', '.v64', '.u64'],
  ps1: ['.bin', '.cue', '.iso', '.img', '.pbp', '.chd'],
  genesis: ['.md', '.gen', '.smd', '.bin', '.cue', '.iso'],
  arcade: ['.zip', '.7z', '.chd'],
  dos: ['.exe', '.com', '.bat', '.conf'],
};

export function Emulator({ game, romUrl, onClose, onSaveState, onLoadState }: EmulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moduleRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [speed, setSpeed] = useState(1);
  const [rewind, setRewind] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const systemConfig = getSystemConfig(game.system_id);
  const coreName = CORE_MAP[game.system_id];

  const initializeEmulator = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Load RetroArch.js
      const retroarchUrl = `https://cdn.jsdelivr.net/npm/@retroarch/web@latest/dist/retroarch.js`;
      const moduleScript = document.createElement('script');
      moduleScript.src = retroarchUrl;
      moduleScript.async = true;

      await new Promise<void>((resolve, reject) => {
        moduleScript.onload = () => resolve();
        moduleScript.onerror = () => reject(new Error('Failed to load RetroArch.js'));
        document.head.appendChild(moduleScript);
      });

      // Wait for Module to be ready
      await new Promise<void>((resolve) => {
        if (window.Module?.onRuntimeInitialized) {
          window.Module.onRuntimeInitialized = () => resolve();
        } else {
          const checkModule = setInterval(() => {
            if (window.Module?.onRuntimeInitialized) {
              window.Module.onRuntimeInitialized = () => resolve();
              clearInterval(checkModule);
            }
          }, 100);
        }
      });

      // Initialize RetroArch
      const Module = window.Module;
      moduleRef.current = Module;

      // Create canvas and set up
      const canvas = canvasRef.current;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      // Mount ROM file
      const response = await fetch(romUrl);
      if (!response.ok) throw new Error('Failed to load ROM');
      const romData = await response.arrayBuffer();

      const romName = game.filename;
      const romPath = `/roms/${romName}`;

      // Create directory structure
      Module.FS.mkdir('/roms');
      Module.FS.mkdir('/saves');
      Module.FS.mkdir('/states');
      Module.FS.mkdir('/system');

      // Write ROM file
      Module.FS.createPreloadedFile('/roms', romName, romData, true, true);

      // Load core
      const coreUrl = `https://cdn.jsdelivr.net/npm/@retroarch/web@latest/dist/cores/${coreName}.wasm`;
      const coreResponse = await fetch(coreUrl);
      if (!coreResponse.ok) throw new Error(`Failed to load core: ${coreName}`);
      const coreData = await coreResponse.arrayBuffer();

      Module.FS.createPreloadedFile('/system', `${coreName}.wasm`, coreData, true, true);

      // Configure RetroArch
      const args = [
        '-L', `/system/${coreName}.wasm`,
        romPath,
        '--config', '/retroarch.cfg',
        '--verbose',
      ];

      // Create minimal config
      const configContent = `
        video_driver = "gl"
        audio_driver = "web"
        video_fullscreen = false
        video_width = ${canvas.width}
        video_height = ${canvas.height}
        aspect_ratio_index = "22"
        video_scale_integer = true
        video_vsync = true
        video_smooth = false
        audio_volume = ${volume * 100}
        fastforward_ratio = ${speed}
        rewind_enable = ${rewind ? 'true' : 'false'}
        savestate_directory = "/states"
        savefile_directory = "/saves"
        system_directory = "/system"
      `;
      Module.FS.writeFile('/retroarch.cfg', configContent);

      // Start emulation
      Module.callMain(args);
      setRunning(true);
      setLoading(false);

      // Handle resize
      const handleResize = () => {
        if (canvasRef.current && moduleRef.current) {
          canvasRef.current.width = canvasRef.current.clientWidth;
          canvasRef.current.height = canvasRef.current.clientHeight;
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize emulator');
      setLoading(false);
    }
  }, [game, romUrl, volume, speed, rewind]);

  useEffect(() => {
    const cleanup = initializeEmulator();
    return () => {
      if (cleanup) cleanup();
      if (moduleRef.current) {
        try {
          moduleRef.current.callMain(['-q']);
        } catch {}
      }
    };
  }, [initializeEmulator]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!running || showMenu || showSettings) return;

    // Prevent default for game keys
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', ' ', 'z', 'x', 'a', 's', 'q', 'w'];
    if (gameKeys.includes(e.key)) {
      e.preventDefault();
    }
  }, [running, showMenu, showSettings]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const togglePause = () => {
    if (moduleRef.current) {
      // RetroArch pause/resume would go here
      setPaused(!paused);
    }
  };

  const toggleFullscreen = async () => {
    if (!canvasRef.current) return;

    try {
      if (!fullscreen) {
        await canvasRef.current.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const saveState = (slot: number) => {
    if (moduleRef.current) {
      // RetroArch save state command
      onSaveState?.(slot);
    }
  };

  const loadState = (slot: number) => {
    if (moduleRef.current) {
      // RetroArch load state command
      onLoadState?.(slot);
    }
  };

  const resetGame = () => {
    if (moduleRef.current) {
      moduleRef.current.callMain(['-r']);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p>Loading {systemConfig.name}...</p>
          <p className="text-sm text-muted-foreground mt-2">{game.title}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="bg-background rounded-2xl p-8 max-w-md mx-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to load emulator</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onContextMenu={(e) => e.preventDefault()}>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 bg-black/80 backdrop-blur border-b border-white/10 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close emulator">
            <X className="h-5 w-5 text-white" />
          </Button>
          <div>
            <p className="font-medium text-white">{game.title}</p>
            <p className="text-xs text-muted-foreground">{systemConfig.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={togglePause} aria-label={paused ? 'Resume' : 'Pause'}>
            {paused ? <RotateCcw className="h-5 w-5 text-white" /> : <Pause className="h-5 w-5 text-white" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSpeed(speed === 1 ? 2 : 1)} aria-label={speed > 1 ? 'Normal speed' : 'Fast forward'}>
            <FastForward className={cn('h-5 w-5', speed > 1 && 'text-accent-green')} />
          </Button>
          <Button variant="ghost" size="icon" onClick={resetGame} aria-label="Reset game">
            <RotateCcw className="h-5 w-5 text-white" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {fullscreen ? <Minimize className="h-5 w-5 text-white" /> : <Maximize className="h-5 w-5 text-white" />}
          </Button>
        </div>
      </div>

      {/* Emulator Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="emulator-canvas"
          style={{ width: '100%', height: '100%' }}
          tabIndex={0}
        />

        {paused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10">
            <div className="text-center text-white">
              <Pause className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl">PAUSED</p>
              <p className="text-sm text-muted-foreground mt-2">Press Play to resume</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-3 bg-black/80 backdrop-blur border-t border-white/10 flex items-center gap-4">
        {/* Virtual Gamepad Toggle */}
        <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)} aria-label="Show menu">
          <Menu className="h-5 w-5 text-white" />
        </Button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setVolume(volume > 0 ? 0 : 0.5)} aria-label={volume > 0 ? 'Mute' : 'Unmute'}>
            {volume > 0 ? <Volume2 className="h-5 w-5 text-white" /> : <VolumeX className="h-5 w-5 text-white" />}
          </Button>
          <Slider
            value={volume * 100}
            onValueChange={(v) => setVolume((v as number) / 100)}
            min={0}
            max={100}
            step={1}
            className="w-32 h-1.5"
            aria-label="Volume"
          />
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground w-16">Speed: {speed}x</span>
          <Slider
            value={speed}
            onValueChange={(v) => setSpeed(v as number)}
            min={0.5}
            max={4}
            step={0.25}
            className="w-32 h-1.5"
            aria-label="Game speed"
          />
        </div>

        {/* Quick Save/Load */}
        <div className="flex items-center gap-1 ml-4">
          <Button variant="ghost" size="icon" onClick={() => saveState(0)} aria-label="Save state slot 1">
            <Save className="h-4 w-4 text-white" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => loadState(0)} aria-label="Load state slot 1">
            <Load className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>

      {/* Menu Overlay */}
      {showMenu && (
        <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-black/95 backdrop-blur rounded-xl border border-white/10 p-4 z-20 animate-in slide-up">
          <Tabs defaultValue="controls" className="w-full">
            <TabsList className="bg-transparent mb-4">
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="states">Save States</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="controls">
              <div className="space-y-3">
                <h4 className="font-medium text-white">Virtual Gamepad</h4>
                <p className="text-sm text-muted-foreground">Touch controls overlay (mobile)</p>
                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  label="Show touch controls"
                  description="Display on-screen gamepad"
                />
                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  label="Keyboard mapping"
                  description="Configure keyboard bindings"
                />
              </div>
            </TabsContent>

            <TabsContent value="states">
              <div className="space-y-3">
                <h4 className="font-medium text-white">Save States</h4>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => saveState(i)} aria-label={`Save to slot ${i + 1}`}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadState(i)} aria-label={`Load from slot ${i + 1}`}>
                        <Load className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-4">
                <h4 className="font-medium text-white">Video</h4>
                <Switch
                  checked={true}
                  onCheckedChange={() => {}}
                  label="Integer scaling"
                  description="Scale by whole integers only"
                />
                <Switch
                  checked={true}
                  onCheckedChange={() => {}}
                  label="VSync"
                  description="Synchronize with display refresh"
                />
                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  label="Bilinear filter"
                  description="Smooth pixel scaling"
                />

                <Separator />

                <h4 className="font-medium text-white">Audio</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="w-16 text-muted-foreground">Volume</span>
                    <Slider value={volume * 100} onValueChange={(v) => setVolume((v as number) / 100)} min={0} max={100} className="flex-1" />
                    <span className="w-10 text-right">{Math.round(volume * 100)}%</span>
                  </label>
                </div>

                <Separator />

                <h4 className="font-medium text-white">Gameplay</h4>
                <Switch
                  checked={rewind}
                  onCheckedChange={setRewind}
                  label="Rewind"
                  description="Enable rewind feature"
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="w-24 text-muted-foreground">Fast forward</span>
                    <Slider value={speed} onValueChange={setSpeed} min={1} max={8} step={1} className="flex-1" />
                    <span className="w-10 text-right">{speed}x</span>
                  </label>
                </div>

                <Separator />

                <h4 className="font-medium text-white">Shaders</h4>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="none">None</option>
                  <option value="crt">CRT</option>
                  <option value="scanlines">Scanlines</option>
                  <option value="hq2x">HQ2x</option>
                </select>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}