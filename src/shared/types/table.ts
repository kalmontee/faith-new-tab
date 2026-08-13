export interface FocusEntry {
  id: number;
  date: string; // 'YYYY-MM-DD' — one row per day
  focus: string;
  tagline: string;
  updatedAt: number;
}

export interface GratitudeEntry {
  id: number;
  date: string; // 'YYYY-MM-DD' — one row per day
  entry: string;
  updatedAt: number;
}

export interface PrayerRequest {
  id: number;
  text: string;
  answered: boolean;
  createdAt: number;
  answeredAt: number | null;
}

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
  position: number;
}

export interface FavoriteVerse {
  id: number;
  reference: string;
  text: string;
  translation: string;
  createdAt: number;
}
