import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Toggle } from '@/shared/ui/toggle';
import { useSettingsStore } from '@/shared/store/settings-store';
import { getAllModules } from '@/shared/lib/module-registry';
import { DashboardBackground } from '@/app/dashboard/DashboardBackground';
import { TranslationSelect } from './TranslationSelect';
import { BackgroundPicker } from './BackgroundPicker';
import { UnitToggle } from './UnitToggle';

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-medium uppercase tracking-widest text-white/40 mb-3">{children}</h2>
);

const SettingsCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/8 bg-[rgba(15,20,25,0.55)] backdrop-blur-xl divide-y divide-white/8">{children}</div>
);

const SettingsRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-between px-5 py-4">{children}</div>
);

export default function SettingsPage() {
  const {
    userName,
    moduleStates,
    temperatureUnit,
    bibleTranslation,
    backgroundId,
    backgroundSolidColor,
    setUserName,
    setModuleEnabled,
    setTemperatureUnit,
    setBibleTranslation,
    setBackgroundId,
    setBackgroundSolidColor,
  } = useSettingsStore();
  const [nameValue, setNameValue] = useState(userName);
  const modules = getAllModules();

  function handleNameBlur() {
    setUserName(nameValue.trim());
  }

  function isEnabled(id: string, defaultEnabled: boolean) {
    const override = moduleStates[id];
    return override !== undefined ? override : defaultEnabled;
  }

  return (
    <DashboardBackground>
      <div className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center h-9 w-9 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-semibold text-white">Settings</h1>
          </div>

          <div className="space-y-8">
            {/* Profile */}
            <section>
              <SectionHeading>Profile</SectionHeading>
              <SettingsCard>
                <SettingsRow>
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-white">Your Name</p>
                    <p className="text-xs text-white/40 mt-0.5">Used in your daily greeting</p>
                  </div>
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onBlur={handleNameBlur}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    placeholder="Your name"
                    className={cn(
                      'w-36 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5',
                      'text-sm text-white placeholder:text-white/30',
                      'focus:border-[#d4a547]/50 focus:outline-none focus:bg-white/8',
                      'transition-colors'
                    )}
                  />
                </SettingsRow>
              </SettingsCard>
            </section>

            {/* Bible Translation */}
            <section>
              <SectionHeading>Bible Translation</SectionHeading>
              <SettingsCard>
                <SettingsRow>
                  <div>
                    <p className="text-sm font-medium text-white">Translation</p>
                    <p className="text-xs text-white/40 mt-0.5">Select your preferred Bible version</p>
                  </div>
                  <TranslationSelect value={bibleTranslation} onChange={setBibleTranslation} />
                </SettingsRow>
              </SettingsCard>
            </section>

            {/* Appearance */}
            <section>
              <SectionHeading>Appearance</SectionHeading>
              <SettingsCard>
                <div className="px-5 py-4">
                  <p className="text-sm font-medium text-white mb-1">Background</p>
                  <p className="text-xs text-white/40 mb-4">Choose a background for your dashboard</p>
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
              <SectionHeading>Weather</SectionHeading>
              <SettingsCard>
                <SettingsRow>
                  <div>
                    <p className="text-sm font-medium text-white">Temperature Unit</p>
                    <p className="text-xs text-white/40 mt-0.5">Fahrenheit or Celsius</p>
                  </div>
                  <UnitToggle value={temperatureUnit} onChange={setTemperatureUnit} />
                </SettingsRow>
              </SettingsCard>
            </section>

            {/* Modules */}
            <section>
              <SectionHeading>Modules</SectionHeading>
              <SettingsCard>
                {modules.map((mod) => (
                  <SettingsRow key={mod.id}>
                    <div className="flex items-center gap-3">
                      <mod.icon size={18} className="text-white/50 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{mod.title}</p>
                        <p className="text-xs text-white/40 mt-0.5">{mod.description}</p>
                      </div>
                    </div>
                    <Toggle
                      checked={isEnabled(mod.id, mod.enabled)}
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
    </DashboardBackground>
  );
}
