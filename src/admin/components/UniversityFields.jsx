import { Languages } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Field, FormSection, SimpleSelect } from './common';
import { GalleryField, ImageField, VideoLinksField } from './MediaFields';

// Shared by the SuperAdmin university dialog and the university portal profile page.

export const UNIVERSITY_EMPTY = {
  name: '',
  countryId: '',
  country: '',
  city: '',
  logoUrl: '',
  establishedYear: '',
  ranking: '',
  tuition: '',
  acceptanceRate: '',
  teachingLanguage: '',
  deadline: '',
  website: '',
  hasScholarship: true,
  description: '',
  status: 'Active',
  images: [],
  videoUrls: [],
};

export function universityToForm(university, countries) {
  if (!university) return UNIVERSITY_EMPTY;
  const countryId =
    (university.countryId && countries.some((c) => c.id === university.countryId) && university.countryId) ||
    countries.find((c) => c.name && c.name.toLowerCase() === (university.country || '').toLowerCase())?.id ||
    '';
  return {
    ...UNIVERSITY_EMPTY,
    ...Object.fromEntries(Object.keys(UNIVERSITY_EMPTY).map((k) => [k, university[k] ?? UNIVERSITY_EMPTY[k]])),
    establishedYear: university.establishedYear ? String(university.establishedYear) : '',
    countryId,
    website: university.website || '',
  };
}

export function validateUniversity(form) {
  const e = {};
  if (!form.name.trim()) e.name = 'Universitetin adı mütləqdir.';
  if (!form.countryId) e.countryId = 'Ölkə seçin.';
  if (!form.city.trim()) e.city = 'Şəhər mütləqdir.';
  const year = Number(form.establishedYear);
  if (form.establishedYear && (!Number.isInteger(year) || year < 1000 || year > new Date().getFullYear())) {
    e.establishedYear = 'Düzgün il daxil edin.';
  }
  if (form.website && !/^https?:\/\/\S+\.\S+/.test(form.website)) e.website = 'Link https:// ilə başlamalıdır.';
  return e;
}

export const toUniversityPayload = (form, countries) => ({
  name: form.name.trim(),
  country: countries.find((c) => c.id === form.countryId)?.name || form.country,
  countryId: form.countryId || null,
  city: form.city.trim(),
  logoUrl: form.logoUrl || '',
  websiteUrl: form.website.trim(),
  establishedYear: parseInt(form.establishedYear, 10) || 0,
  tuition: form.tuition,
  acceptanceRate: form.acceptanceRate,
  teachingLanguage: form.teachingLanguage,
  deadline: form.deadline,
  ranking: form.ranking,
  hasScholarship: form.hasScholarship,
  description: form.description,
  images: form.images || [],
  videoUrls: form.videoUrls || [],
  baseLanguageCode: 'az',
});

/** `extraAdmissionField` is rendered at the end of the "Qəbul və təhsil" grid (e.g. an approval status select). */
export function UniversityFields({ form, set, errors, countries, disabled, onBusy, extraAdmissionField }) {
  return (
    <>
      <FormSection title="Əsas məlumatlar">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Universitetin adı" required error={errors.name} className="sm:col-span-2">
            {(p) => <Input {...p} value={form.name} onChange={(e) => set('name')(e.target.value)} placeholder="Məs: ADA Universiteti" disabled={disabled} />}
          </Field>
          <Field label="Ölkə" required error={errors.countryId}>
            {(p) => (
              <SimpleSelect
                id={p.id}
                value={form.countryId}
                onValueChange={set('countryId')}
                options={countries.map((c) => ({ value: c.id, label: `${c.flag} ${c.name}` }))}
                placeholder="Ölkə seçin"
                invalid={!!errors.countryId}
                disabled={disabled}
              />
            )}
          </Field>
          <Field label="Şəhər" required error={errors.city}>
            {(p) => <Input {...p} value={form.city} onChange={(e) => set('city')(e.target.value)} placeholder="Məs: Bakı" disabled={disabled} />}
          </Field>
          <Field label="Təsvir" hint="Azərbaycan dilində yazın." className="sm:col-span-2">
            {(p) => (
              <Textarea
                {...p}
                rows={4}
                value={form.description}
                onChange={(e) => set('description')(e.target.value)}
                placeholder="Universitetin güclü tərəfləri, ixtisasları, kampus həyatı…"
                disabled={disabled}
              />
            )}
          </Field>
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Qəbul və təhsil">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Reytinq">
            {(p) => <Input {...p} value={form.ranking} onChange={(e) => set('ranking')(e.target.value)} placeholder="Məs: Top 100" disabled={disabled} />}
          </Field>
          <Field label="Təsis ili" error={errors.establishedYear}>
            {(p) => (
              <Input {...p} type="number" inputMode="numeric" value={form.establishedYear} onChange={(e) => set('establishedYear')(e.target.value)} placeholder="1919" disabled={disabled} />
            )}
          </Field>
          <Field label="İllik təhsil haqqı">
            {(p) => <Input {...p} value={form.tuition} onChange={(e) => set('tuition')(e.target.value)} placeholder="4,500 AZN / il" disabled={disabled} />}
          </Field>
          <Field label="Qəbul faizi">
            {(p) => <Input {...p} value={form.acceptanceRate} onChange={(e) => set('acceptanceRate')(e.target.value)} placeholder="45%" disabled={disabled} />}
          </Field>
          <Field label="Tədris dili">
            {(p) => <Input {...p} value={form.teachingLanguage} onChange={(e) => set('teachingLanguage')(e.target.value)} placeholder="İngilis dili" disabled={disabled} />}
          </Field>
          <Field label="Son müraciət tarixi">
            {(p) => <Input {...p} value={form.deadline} onChange={(e) => set('deadline')(e.target.value)} placeholder="30 iyul 2026" disabled={disabled} />}
          </Field>
          <Field label="Rəsmi sayt" error={errors.website} className="sm:col-span-2">
            {(p) => <Input {...p} type="url" inputMode="url" value={form.website} onChange={(e) => set('website')(e.target.value)} placeholder="https://ada.edu.az" disabled={disabled} />}
          </Field>
          {extraAdmissionField}
        </div>
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
          <span>
            <span className="block text-sm font-medium text-foreground">Təqaüd imkanı var</span>
            <span className="block text-xs text-muted-foreground">Tələbələr üçün təqaüd proqramları təklif olunur</span>
          </span>
          <Switch checked={form.hasScholarship} onCheckedChange={set('hasScholarship')} disabled={disabled} />
        </label>
      </FormSection>

      <Separator />

      <FormSection title="Loqo / əsas şəkil">
        <ImageField value={form.logoUrl} onChange={set('logoUrl')} folder="universities" disabled={disabled} onBusyChange={onBusy} />
      </FormSection>

      <FormSection title="Kampus qalereyası" description={`${form.images.length} şəkil`}>
        <GalleryField value={form.images} onChange={set('images')} folder="universities" disabled={disabled} onBusyChange={onBusy} />
      </FormSection>

      <FormSection title="Video linkləri" description="YouTube, Vimeo və ya tanıtım videoları">
        <VideoLinksField value={form.videoUrls} onChange={set('videoUrls')} disabled={disabled} />
      </FormSection>

      <div className="flex gap-3 rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
        <Languages className="mt-0.5 size-4 shrink-0" />
        <p>Ad, şəhər və təsvir yadda saxlanan kimi server tərəfindən 31 dilə avtomatik tərcümə olunur.</p>
      </div>
    </>
  );
}
