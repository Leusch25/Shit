# RetroPlay - Full-Stack Retro Gaming Platform

A modern web-based retro gaming platform with multi-system emulation via RetroArch.js and Spotify integration for gaming soundtracks.

## Features

- 🎮 **Multi-System Emulation**: NES, SNES, Game Boy, GBA, N64, PS1, Sega Genesis, Arcade/MAME, DOS
- ☁️ **Cloud Saves**: Automatic save state synchronization via Supabase
- 🎵 **Spotify Integration**: Web Playback SDK (Premium) + Web API fallback (Free)
- 👤 **User Accounts**: Email/password + OAuth (GitHub, Google, Discord)
- 🎨 **Modern UI**: Dark/light mode, responsive design, Tailwind CSS
- ⚡ **WebAssembly Performance**: Near-native emulation in the browser

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand + React Context
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Emulation**: RetroArch.js (WebAssembly)
- **Music**: Spotify Web Playback SDK + Web API
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)
- Spotify Developer account

### 1. Clone and Install

```bash
cd frontend
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your Project URL and anon key
3. Run the SQL schema in the Supabase SQL Editor:
   ```sql
   -- Copy contents of supabase-schema.sql
   ```
4. Create storage buckets in Supabase Dashboard:
   - `roms` (private)
   - `covers` (public)
   - `saves` (private)
   - `avatars` (public)

### 3. Set Up Spotify

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Add redirect URI: `http://localhost:5173/callback`
3. Copy Client ID

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Base UI components (Button, Card, Modal, etc.)
│   │   ├── layout/       # Layout components (Navigation, Sidebar, MusicPlayerBar)
│   │   ├── games/        # Game components (GameCard, GameGrid, Emulator)
│   │   ├── music/        # Music components (TrackRow, Queue, PlaylistCard)
│   │   └── common/       # Shared components (SearchInput, FilterBar)
│   ├── contexts/         # React Contexts (Auth, Music)
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Page components
│   ├── services/         # API services (Supabase, Spotify)
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utilities and config
│   ├── App.tsx           # Root component with routing
│   └── main.tsx          # Entry point
├── supabase-schema.sql   # Database schema
├── .env.example          # Environment template
└── package.json
```

## Key Features Implementation

### Emulator (RetroArch.js)

The emulator uses RetroArch.js WebAssembly cores loaded from CDN:

```typescript
// Core mapping in utils/config.ts
const CORE_MAP = {
  nes: 'nestopia_libretro',
  snes: 'snes9x_libretro',
  gameboy: 'gambatte_libretro',
  // ...
};
```

### Spotify Dual Integration

- **Premium Users**: Full Web Playback SDK with in-browser playback
- **Free Users**: Web API fallback with device control

### Cloud Saves

Save states are stored as base64 in Supabase with automatic sync:

```typescript
// 10 slots per game, auto-save on exit
// Thumbnails for visual save state browser
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Netlify

1. Connect repo to Netlify
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variables

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host"]
```

## Legal Notice

**ROM Files**: This application does not include any ROM files. Users must legally own original game cartridges/discs to create ROM backups for personal use. Downloading ROMs for games you don't own may violate copyright laws.

**Emulator Cores**: RetroArch cores are loaded from jsDelivr CDN under their respective licenses (GPL, LGPL, etc.).

**Spotify**: Requires Spotify Premium for full playback. Free tier uses Web API with limited control.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a PR

## License

MIT License - see LICENSE file for details.

## Support

- Report issues on GitHub
- Join our Discord community
- Check the documentation wiki