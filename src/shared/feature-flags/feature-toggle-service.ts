import type { RawToggle } from '@/shared/types/feature-toggles';

export class FeatureToggleService {
  private readonly flags: Map<string, boolean>;

  constructor(toggles: RawToggle[]) {
    this.flags = new Map(toggles.map((t) => [t.name, t.enabled]));
  }

  isEnabled(flag: string): boolean {
    // Missing flag => false, so an undeclared flag fails dark.
    return this.flags.get(flag) === true;
  }
}
