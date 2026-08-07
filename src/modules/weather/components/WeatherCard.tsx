import { createElement } from 'react';

import { MapPin } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { useWeather } from '../hooks/use-weather';
import { WeatherSkeleton } from './Skeleton';
import { getConditionIcon } from '../utils';

export default function WeatherCard() {
  const { data, isLoading, isError, geoError } = useWeather();

  const unitLabel = data?.unit === 'celsius' ? '°' : '°';

  return (
    <Card>
      {isLoading && <WeatherSkeleton />}

      {geoError && !isLoading && (
        <div className="space-y-1 text-sm text-white/50">
          <p>{geoError}</p>
          <p className="text-xs text-white/30">Enable location access and refresh the page.</p>
        </div>
      )}

      {isError && !geoError && <p className="text-sm text-white/50">Could not load weather. Check your connection.</p>}

      {data && (
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 mb-4">
            <MapPin size={15} className="text-white/50 shrink-0" />
            <p className="text-sm text-white/70 truncate">{data.city}</p>
          </div>

          {/* Temperature + condition icon */}
          <div className="flex items-start justify-between">
            <div className="flex items-start leading-none">
              <span className="text-5xl font-light text-white">{data.temperature}</span>
              <span className="text-lg font-light text-white/60 mt-0.5">{unitLabel}</span>
            </div>
            {createElement(getConditionIcon(data.conditionCode), {
              size: 42,
              strokeWidth: 1.25,
              className: 'text-[#e8b84b] shrink-0',
            })}
          </div>

          {/* Condition label */}
          <p className="mt-2 text-sm text-white/70">{data.conditionText}</p>

          {/* High / Low */}
          <p className="mt-1 text-xs text-white/40">
            H {data.high}°&nbsp;&nbsp;L {data.low}°
          </p>
        </div>
      )}
    </Card>
  );
}
