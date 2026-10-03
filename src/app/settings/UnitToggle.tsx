import { cn } from '@/shared/lib/utils';
import type { TemperatureUnit } from '@/shared/types/temperature';

export function UnitToggle({ value, onChange }: { value: TemperatureUnit; onChange: (unit: TemperatureUnit) => void }) {
  return (
    <div role="group" aria-label="Temperature unit" className="flex rounded-lg border border-white/10 bg-white/5 p-0.5 text-sm">
      {(['fahrenheit', 'celsius'] as const).map((unit) => (
        <button
          key={unit}
          onClick={() => onChange(unit)}
          aria-pressed={value === unit}
          className={cn(
            'min-w-11 rounded-md px-3 py-1.5 transition-colors',
            value === unit ? 'bg-gold font-medium text-black' : 'text-ink-secondary hover:bg-white/10 hover:text-white'
          )}
        >
          {unit === 'fahrenheit' ? '°F' : '°C'}
        </button>
      ))}
    </div>
  );
}
