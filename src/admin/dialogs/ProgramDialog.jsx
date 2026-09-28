import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { FormDialog } from '../components/dialogs';
import { Field, FormSection, SimpleSelect } from '../components/common';
import { TranslationEditor } from '../components/TranslationEditor';
import { CURRENCIES, DEGREES, DURATION_GROUPS, TEACHING_LANGUAGES, TUITION_PERIODS } from '../lib/constants';
import { apiRequest, errorMessage } from '../lib/api';
import { emptyTranslations } from '../lib/translate';
import { useOptionalAdminData } from '../hooks/useAdminData';

const EMPTY = {
  title: '',
  description: '',
  universityId: '',
  degree: 'Bakalavr',
  tuitionAmount: '',
  tuitionCurrency: 'AZN',
  tuitionPeriod: '/ il',
  duration: '4 il',
  language: 'İngilis dili',
  translations: emptyTranslations(),
};

/** "3,500 USD / semestr" → { amount: '3500', currency: 'USD', period: '/ semestr' } */
export function parseTuitionFee(fee) {
  const clean = String(fee || '').replace(/,/g, '').trim();
  const amount = clean.match(/\d+(\.\d+)?/)?.[0] || '';
  const currency =
    [['USD', /USD|\$/], ['EUR', /EUR|€/], ['GBP', /GBP|£/], ['TRY', /TRY|₺|TL/], ['PLN', /PLN|zł/], ['CAD', /CAD/], ['AUD', /AUD/]].find(([, re]) => re.test(clean))?.[0] ||
    'AZN';
  const period = /semestr/.test(clean) ? '/ semestr' : /ümumi|total/.test(clean) ? '/ ümumi proqram' : /\/ ay|aylıq|month/.test(clean) ? '/ ay' : '/ il';
  return { amount, currency, period };
}

const withOption = (options, value) => (value && !options.some((o) => o.value === value) ? [...options, { value, label: value }] : options);

/**
 * Used by the SuperAdmin panel (data from AdminDataProvider) and the university portal,
 * which passes `universities`, `onSaved` and a fixed `universityId`.
 */
export function ProgramDialog({ open, onOpenChange, program, universities: universitiesProp, universityId: fixedUniversityId, onSaved }) {
  const admin = useOptionalAdminData();
  const universities = universitiesProp ?? admin?.universities ?? [];
  const reload = () => (onSaved ? onSaved() : admin?.reload('programs'));
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const isEdit = !!program;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (!program) {
      setForm({ ...EMPTY, universityId: fixedUniversityId || '' });
      return;
    }
    const fee = parseTuitionFee(program.tuitionFee);
    const universityId = fixedUniversityId || program.universityId || universities.find((u) => u.name === program.university)?.id || '';
    setForm({
      ...EMPTY,
      title: program.title,
      description: program.description,
      universityId,
      degree: program.degree || 'Bakalavr',
      tuitionAmount: fee.amount,
      tuitionCurrency: fee.currency,
      tuitionPeriod: fee.period,
      duration: program.duration || '4 il',
      language: program.language || 'İngilis dili',
      translations: { ...emptyTranslations(), ...(program.translations || {}) },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, program]);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // The Azerbaijani translation always mirrors the main fields.
  const setMain = (key, trKey) => (value) =>
    setForm((f) => ({ ...f, [key]: value, translations: { ...f.translations, az: { ...f.translations.az, [trKey]: value } } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Proqramın adı mütləqdir.';
    if (form.tuitionAmount === '' || Number(form.tuitionAmount) < 0) errs.tuitionAmount = 'Məbləği daxil edin.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    const translations = Object.fromEntries(
      Object.entries(form.translations)
        .filter(([, t]) => t?.name || t?.description)
        .map(([code, t]) => [code, { title: t.name || form.title, description: t.description || form.description }])
    );
    translations.az = { title: form.title.trim(), description: form.description };
    const tuitionFee = `${form.tuitionAmount} ${form.tuitionCurrency} ${form.tuitionPeriod}`;
    const payload = {
      universityId: form.universityId || null,
      title: form.title.trim(),
      titleAz: form.title.trim(),
      description: form.description,
      descriptionAz: form.description,
      degreeLevel: form.degree,
      level: form.degree,
      tuitionFee,
      duration: form.duration,
      languageOfInstruction: form.language,
      teachingLanguage: form.language,
      translations,
    };
    try {
      if (isEdit) await apiRequest(`/Programs/${program.id}`, { method: 'PUT', body: payload });
      else await apiRequest('/Programs', { method: 'POST', body: payload });
      toast.success(isEdit ? 'Proqram yeniləndi.' : 'Proqram əlavə olundu.');
      reload();
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Proqram yadda saxlanmadı.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      busy={saving}
      submitDisabled={translating}
      title={isEdit ? 'Proqramı redaktə et' : 'Yeni proqram'}
      description={isEdit ? program.title : 'İxtisas və ya təhsil proqramı əlavə edin.'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Yadda saxla' : 'Proqramı əlavə et'}
    >
      <FormSection title="Əsas məlumatlar">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Proqramın adı" required error={errors.title} className="sm:col-span-2">
            {(p) => <Input {...p} value={form.title} onChange={(e) => setMain('title', 'name')(e.target.value)} placeholder="Məs: Kompüter elmləri" disabled={saving} />}
          </Field>
{!fixedUniversityId && (
                      <Field label="Universitet" hint="Boş qalsa, ümumi ixtisas kimi göstərilir.">
            {(p) => (
              <SimpleSelect
                id={p.id}
                value={form.universityId}
                onValueChange={set('universityId')}
                options={universities.map((u) => ({ value: u.id, label: u.name }))}
                noneLabel="Universitet seçilməyib"
                disabled={saving}
              />
            )}
          </Field>
          )}
          <Field label="Dərəcə" required>
            {(p) => <SimpleSelect id={p.id} value={form.degree} onValueChange={set('degree')} options={withOption(DEGREES, form.degree)} disabled={saving} />}
          </Field>
          <Field label="Tədris dili" required>
            {(p) => <SimpleSelect id={p.id} value={form.language} onValueChange={set('language')} options={withOption(TEACHING_LANGUAGES, form.language)} disabled={saving} />}
          </Field>
          <Field label="Müddət" required>
            {(p) => (
              <SimpleSelect
                id={p.id}
                value={form.duration}
                onValueChange={set('duration')}
                groups={DURATION_GROUPS}
                options={DURATION_GROUPS.some((g) => g.options.some((o) => o.value === form.duration)) ? [] : [{ value: form.duration, label: form.duration }]}
                disabled={saving}
              />
            )}
          </Field>
        </div>
      </FormSection>

      <FormSection title="Təhsil haqqı">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Məbləğ" required error={errors.tuitionAmount}>
            {(p) => (
              <Input {...p} type="number" inputMode="decimal" min="0" value={form.tuitionAmount} onChange={(e) => set('tuitionAmount')(e.target.value)} placeholder="3500" disabled={saving} />
            )}
          </Field>
          <Field label="Valyuta">
            {(p) => <SimpleSelect id={p.id} value={form.tuitionCurrency} onValueChange={set('tuitionCurrency')} options={CURRENCIES} disabled={saving} />}
          </Field>
          <Field label="Dövr">
            {(p) => <SimpleSelect id={p.id} value={form.tuitionPeriod} onValueChange={set('tuitionPeriod')} options={TUITION_PERIODS} disabled={saving} />}
          </Field>
        </div>
      </FormSection>

      <Field label="Təsvir" hint="Azərbaycan dilində: tədris planı, karyera imkanları, qəbul şərtləri.">
        {(p) => <Textarea {...p} rows={4} value={form.description} onChange={(e) => setMain('description', 'description')(e.target.value)} disabled={saving} />}
      </Field>

      <Separator />

      <TranslationEditor
        value={form.translations}
        onChange={set('translations')}
        source={{ name: form.title.trim(), description: form.description.trim() }}
        fields={[
          { key: 'name', label: 'Ad' },
          { key: 'description', label: 'Təsvir', multiline: true },
        ]}
        disabled={saving}
        onBusyChange={setTranslating}
      />
    </FormDialog>
  );
}
