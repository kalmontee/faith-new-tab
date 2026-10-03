import { useState } from 'react';
import { ArrowLeft, Cloud, LayoutGrid, Palette, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Toggle } from '@/shared/ui/toggle';
import { glassSurface } from '@/shared/ui/glass-surface';
import { useSettingsStore } from '@/shared/store/settings-store';
import { resolveModules } from '@/shared/lib/module-registry';
import { BackgroundPicker } from './BackgroundPicker';
import { UnitToggle } from './UnitToggle';
import { LocationSetting } from './LocationSetting';

interface SettingsPageProps {
  onBack: () => void;
}

const SectionHeading = ({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) => (
  <h2 className="mb-3 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-[0.15em] text-ink-secondary">
    <Icon size={14} aria-hidden className="text-gold" />
    {children}
  </h2>
);

const SettingsCard = ({ children }: { children: React.ReactNode }) => (
  <div className={cn(glassSurface, 'rounded-2xl divide-y divide-white/10')}>{children}</div>
);

const RowDescription = ({ children }: { children: React.ReactNode }) => <p className="mt-0.5 text-xs text-ink-secondary">{children}</p>;

const SettingsRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-between px-5 py-4">{children}</div>
);

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const {
    userName,
    moduleStates,
    temperatureUnit,
    backgroundId,
    backgroundSolidColor,
    setUserName,
    setModuleEnabled,
    setTemperatureUnit,
    setBackgroundId,
    setBackgroundSolidColor,
  } = useSettingsStore();
  const [nameValue, setNameValue] = useState(userName);
  const modules = resolveModules(moduleStates);

  function handleNameBlur() {
    setUserName(nameValue.trim());
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ink-secondary transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-white">Settings</h1>
            <p className="text-sm text-ink-secondary">Make your new tab feel like yours</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile */}
          <section>
            <SectionHeading icon={User}>Profile</SectionHeading>
            <SettingsCard>
              <SettingsRow>
                <div className="flex-1 mr-4">
                  <label htmlFor="settings-name" className="text-sm font-medium text-white">
                    Your Name
                  </label>
                  <RowDescription>Used in your daily greeting</RowDescription>
                </div>
                <input
                  id="settings-name"
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  placeholder="Your name"
                  className={cn(
                    'w-44 rounded-lg border border-white/15 bg-white/5 px-3 py-2',
                    'text-sm text-white placeholder:text-ink-placeholder',
                    'focus:border-gold/60 focus:outline-none focus:bg-white/10',
                    'transition-colors'
                  )}
                />
              </SettingsRow>
            </SettingsCard>
          </section>

          {/* Appearance */}
          <section>
            <SectionHeading icon={Palette}>Appearance</SectionHeading>
            <SettingsCard>
              <div className="px-5 py-4">
                <p className="mb-1 text-sm font-medium text-white">Background</p>
                <p className="mb-4 text-xs text-ink-secondary">Choose a background for your dashboard</p>
                <BackgroundPicker
                  value={backgroundId}
                  solidColor={backgroundSolidColor}
                  onSelect={setBackgroundId}
                  onSolidColorChange={setBackgroundSolidColor}
                />
              </div>
            </SettingsCard>
          </section>

          {/* Weather */}
          <section>
            <SectionHeading icon={Cloud}>Weather</SectionHeading>
            <SettingsCard>
              <LocationSetting />
              <SettingsRow>
                <div>
                  <p className="text-sm font-medium text-white">Temperature Unit</p>
                  <RowDescription>Fahrenheit or Celsius</RowDescription>
                </div>
                <UnitToggle value={temperatureUnit} onChange={setTemperatureUnit} />
              </SettingsRow>
            </SettingsCard>
          </section>

          {/* Modules */}
          <section>
            <SectionHeading icon={LayoutGrid}>Modules</SectionHeading>
            <SettingsCard>
              {modules.map((mod) => (
                <SettingsRow key={mod.id}>
                  <div className="mr-4 flex items-center gap-3">
                    <span
                      aria-hidden
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                        mod.enabled ? 'bg-gold/15 text-gold' : 'bg-white/5 text-ink-tertiary'
                      )}
                    >
                      <mod.icon size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{mod.title}</p>
                      <RowDescription>{mod.description}</RowDescription>
                    </div>
                  </div>
                  <Toggle
                    checked={mod.enabled}
                    onCheckedChange={(enabled) => setModuleEnabled(mod.id, enabled)}
                    label={`Toggle ${mod.title}`}
                  />
                </SettingsRow>
              ))}
            </SettingsCard>
          </section>
        </div>
      </div>
    </div>
  );
}
