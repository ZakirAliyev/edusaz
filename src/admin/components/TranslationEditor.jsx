import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { LANGUAGES } from '../lib/constants';
import { translateToAllLanguages } from '../lib/translate';
import { Field, Spinner } from './common';

/**
 * Per-language editor for translated fields, with one-click AI translation from Azerbaijani.
 * value: { [langCode]: { name, description } } — the `sourceLang` entry mirrors the main form fields.
 * fields: [{ key, label, multiline }]
 */
export function TranslationEditor({ value, onChange, source, fields, disabled, onBusyChange, sourceLang = 'az' }) {
  const [active, setActive] = useState(sourceLang === 'en' ? 'az' : 'en');
  const sourceName = LANGUAGES.find((l) => l.code === sourceLang)?.name || sourceLang;
  const [progress, setProgress] = useState(null);
  const translating = progress !== null;
  const lang = LANGUAGES.find((l) => l.code === active);
  const current = value?.[active] || {};
  const filledCount = LANGUAGES.filter((l) => value?.[l.code]?.[fields[0].key]).length;

  const update = (key, v) => onChange({ ...value, [active]: { ...current, [key]: v } });

  const autoTranslate = async () => {
    if (!Object.values(source).some((v) => v?.trim())) {
      toast.error('Əvvəlcə əsas dildə ad və ya təsvir daxil edin.');
      return;
    }
    setProgress(0);
    onBusyChange?.(true);
    try {
      const result = await translateToAllLanguages(source, (done, total) => setProgress(Math.round((done / total) * 100)), sourceLang);
      onChange({ ...value, ...result });
      toast.success(`${LANGUAGES.length} dilə tərcümə olundu. Yadda saxlamağı unutmayın.`);
    } catch {
      toast.error('Tərcümə zamanı xəta baş verdi.');
    } finally {
      setProgress(null);
      onBusyChange?.(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-foreground">Tərcümələr</h3>
          <p className="text-xs text-muted-foreground">
            {filledCount}/{LANGUAGES.length} dil doldurulub. {sourceName} əsas formdan götürülür.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={autoTranslate} disabled={disabled || translating} className="bg-card">
          {translating ? <Spinner /> : <Sparkles className="text-brand" />}
          {translating ? 'Tərcümə olunur…' : 'AI ilə hamısını tərcümə et'}
        </Button>
      </div>

      {translating && (
        <div className="space-y-1.5" aria-live="polite">
          <Progress value={progress} aria-label="Tərcümə gedişatı" />
          <p className="text-xs text-muted-foreground tabular-nums">{progress}% tamamlandı</p>
        </div>
      )}

      <div role="tablist" aria-label="Dil seçimi" className="flex flex-wrap gap-1.5">
        {LANGUAGES.map((l) => {
          const filled = !!value?.[l.code]?.[fields[0].key];
          const selected = l.code === active;
          return (
            <button
              key={l.code}
              type="button"
              role="tab"
              aria-selected={selected}
              title={l.name}
              onClick={() => setActive(l.code)}
              className={cn(
                'inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-medium',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:border-primary/40 hover:bg-accent'
              )}
            >
              <span aria-hidden>{l.flag}</span>
              {l.code.toUpperCase()}
              {filled && !selected && <Check aria-label="doldurulub" className="size-3 text-success" />}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="grid gap-4">
        {fields.map((f) => (
          <Field key={f.key} label={`${f.label} · ${lang.name}`}>
            {(p) =>
              f.multiline ? (
                <Textarea
                  {...p}
                  rows={3}
                  value={current[f.key] || ''}
                  onChange={(e) => update(f.key, e.target.value)}
                  disabled={disabled || translating || active === sourceLang}
                  dir={['ar', 'fa'].includes(active) ? 'rtl' : undefined}
                  className="bg-card"
                />
              ) : (
                <Input
                  {...p}
                  value={current[f.key] || ''}
                  onChange={(e) => update(f.key, e.target.value)}
                  disabled={disabled || translating || active === sourceLang}
                  dir={['ar', 'fa'].includes(active) ? 'rtl' : undefined}
                  className="bg-card"
                />
              )
            }
          </Field>
        ))}
        {active === sourceLang && <p className="text-xs text-muted-foreground">{sourceName} mətnini əsas sahələrdə dəyişin.</p>}
      </div>
    </div>
  );
}
