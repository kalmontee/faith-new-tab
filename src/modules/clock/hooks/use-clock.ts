import { useState, useEffect } from 'react';
import { getGreeting } from '@/shared/utils/greeting';

interface ClockState {
  time: string;
  period: string;
  date: string;
  greeting: string;
}

export function buildClockState(now: Date, userName?: string): ClockState {
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    time: `${displayHours}:${minutes}`,
    period,
    date,
    greeting: getGreeting(userName, hours),
  };
}

export function useClock(userName?: string): ClockState {
  const [state, setState] = useState<ClockState>(() => buildClockState(new Date(), userName));

  useEffect(() => {
    const tick = () => setState(buildClockState(new Date(), userName));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [userName]);

  return state;
}
