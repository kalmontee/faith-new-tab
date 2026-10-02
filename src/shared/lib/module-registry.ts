import type { ModuleDefinition } from '@/shared/types/module';
import { clockModule } from '@/modules/clock/module';
import { bibleModule } from '@/modules/bible/module';
import { weatherModule } from '@/modules/weather/module';
import { focusModule } from '@/modules/focus/module';
import { prayerModule } from '@/modules/prayer/module';
import { gratitudeModule } from '@/modules/gratitude/module';
import { todoModule } from '@/modules/todo/module';
import { quotesModule } from '@/modules/quotes/module';
import { quickActionsModule } from '@/modules/quick-actions/module';

const registry: Map<string, ModuleDefinition> = new Map();

function registerModule(module: ModuleDefinition): void {
  registry.set(module.id, module);
}

export function resolveModules(moduleStates: Record<string, boolean>): ModuleDefinition[] {
  return Array.from(registry.values(), (mod) => ({ ...mod, enabled: moduleStates[mod.id] ?? mod.enabled }));
}

// Register all modules in display order
registerModule(clockModule);
registerModule(bibleModule);
registerModule(weatherModule);
registerModule(focusModule);
registerModule(prayerModule);
registerModule(gratitudeModule);
registerModule(todoModule);
registerModule(quotesModule);
registerModule(quickActionsModule);
