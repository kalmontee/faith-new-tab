export type BackgroundId = 'sunrise' | 'ocean' | 'forest' | 'night-sky' | 'desert' | 'aurora' | 'solid';

export interface BackgroundPreset {
  id: BackgroundId;
  label: string;
  gradient: string;
  preview: string;
}
