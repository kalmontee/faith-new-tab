import { Suspense, Fragment } from 'react';
import { m } from 'framer-motion';

import { resolveModules } from '@/shared/lib/module-registry';
import { useSettingsStore } from '@/shared/store/settings-store';

function ModuleSkeleton() {
  return <div className="h-full w-full rounded-2xl bg-white/5 animate-pulse" />;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

export function ModuleRenderer() {
  const moduleStates = useSettingsStore((s) => s.moduleStates);
  const modules = resolveModules(moduleStates).filter((mod) => mod.enabled);

  return (
    <Fragment>
      {modules.map((mod, index) => (
        <m.div
          key={mod.id}
          style={{ gridArea: mod.gridArea }}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Suspense fallback={<ModuleSkeleton />}>
            <mod.component />
          </Suspense>
        </m.div>
      ))}
    </Fragment>
  );
}
