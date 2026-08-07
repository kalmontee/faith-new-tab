import { useState } from 'react';
import { Copy, Heart, Settings, Share2, Zap } from 'lucide-react';

import { Card, CardHeader } from '@/shared/ui/card';
import { useQuickActions } from '../hooks/use-quick-actions';
import { ActionTile } from './ActionTitle';

export default function QuickActionsCard() {
  const { hasVerse, isFavorite, copyVerse, shareVerse, toggleFavorite, openSettings } = useQuickActions();
  const [copyLabel, setCopyLabel] = useState('Copy Verse');

  async function handleCopy() {
    await copyVerse();
    setCopyLabel('Copied!');
    setTimeout(() => setCopyLabel('Copy Verse'), 1500);
  }

  return (
    <Card>
      <CardHeader icon={<Zap size={15} className="text-white/50 shrink-0" />} label="Quick Actions" />
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <ActionTile icon={<Share2 size={18} />} label="Share Verse" onClick={shareVerse} disabled={!hasVerse} />
        <ActionTile icon={<Copy size={18} />} label={copyLabel} onClick={handleCopy} disabled={!hasVerse} />
        <ActionTile
          icon={<Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />}
          label={isFavorite ? 'Favorited' : 'Favorite'}
          onClick={toggleFavorite}
          disabled={!hasVerse}
          active={isFavorite}
        />
        <ActionTile icon={<Settings size={18} />} label="Settings" onClick={openSettings} />
      </div>
    </Card>
  );
}
