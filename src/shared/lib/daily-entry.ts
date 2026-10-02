import type { EntityTable } from 'dexie';
import { getTodayKey } from '@/shared/utils/date';

interface DailyRow {
  id: number;
  date: string;
  updatedAt: number;
}

type EntryFields<T extends DailyRow> = Omit<T, keyof DailyRow>;

export interface DailyEntry<T extends DailyRow> {
  getToday(): Promise<T | undefined>;
  saveToday(fields: EntryFields<T>): Promise<T>;
}

export function createDailyEntry<T extends DailyRow>(table: EntityTable<T, 'id'>): DailyEntry<T> {
  const findByDate = (date: string) => table.where('date').equals(date).first();

  return {
    getToday: () => findByDate(getTodayKey()),

    async saveToday(fields) {
      const date = getTodayKey();
      const existing = await findByDate(date);
      const updatedAt = Date.now();

      if (existing) {
        await table.update(existing.id as never, { ...fields, updatedAt } as never);
        return { ...existing, ...fields, updatedAt };
      }

      const row = { ...fields, date, updatedAt } as unknown as Parameters<typeof table.add>[0];
      const id = (await table.add(row)) as number;
      return { ...row, id } as unknown as T;
    },
  };
}
