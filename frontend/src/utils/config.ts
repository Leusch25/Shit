/**
 * Application configuration from environment variables
 */

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  spotify: {
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
    redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/callback`,
    scopes: [
      'user-read-private',
      'user-read-email',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'user-read-recently-played',
      'user-top-read',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-private',
      'playlist-modify-public',
      'streaming',
      'app-remote-control',
    ],
  },
  emulator: {
    retroarchCdn: import.meta.env.VITE_RETROARCH_CDN || 'https://cdn.jsdelivr.net/npm/@retroarch/web@latest/dist/',
    coresCdn: import.meta.env.VITE_CORES_CDN || 'https://cdn.jsdelivr.net/npm/@retroarch/web@latest/dist/cores/',
  },
  features: {
    cloudSaves: true,
    netplay: false,
    achievements: false,
    spotifyIntegration: true,
  },
} as const;

export const SYSTEM_CONFIG: Record<string, {
  id: string;
  name: string;
  shortName: string;
  manufacturer: string;
  releaseYear: number;
  description: string;
  extensions: string[];
  cores: { id: string; name: string }[];
  color: string;
  icon: string;
}> = {
  nes: {
    id: 'nes',
    name: 'Nintendo Entertainment System',
    shortName: 'NES',
    manufacturer: 'Nintendo',
    releaseYear: 1983,
    description: 'The 8-bit home video game console that revitalized the gaming industry.',
    extensions: ['.nes', '.unf', '.fds'],
    cores: [
      { id: 'nestopia', name: 'Nestopia UE' },
      { id: 'fceumm', name: 'FCEUmm' },
      { id: 'mesen', name: 'Mesen' },
    ],
    color: '#E60012',
    icon: '🎮',
  },
  snes: {
    id: 'snes',
    name: 'Super Nintendo Entertainment System',
    shortName: 'SNES',
    manufacturer: 'Nintendo',
    releaseYear: 1990,
    description: 'Nintendo\'s 16-bit console with iconic games and Mode 7 graphics.',
    extensions: ['.sfc', '.smc', '.fig', '.swc', '.mgd'],
    cores: [
      { id: 'snes9x', name: 'Snes9x' },
      { id: 'bsnes', name: 'bsnes' },
      { id: 'mesen-s', name: 'Mesen-S' },
    ],
    color: '#8B0000',
    icon: '🎮',
  },
  gameboy: {
    id: 'gameboy',
    name: 'Game Boy / Game Boy Color',
    shortName: 'GB/GBC',
    manufacturer: 'Nintendo',
    releaseYear: 1989,
    description: 'The legendary handheld that defined portable gaming.',
    extensions: ['.gb', '.gbc', '.dmg'],
    cores: [
      { id: 'gambatte', name: 'Gambatte' },
      { id: 'sameboy', name: 'SameBoy' },
      { id: 'tgbdual', name: 'TGB Dual' },
    ],
    color: '#0F3460',
    icon: '📱',
  },
  gba: {
    id: 'gba',
    name: 'Game Boy Advance',
    shortName: 'GBA',
    manufacturer: 'Nintendo',
    releaseYear: 2001,
    description: 'Nintendo\'s 32-bit handheld with SNES-quality graphics.',
    extensions: ['.gba', '.agb'],
    cores: [
      { id: 'mgba', name: 'mGBA' },
      { id: 'vba-next', name: 'VBA Next' },
      { id: 'gpSP', name: 'gpSP' },
    ],
    color: '#5C4033',
    icon: '📱',
  },
  n64: {
    id: 'n64',
    name: 'Nintendo 64',
    shortName: 'N64',
    manufacturer: 'Nintendo',
    releaseYear: 1996,
    description: 'The console that brought 3D gaming to the masses.',
    extensions: ['.z64', '.n64', '.v64', '.u64'],
    cores: [
      { id: 'mupen64plus', name: 'Mupen64Plus' },
      { id: 'parallel-n64', name: 'Parallel-N64' },
    ],
    color: '#FF6B00',
    icon: '🎮',
  },
  ps1: {
    id: 'ps1',
    name: 'PlayStation',
    shortName: 'PS1',
    manufacturer: 'Sony',
    releaseYear: 1994,
    description: 'Sony\'s entry into gaming that changed the industry forever.',
    extensions: ['.bin', '.cue', '.iso', '.img', '.pbp', '.chd'],
    cores: [
      { id: 'pcsx-rearmed', name: 'PCSX-ReARMed' },
      { id: 'duckstation', name: 'DuckStation' },
      { id: 'beetle-psx', name: 'Beetle PSX' },
    ],
    color: '#003791',
    icon: '🎮',
  },
  genesis: {
    id: 'genesis',
    name: 'Sega Genesis / Mega Drive',
    shortName: 'GEN',
    manufacturer: 'Sega',
    releaseYear: 1988,
    description: 'Sega\'s 16-bit console that gave Nintendo serious competition.',
    extensions: ['.md', '.gen', '.smd', '.bin', '.cue', '.iso'],
    cores: [
      { id: 'genesis-plus-gx', name: 'Genesis Plus GX' },
      { id: 'picodrive', name: 'PicoDrive' },
    ],
    color: '#0060A8',
    icon: '🎮',
  },
  arcade: {
    id: 'arcade',
    name: 'Arcade / MAME',
    shortName: 'ARC',
    manufacturer: 'Various',
    releaseYear: 1970,
    description: 'Thousands of classic arcade games via MAME and FBNeo.',
    extensions: ['.zip', '.7z', '.chd'],
    cores: [
      { id: 'mame', name: 'MAME' },
      { id: 'fbneo', name: 'FBNeo' },
    ],
    color: '#FF0000',
    icon: '🕹️',
  },
  dos: {
    id: 'dos',
    name: 'DOS',
    shortName: 'DOS',
    manufacturer: 'IBM / Microsoft',
    releaseYear: 1981,
    description: 'Classic PC games running in DOSBox.',
    extensions: ['.exe', '.com', '.bat', '.conf'],
    cores: [
      { id: 'dosbox-pure', name: 'DOSBox-Pure' },
      { id: 'dosbox-svn', name: 'DOSBox-SVN' },
    ],
    color: '#0078D4',
    icon: '💻',
  },
};

export const SYSTEM_IDS = Object.keys(SYSTEM_CONFIG) as Array<keyof typeof SYSTEM_CONFIG>;

export function getSystemConfig(systemId: string) {
  return SYSTEM_CONFIG[systemId] || SYSTEM_CONFIG.nes;
}

export function getSystemColor(systemId: string): string {
  return SYSTEM_CONFIG[systemId]?.color || '#6366f1';
}

export function getSupportedExtensions(systemId: string): string[] {
  return SYSTEM_CONFIG[systemId]?.extensions || [];
}

export function getAllSupportedExtensions(): string[] {
  const extensions = new Set<string>();
  Object.values(SYSTEM_CONFIG).forEach((system) => {
    system.extensions.forEach((ext) => extensions.add(ext));
  });
  return Array.from(extensions);
}