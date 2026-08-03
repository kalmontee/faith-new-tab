export function dayOfYear(date: Date = new Date()): number {
  // Compare UTC anchors of the local Y/M/D triple so DST transitions between
  // Jan 1 and `date` don't shift which 24h bucket a given calendar day falls into.
  const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utcJan1 = Date.UTC(date.getFullYear(), 0, 1);
  return Math.round((utcDate - utcJan1) / 86_400_000) + 1;
}

export function pickDaily<T>(items: readonly T[], date: Date = new Date()): T {
  return items[dayOfYear(date) % items.length] as T;
}
