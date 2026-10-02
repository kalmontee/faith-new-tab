import { useSettingsStore } from '@/shared/store/settings-store';
import { useClock } from '../hooks/use-clock';

export default function ClockGreeting() {
  const userName = useSettingsStore((s) => s.userName) || undefined;
  const { time, period, date, greeting } = useClock(userName);

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-xl font-normal text-white/90">{greeting}</p>

      <div className="flex items-baseline leading-none [text-shadow:0_2px_24px_rgba(0,0,0,0.25)]">
        <span className="text-[88px] font-light tabular-nums tracking-tight text-white">{time}</span>
        <span className="ml-2 text-2xl font-light text-ink-secondary">{period}</span>
      </div>

      <p className="text-sm text-ink-secondary">{date}</p>
    </div>
  );
}
