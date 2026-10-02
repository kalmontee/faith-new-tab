import { useId, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { useLocationSearch, type LocationSearch } from '@/modules/weather';
import { useSettingsStore } from '@/shared/store/settings-store';
import type { ManualLocation } from '@/shared/types/location';

const NO_ACTIVE_OPTION = -1;

function getStatusMessage({ state, results }: LocationSearch): string {
  if (state === 'searching') return 'Searching…';
  if (state === 'error') return "Couldn't search right now. Check your connection.";
  if (state === 'ready' && results.length === 0) return 'No cities found. Try another spelling.';
  return '';
}

export function LocationSetting() {
  const manualLocation = useSettingsStore((s) => s.manualLocation);
  const setManualLocation = useSettingsStore((s) => s.setManualLocation);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(NO_ACTIVE_OPTION);
  const baseId = useId();
  const listboxId = `${baseId}-results`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const search = useLocationSearch(query);
  const { state, results } = search;
  const isListOpen = state === 'ready' && results.length > 0;
  const statusMessage = getStatusMessage(search);

  function resetSearch() {
    setQuery('');
    setActiveIndex(NO_ACTIVE_OPTION);
  }

  function choose(location: ManualLocation) {
    setManualLocation(location);
    resetSearch();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      resetSearch();
      return;
    }
    if (!isListOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      const active = results[activeIndex];
      if (active) {
        e.preventDefault();
        choose(active);
      }
    }
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor={`${baseId}-input`} className="text-sm font-medium text-white">
            Location
          </label>
          <p className="mt-0.5 text-xs text-white/70">
            {manualLocation ? 'Showing weather for the city you chose' : "Using your browser's location. Search to choose a city instead."}
          </p>
        </div>
        {manualLocation && (
          <button
            onClick={() => setManualLocation(null)}
            className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            Use my location
          </button>
        )}
      </div>

      {manualLocation && (
        <p className="mt-3 flex items-center gap-2 text-sm text-white">
          <MapPin size={15} aria-hidden className="shrink-0 text-white/60" />
          <span>{manualLocation.label}</span>
        </p>
      )}

      <div className="relative mt-3">
        <Search size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/55" />
        <input
          id={`${baseId}-input`}
          role="combobox"
          aria-label="Search for a city"
          aria-expanded={isListOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={isListOpen && activeIndex !== NO_ACTIVE_OPTION ? optionId(activeIndex) : undefined}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(NO_ACTIVE_OPTION);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for a city"
          maxLength={80}
          className={cn(
            'w-full rounded-lg border border-white/15 bg-white/5 py-2 pl-9 pr-3',
            'text-sm text-white placeholder:text-white/50',
            'focus:border-gold/60 focus:bg-white/10 focus:outline-none transition-colors'
          )}
        />
      </div>

      <p role="status" className={cn('text-xs text-white/70', statusMessage && 'mt-2')}>
        {statusMessage}
      </p>

      {isListOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Matching cities"
          className="mt-2 overflow-hidden rounded-lg border border-white/10 divide-y divide-white/10"
        >
          {results.map((location, index) => (
            <li
              key={`${location.lat},${location.lng}`}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => choose(location)}
              className={cn(
                'flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10',
                index === activeIndex && 'bg-white/10'
              )}
            >
              <MapPin size={14} aria-hidden className="shrink-0 text-white/55" />
              {location.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
