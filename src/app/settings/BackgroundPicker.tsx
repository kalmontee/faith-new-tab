import { Check } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { BACKGROUND_PRESETS } from '@/shared/utils/background';
import { type BackgroundId } from '@/shared/types/background-presets';

function SelectedBadge() {
  return (
    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-black">
      <Check size={12} strokeWidth={3} aria-hidden />
    </span>
  );
}

export function BackgroundPicker({
  value,
  solidColor,
  onSelect,
  onSolidColorChange,
}: {
  value: BackgroundId;
  solidColor: string;
  onSelect: (id: BackgroundId) => void;
  onSolidColorChange: (color: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BACKGROUND_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className={cn(
              'relative h-20 rounded-xl border-2 transition-all overflow-hidden',
              value === preset.id ? 'border-gold' : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'
            )}
            style={{ background: preset.gradient }}
            aria-label={preset.label}
            aria-pressed={value === preset.id}>
            {value === preset.id && <SelectedBadge />}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4 text-left text-xs font-medium text-white">
              {preset.label}
            </span>
          </button>
        ))}

        {/* Solid color option */}
        <button
          onClick={() => onSelect('solid')}
          className={cn(
            'relative h-20 rounded-xl border-2 transition-all overflow-hidden',
            value === 'solid' ? 'border-gold' : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'
          )}
          style={{ background: solidColor }}
          aria-label="Solid color"
          aria-pressed={value === 'solid'}>
          {value === 'solid' && <SelectedBadge />}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4 text-left text-xs font-medium text-white">
            Solid
          </span>
        </button>
      </div>

      {value === 'solid' && (
        <div className="flex items-center gap-3 px-1">
          <input
            type="color"
            value={solidColor}
            onChange={(e) => onSolidColorChange(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5"
            aria-label="Pick a color"
          />
          <span className="text-xs text-ink-secondary font-mono">{solidColor}</span>
        </div>
      )}
    </div>
  );
}
