import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { FormDialog } from '../components/dialogs';
import { Field, FormSection, SimpleSelect } from '../components/common';
import { TranslationEditor } from '../components/TranslationEditor';
import {
  SCHOLARSHIP_COVERAGE_GROUPS,
  SCHOLARSHIP_ELIGIBILITY,
  SCHOLARSHIP_PLACES,
  SCHOLARSHIP_PROVIDERS,
  SCHOLARSHIP_STATUSES,
} from '../lib/constants';
import { apiRequest, errorMessage } from '../lib/api';
import { emptyTranslations } from '../lib/translate';
import { useOptionalAdminData } from '../hooks/useAdminData';

const EMPTY = {
  title: '',
  description: '',
  provider: '',
  universityId: '',
  countryId: '',
  coverage: SCHOLARSHIP_COVERAGE_GROUPS[0].options[0].value,
  amount: '',
  deadline: '',
  eligible: SCHOLARSHIP_ELIGIBILITY[0].value,
  places: '50 yer',
  status: 'Aktiv',
  translations: emptyTranslations(),
};

const withOption = (options, value) => (value && !options.some((o) => o.value === value) ? [...options, { value, label: value }] : options);
const coverageKnown = (v) => SCHOLARSHIP_COVERAGE_GROUPS.some((g) => g.options.some((o) => o.value === v));

/** Shared by the SuperAdmin panel and the university portal (see ProgramDialog). */
export function ScholarshipDialog({ open, onOpenChange, scholarship, universities: universitiesProp, countries: countriesProp, universityId: fixedUniversityId, defaults, onSaved }) {
  const admin = useOptionalAdminData();
  const universities = universitiesProp ?? admin?.universities ?? [];
  const countries = countriesProp ?? admin?.countries ?? [];
  const reload = () => (onSaved ? onSaved() : admin?.reload('scholarships'));
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const isEdit = !!scholarship;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (!scholarship) {
      setForm({ ...EMPTY, ...defaults, universityId: fixedUniversityId || '' });
      return;
    }
    const countryId = scholarship.countryId || countries.find((c) => c.name === scholarship.country)?.id || '';
    setForm({
      ...EMPTY,
      ...scholarship,
      countryId,
      universityId: fixedUniversityId || scholarship.universityId || '',
      coverage: scholarship.coverage || EMPTY.coverage,
      eligible: scholarship.eligible || EMPTY.eligible,
      places: scholarship.places || EMPTY.places,
      status: scholarship.status || 'Aktiv',
      translations: { ...emptyTranslations(), ...(scholarship.translations || {}) },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scholarship]);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const setMain = (key, trKey) => (value) => {
    setForm((f) => ({ ...f, [key]: value, translations: { ...f.translations, az: { ...f.translations.az, [trKey]: value } } }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Təqaüdün adı mütləqdir.';
    if (!form.provider.trim()) errs.provider = 'Təminatçı qurumu daxil edin.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    const translations = Object.fromEntries(
      Object.entries(form.translations)
        .filter(([, t]) => t?.name || t?.description)
        .map(([code, t]) => [code, { name: t.name || form.title, description: t.description || form.description, eligible: form.eligible }])
    );
    translations.az = { name: form.title.trim(), description: form.description, eligible: form.eligible };
    const payload = {
      universityId: form.universityId || null,
      name: form.title.trim(),
      nameAz: form.title.trim(),
      description: form.description,
      descriptionAz: form.description,
      location: form.provider.trim(),
      provider: form.provider.trim(),
      organization: form.provider.trim(),
      countryId: form.countryId || null,
      coverage: form.coverage,
      amount: form.amount || form.coverage,
      deadline: form.deadline || '',
      eligible: form.eligible,
      places: form.places,
      status: form.status,
      translations,
    };
    try {
      if (isEdit) await apiRequest(`/Scholarships/${scholarship.id}`, { method: 'PUT', body: payload });
      else await apiRequest('/Scholarships', { method: 'POST', body: payload });
      toast.success(isEdit ? 'Təqaüd yeniləndi.' : 'Təqaüd əlavə olundu.');
      reload();
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Təqaüd yadda saxlanmadı.'));
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
      title={isEdit ? 'Təqaüdü redaktə et' : 'Yeni təqaüd'}
      description={isEdit ? scholarship.title : 'Dövlət, fond və ya universitet təqaüdü əlavə edin.'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Yadda saxla' : 'Təqaüdü əlavə et'}
    >
      <FormSection title="Əsas məlumatlar">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Təqaüdün adı" required error={errors.title} className="sm:col-span-2">
            {(p) => <Input {...p} value={form.title} onChange={(e) => setMain('title', 'name')(e.target.value)} placeholder="Məs: Fulbright təqaüd proqramı" disabled={saving} />}
          </Field>
          <Field label="Təminatçı qurum" required error={errors.provider} hint="Siyahıdan seçin və ya özünüz yazın." className="sm:col-span-2">
            {(p) => (
              <>
                <Input {...p} value={form.provider} onChange={(e) => set('provider')(e.target.value)} list="scholarship-providers" placeholder="Məs: DAAD Fondu" disabled={saving} />
                <datalist id="scholarship-providers">
                  {SCHOLARSHIP_PROVIDERS.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
{!fixedUniversityId && (
                      <Field label="Universitet">
            {(p) => (
              <SimpleSelect
                id={p.id}
                value={form.universityId}
                onValueChange={(v) => {
                  const uni = universities.find((u) => u.id === v);
                  setForm((f) => ({ ...f, universityId: v, countryId: uni?.countryId || f.countryId }));
                }}
                options={universities.map((u) => ({ value: u.id, label: u.name }))}
                noneLabel="Qlobal / dövlət təqaüdü"
                disabled={saving}
              />
            )}
          </Field>
          )}
          <Field label="Ölkə">
            {(p) => (
              <SimpleSelect
                id={p.id}
                value={form.countryId}
                onValueChange={set('countryId')}
                options={countries.map((c) => ({ value: c.id, label: `${c.flag} ${c.name}` }))}
                noneLabel="Göstərilməyib"
                disabled={saving}
              />
            )}
          </Field>
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Şərtlər">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Əhatə dairəsi" className="sm:col-span-2">
            {(p) => (
              <SimpleSelect
                id={p.id}
                value={form.coverage}
                onValueChange={set('coverage')}
                groups={SCHOLARSHIP_COVERAGE_GROUPS}
                options={coverageKnown(form.coverage) ? [] : [{ value: form.coverage, label: form.coverage }]}
                disabled={saving}
              />
            )}
          </Field>
          <Field label="Təhsil pilləsi">
            {(p) => <SimpleSelect id={p.id} value={form.eligible} onValueChange={set('eligible')} options={withOption(SCHOLARSHIP_ELIGIBILITY, form.eligible)} disabled={saving} />}
          </Field>
          <Field label="Maliyyə dəyəri">
            {(p) => <Input {...p} value={form.amount} onChange={(e) => set('amount')(e.target.value)} placeholder="Məs: $30,000 / il" disabled={saving} />}
          </Field>
          <Field label="Son müraciət tarixi">
            {(p) => <Input {...p} type="date" value={form.deadline} onChange={(e) => set('deadline')(e.target.value)} disabled={saving} />}
          </Field>
          <Field label="Yer sayı">
            {(p) => <SimpleSelect id={p.id} value={form.places} onValueChange={set('places')} options={withOption(SCHOLARSHIP_PLACES, form.places)} disabled={saving} />}
          </Field>
          <Field label="Status">
            {(p) => <SimpleSelect id={p.id} value={form.status} onValueChange={set('status')} options={withOption(SCHOLARSHIP_STATUSES, form.status)} disabled={saving} />}
          </Field>
        </div>
      </FormSection>

      <Field label="Təsvir və qaydalar" hint="Azərbaycan dilində: tələblər (GPA, dil sertifikatı), seçim mərhələləri, müraciət qaydası.">
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
