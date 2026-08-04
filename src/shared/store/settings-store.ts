import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandChromeStorage } from '@/shared/storage';
import type { TemperatureUnit } from '@/modules/weather/types';
import type { TranslationId } from '@/modules/bible/api/translations';
import type { BackgroundId } from '@/shared/types/background';

interface SettingsState {
  userName: string;
  moduleStates: Record<string, boolean>;
  temperatureUnit: TemperatureUnit;
  bibleTranslation: TranslationId;
  backgroundId: BackgroundId;
  backgroundSolidColor: string;

  setUserName: (name: string) => void;
  setModuleEnabled: (id: string, enabled: boolean) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setBibleTranslation: (id: TranslationId) => void;
  setBackgroundId: (id: BackgroundId) => void;
  setBackgroundSolidColor: (color: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      userName: '',
      moduleStates: {},
      temperatureUnit: 'fahrenheit',
      bibleTranslation: 'kjv',
      backgroundId: 'sunrise',
      backgroundSolidColor: '#1a1a2e',

      setUserName: (name) => set({ userName: name }),
      setModuleEnabled: (id, enabled) =>
        set((state) => ({
          moduleStates: { ...state.moduleStates, [id]: enabled },
        })),
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
      setBibleTranslation: (id) => set({ bibleTranslation: id }),
      setBackgroundId: (id) => set({ backgroundId: id }),
      setBackgroundSolidColor: (color) => set({ backgroundSolidColor: color }),
    }),
    {
      name: 'new-day:settings',
      storage: createJSONStorage(() => zustandChromeStorage),
    }
  )
);
