import { cn } from '@/shared/lib/utils';
import type { TemperatureUnit } from '@/modules/weather/types';

export function UnitToggle({ value, onChange }: { value: TemperatureUnit; onChange: (unit: TemperatureUnit) => void }) {
  return (
    <div className="flex rounded-lg border border-white/10 overflow-hidden text-sm">
      {(['fahrenheit', 'celsius'] as const).map((unit) => (
        <button
          key={unit}
          onClick={() => onChange(unit)}
          className={cn(
            'px-3 py-1.5 transition-colors',
            value === unit ? 'bg-[#d4a547] text-black font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          {unit === 'fahrenheit' ? '°F' : '°C'}
        </button>
      ))}
    </div>
  );
}
