/**
 * Game Detail Modal
 */

import { useEffect, useState } from 'react';
import { cn } from '../../utils/helpers';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter, ModalCloseButton, ModalActionButton } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { ScrollArea } from '../ui/ScrollArea';
import { formatFileSize, formatPlaytime, formatRelativeTime, getSystemColor } from '../../utils/helpers';
import type { Game, GameSave } from '../../types';
import { SYSTEM_CONFIG } from '../../utils/config';
import {
  Play,
  Heart,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Info,
  Settings,
  Clock,
  Calendar,
  User,
  Save,
  Load,
  Camera,
  ExternalLink,
  X,
} from 'lucide-react';

interface GameModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay?: (game: Game) => void;
  onToggleFavorite?: (game: Game) => void;
  onToggleHidden?: (game: Game) => void;
  onDelete?: (game: Game) => void;
  saves?: GameSave[];
  onSaveState?: (game: Game, slot: number) => void;
  onLoadState?: (game: Game, slot: number) => void;
  onDeleteSave?: (save: GameSave) => void;
}

export function GameModal({
  game,
  isOpen,
  onClose,
  onPlay,
  onToggleFavorite,
  onToggleHidden,
  onDelete,
  saves = [],
  onSaveState,
  onLoadState,
  onDeleteSave,
}: GameModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'saves' | 'metadata'>('details');

  if (!game) return null;

  const systemConfig = SYSTEM_CONFIG[game.system_id];
  const systemColor = getSystemColor(game.system_id);

  const coverUrl = game.cover_url || `https://via.placeholder.com/400x500/${systemColor.slice(1)}/ffffff?text=${game.system_id.toUpperCase()}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" className="max-w-3xl">
      <ModalHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={coverUrl}
              alt={game.title}
              className="h-24 w-16 object-cover rounded-lg flex-shrink-0 shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <ModalTitle className="truncate">{game.title}</ModalTitle>
                <Badge
                  variant="default"
                  className="text-xs"
                  style={{ backgroundColor: `${systemColor}CC`, borderColor: systemColor }}
                >
                  {systemConfig.shortName}
                </Badge>
                {game.favorite && (
                  <Button variant="ghost" size="icon" onClick={() => onToggleFavorite?.(game)} aria-label="Remove from favorites">
                    <Heart className="h-4 w-4 fill-current text-yellow-500" />
                  </Button>
                )}
              </div>
              <ModalDescription>
                {systemConfig.name} • {formatFileSize(game.file_size)}
                {game.total_playtime > 0 && <span className="mx-2">•</span>}
                {game.total_playtime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatPlaytime(game.total_playtime)}
                  </span>
                )}
              </ModalDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </ModalHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="saves">Save States ({saves.length})</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <ModalContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Game Info</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">File</dt>
                    <dd className="font-mono truncate max-w-[200px]">{game.filename}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Size</dt>
                    <dd>{formatFileSize(game.file_size)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">MD5</dt>
                    <dd className="font-mono text-xs">{game.hash_md5.slice(0, 16)}...</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">SHA-1</dt>
                    <dd className="font-mono text-xs">{game.hash_sha1.slice(0, 16)}...</dd>
                  </div>
                  {game.metadata.region && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Region</dt>
                      <dd>{game.metadata.region}</dd>
                    </div>
                  )}
                  {game.metadata.players && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Players</dt>
                      <dd>{game.metadata.players}</dd>
                    </div>
                  )}
                  {game.metadata.genre?.length && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Genre</dt>
                      <dd>{game.metadata.genre.join(', ')}</dd>
                    </div>
                  )}
                  {game.metadata.publisher && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Publisher</dt>
                      <dd>{game.metadata.publisher}</dd>
                    </div>
                  )}
                  {game.metadata.developer && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Developer</dt>
                      <dd>{game.metadata.developer}</dd>
                    </div>
                  )}
                  {game.metadata.release_date && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Release</dt>
                      <dd>{game.metadata.release_date}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Statistics</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Play Count</dt>
                    <dd className="font-semibold">{game.play_count}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Playtime</dt>
                    <dd>{game.total_playtime > 0 ? formatPlaytime(game.total_playtime) : 'Never played'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Last Played</dt>
                    <dd>{game.last_played_at ? formatRelativeTime(game.last_played_at) : 'Never'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Added</dt>
                    <dd>{formatRelativeTime(game.created_at)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Favorite</dt>
                    <dd>{game.favorite ? 'Yes' : 'No'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Hidden</dt>
                    <dd>{game.hidden ? 'Yes' : 'No'}</dd>
                  </div>
                  {game.tags.length > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Tags</dt>
                      <dd className="flex flex-wrap gap-1">
                        {game.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {game.metadata.description && (
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{game.metadata.description}</p>
              </div>
            )}
          </ModalContent>
        </TabsContent>

        {/* Save States Tab */}
        <TabsContent value="saves">
          <ModalContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Save States</h4>
              <Button variant="outline" size="sm" onClick={() => onSaveState?.(game, 0)} icon={<Save className="h-4 w-4" />}>
                New Save State
              </Button>
            </div>

            {saves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Save className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No save states yet</p>
                <p className="text-sm">Create a save state while playing</p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="space-y-3">
                  {saves.map((save) => (
                    <div key={save.id} className="flex items-center gap-4 p-3 card">
                      {save.thumbnail && (
                        <img
                          src={`data:image/png;base64,${save.thumbnail}`}
                          alt={save.name}
                          className="h-16 w-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{save.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Slot {save.slot} • {formatFileSize(save.size)} • {formatRelativeTime(save.updated_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onLoadState?.(game, save.slot)} aria-label={`Load ${save.name}`}>
                          <Load className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" danger onClick={() => onDeleteSave?.(save)} aria-label={`Delete ${save.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </ModalContent>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata">
          <ModalContent className="space-y-4">
            <h4 className="font-medium text-foreground">Raw Metadata</h4>
            <ScrollArea className="max-h-96">
              <pre className="text-xs text-muted-foreground bg-muted p-4 rounded-lg overflow-x-auto font-mono">
                {JSON.stringify(game.metadata, null, 2)}
              </pre>
            </ScrollArea>
          </ModalContent>
        </TabsContent>
      </Tabs>

      <ModalFooter>
        <ModalCloseButton>Close</ModalCloseButton>
        <Button variant="outline" onClick={() => onToggleHidden?.(game)} icon={game.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}>
          {game.hidden ? 'Show' : 'Hide'}
        </Button>
        <Button variant="outline" onClick={() => onToggleFavorite?.(game)} icon={<Heart className="h-4 w-4" />}>
          {game.favorite ? 'Unfavorite' : 'Favorite'}
        </Button>
        <ModalActionButton variant="destructive" onClick={() => onDelete?.(game)} icon={<Trash2 className="h-4 w-4" />}>
          Delete
        </ModalActionButton>
        <ModalActionButton onClick={() => onPlay?.(game)} icon={<Play className="h-4 w-4" />}>
          Play
        </ModalActionButton>
      </ModalFooter>
    </Modal>
  );
}