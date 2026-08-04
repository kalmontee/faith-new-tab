import { cn } from '@/shared/lib/utils';
import { getAllTranslations, type TranslationId } from '@/modules/bible/api/translations';

export function TranslationSelect({ value, onChange }: { value: TranslationId; onChange: (id: TranslationId) => void }) {
  const translations = getAllTranslations();
  return (
    <div className="flex rounded-lg border border-white/10 overflow-hidden text-sm">
      {translations.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'px-3 py-1.5 transition-colors',
            value === t.id ? 'bg-[#d4a547] text-black font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          {t.abbreviation}
        </button>
      ))}
    </div>
  );
}
