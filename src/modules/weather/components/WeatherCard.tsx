import { createElement } from 'react';

import { ArrowDown, ArrowUp, MapPin } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { useViewStore } from '@/shared/store/view-store';
import { useWeather } from '../hooks/use-weather';
import { WeatherSkeleton } from './Skeleton';
import { getConditionIcon } from '../utils';

export default function WeatherCard() {
  const { data, isLoading, isError, geoError } = useWeather();
  const openSettings = useViewStore((s) => s.openSettings);

  const unitLabel = data?.unit === 'celsius' ? '°' : '°';

  return (
    <Card>
      {isLoading && <WeatherSkeleton />}

      {geoError && !isLoading && (
        <div className="space-y-1 text-sm text-ink-secondary">
          <p>{geoError}</p>
          <p className="text-xs text-ink-tertiary">Enable location access and refresh the page, or</p>
          <button onClick={openSettings} className="text-xs font-medium text-gold transition-colors hover:text-warm-amber">
            Choose a city in Settings
          </button>
        </div>
      )}

      {isError && !geoError && <p className="text-sm text-ink-secondary">Could not load weather. Check your connection.</p>}

      {data && (
        <div className="flex h-full flex-col">
          {/* Location */}
          <div className="flex items-center gap-1.5 mb-4">
            <MapPin size={15} aria-hidden className="shrink-0 text-sky-accent" />
            <p className="text-sm font-medium text-white/85 truncate">{data.city}</p>
          </div>

          {/* Temperature + condition icon */}
          <div className="flex items-start justify-between">
            <div className="flex items-start leading-none">
              <span className="text-5xl font-light text-white">{data.temperature}</span>
              <span className="text-lg font-light text-ink-secondary mt-0.5">{unitLabel}</span>
            </div>
            {createElement(getConditionIcon(data.conditionCode), {
              size: 42,
              strokeWidth: 1.25,
              className: 'text-[#e8b84b] shrink-0',
            })}
          </div>

          {/* Condition label */}
          <p className="mt-2 text-sm text-white/85">{data.conditionText}</p>

          {/* High / Low */}
          <p className="mt-auto flex items-center gap-3 text-xs text-ink-secondary">
            <span className="flex items-center gap-0.5" aria-label={`High ${data.high} degrees`}>
              <ArrowUp size={12} aria-hidden className="text-warm-amber" />
              {data.high}°
            </span>
            <span className="flex items-center gap-0.5" aria-label={`Low ${data.low} degrees`}>
              <ArrowDown size={12} aria-hidden className="text-sky-accent" />
              {data.low}°
            </span>
          </p>
        </div>
      )}
    </Card>
  );
}
