import type { BackgroundPreset, BackgroundId } from '../types/background-presets';

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'sunrise',
    label: 'Sunrise',
    gradient: 'linear-gradient(to bottom, #0a1220 0%, #162040 20%, #2d2060 42%, #6b2d55 62%, #b05030 76%, #d48040 88%, #e8b848 100%)',
    preview: '#b05030',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    gradient: 'linear-gradient(to bottom, #0b1d26 0%, #0e3b4d 25%, #146278 50%, #1a8a9e 72%, #3db8c1 88%, #7ed6d9 100%)',
    preview: '#146278',
  },
  {
    id: 'forest',
    label: 'Forest',
    gradient: 'linear-gradient(to bottom, #0a1a0e 0%, #14331a 25%, #1e4d28 50%, #2d6b3a 72%, #4a8c52 88%, #6aad6e 100%)',
    preview: '#1e4d28',
  },
  {
    id: 'night-sky',
    label: 'Night Sky',
    gradient: 'linear-gradient(to bottom, #020111 0%, #0a0a2e 25%, #16164d 50%, #232366 72%, #2d2d80 88%, #3a3a99 100%)',
    preview: '#16164d',
  },
  {
    id: 'desert',
    label: 'Desert',
    gradient: 'linear-gradient(to bottom, #1a1008 0%, #3d2810 25%, #6b4520 50%, #96673a 72%, #c49050 88%, #e0b870 100%)',
    preview: '#6b4520',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    gradient:
      'linear-gradient(to bottom, #050818 0%, #0d1a30 20%, #0a2a3f 40%, #0e4040 55%, #165544 68%, #2a7050 80%, #4a9060 92%, #6ab070 100%)',
    preview: '#0e4040',
  },
];

export function getBackgroundStyle(id: BackgroundId, solidColor: string): string {
  if (id === 'solid') return solidColor;
  const preset = BACKGROUND_PRESETS.find((p) => p.id === id);
  return preset?.gradient ?? BACKGROUND_PRESETS[0]!.gradient;
}
