/**
 * Game Play Page - Emulator
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Emulator } from '../components/games/Emulator';
import { GameModal } from '../components/games/GameModal';
import { getGames, type Game } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, X, Gamepad2 } from 'lucide-react';

export function GamePlay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [romUrl, setRomUrl] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!id || !user) {
      navigate('/games');
      return;
    }

    const fetchGame = async () => {
      setLoading(true);
      try {
        const response = await getGames(user.id, { pageSize: 1 });
        // In real app, we'd fetch single game by ID
        // For now, find from list
        const gamesResponse = await getGames(user.id, { pageSize: 100 });
        const foundGame = gamesResponse.data?.data.find((g) => g.id === id);

        if (!foundGame) {
          setError('Game not found');
          return;
        }

        setGame(foundGame);

        // Get ROM URL from Supabase storage
        // This would use the storage service to get a signed URL
        const romUrl = `https://example.com/roms/${foundGame.file_path}`;
        setRomUrl(romUrl);
      } catch (err) {
        setError('Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  if (error || !game || !romUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-background rounded-2xl p-8 max-w-md mx-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to Load Game</h2>
          <p className="text-muted-foreground mb-4">{error || 'Game data not found'}</p>
          <button onClick={() => navigate('/games')} className="btn btn-primary">
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <Emulator
        game={game}
        romUrl={romUrl}
        onClose={() => navigate('/games')}
        onSaveState={(slot) => {}}
        onLoadState={(slot) => {}}
      />

      {/* Details button */}
      <button
        className="fixed bottom-24 right-4 z-30 btn btn-secondary gap-2"
        onClick={() => setShowDetails(true)}
      >
        <Gamepad2 className="h-4 w-4" />
        Details
      </button>

      <GameModal
        game={game}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onPlay={() => {}}
      />
    </div>
  );
}