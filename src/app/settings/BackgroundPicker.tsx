import { Check } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { BACKGROUND_PRESETS } from '@/shared/utils/background';
import { type BackgroundId } from '@/shared/types/background-presets';

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
      <div className="grid grid-cols-3 gap-2">
        {BACKGROUND_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className={cn(
              'relative h-16 rounded-xl border-2 transition-colors overflow-hidden',
              value === preset.id ? 'border-[#d4a547]' : 'border-white/10 hover:border-white/25'
            )}
            style={{ background: preset.gradient }}
            aria-label={preset.label}>
            {value === preset.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check size={16} className="text-white drop-shadow-md" />
              </div>
            )}
            <span className="absolute bottom-1 inset-x-0 text-center text-[10px] text-white/70">{preset.label}</span>
          </button>
        ))}

        {/* Solid color option */}
        <button
          onClick={() => onSelect('solid')}
          className={cn(
            'relative h-16 rounded-xl border-2 transition-colors overflow-hidden',
            value === 'solid' ? 'border-[#d4a547]' : 'border-white/10 hover:border-white/25'
          )}
          style={{ background: solidColor }}
          aria-label="Solid color">
          {value === 'solid' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check size={16} className="text-white drop-shadow-md" />
            </div>
          )}
          <span className="absolute bottom-1 inset-x-0 text-center text-[10px] text-white/70">Solid</span>
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
          <span className="text-xs text-white/40 font-mono">{solidColor}</span>
        </div>
      )}
    </div>
  );
}
