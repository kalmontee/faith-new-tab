import { useSettingsStore } from '@/shared/store/settings-store';
import { useClock } from '../hooks/use-clock';

export default function ClockGreeting() {
  const userName = useSettingsStore((s) => s.userName) || undefined;
  const { time, period, date, greeting } = useClock(userName);

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-xl font-normal text-white">{greeting} 👋</p>

      <div className="flex items-start leading-none">
        <span className="text-[80px] font-light tracking-tight text-white">{time}</span>
        <span className="ml-2 mt-4 text-2xl font-light text-white/70 self-end">{period}</span>
      </div>

      <p className="text-sm text-white/60">{date}</p>
    </div>
  );
}
