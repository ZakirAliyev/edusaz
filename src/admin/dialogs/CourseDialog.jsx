import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Languages, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FormDialog } from '../components/dialogs';
import { Field, FormSection, SimpleSelect } from '../components/common';
import { ImageField } from '../components/MediaFields';
import { COURSE_CATEGORY_GROUPS, COURSE_CURRENCIES, COURSE_LANGUAGES, COURSE_LEVELS } from '../lib/constants';
import { apiRequest, errorMessage } from '../lib/api';
import { useAdminData } from '../hooks/useAdminData';

const newLecture = (n) => ({ title: `${n}. Dərs`, videoUrl: '', durationMinutes: 15, isFree: n === 1 });

const EMPTY = {
  title: '',
  shortDescription: '',
  description: '',
  whatYouLearn: '',
  requirements: '',
  category: 'Proqramlaşdırma',
  instructorName: 'Edusaz Academy',
  level: 'Bütün Səviyyələr',
  language: 'az',
  isFree: true,
  price: '',
  discountPrice: '',
  currency: 'AZN',
  thumbnailUrl: '',
  previewVideoUrl: '',
  isPublished: true,
  videoLectures: [newLecture(1)],
};

const categoryKnown = (v) => COURSE_CATEGORY_GROUPS.some((g) => g.options.some((o) => o.value === v));
const withOption = (options, value) => (value && !options.some((o) => o.value === value) ? [...options, { value, label: value }] : options);
const isHttpUrl = (s) => /^https?:\/\/\S+\.\S+/i.test(s);

export function CourseDialog({ open, onOpenChange, course }) {
  const { reload } = useAdminData();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEdit = !!course;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (!course) {
      setForm(EMPTY);
      return;
    }
    const controller = new AbortController();
    setLoadingDetail(true);
    apiRequest(`/Courses/${course.id}?lang=az`, { signal: controller.signal })
      .then((d) => {
        const lectures = (d.sections || []).flatMap((s) => s.lectures || []);
        setForm({
          ...EMPTY,
          title: d.title || '',
          shortDescription: d.shortDescription || '',
          description: d.description || '',
          whatYouLearn: d.whatYouLearn || '',
          requirements: d.requirements || '',
          category: d.category || EMPTY.category,
          instructorName: d.instructorName || EMPTY.instructorName,
          level: d.level || EMPTY.level,
          language: d.language || 'az',
          isFree: !!d.isFree || Number(d.price) === 0,
          price: d.price ? String(d.price) : '',
          discountPrice: d.discountPrice ? String(d.discountPrice) : '',
          currency: d.currency || 'AZN',
          thumbnailUrl: d.thumbnailUrl || '',
          previewVideoUrl: d.previewVideoUrl || '',
          isPublished: d.isPublished !== false,
          videoLectures: lectures.length
            ? lectures.map((l) => ({ title: l.title || '', videoUrl: l.videoUrl || '', durationMinutes: l.durationMinutes || 15, isFree: !!l.isFree }))
            : [newLecture(1)],
        });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        toast.error(errorMessage(err, 'Kursun məlumatları yüklənmədi.'));
        onOpenChange(false);
      })
      .finally(() => setLoadingDetail(false));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, course]);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const setLecture = (idx, key, value) =>
    setForm((f) => ({ ...f, videoLectures: f.videoLectures.map((l, i) => (i === idx ? { ...l, [key]: value } : l)) }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Kursun adı mütləqdir.';
    if (!form.isFree && !(Number(form.price) > 0)) e.price = 'Ödənişli kurs üçün qiymət daxil edin.';
    if (!form.isFree && form.discountPrice && Number(form.discountPrice) >= Number(form.price)) e.discountPrice = 'Endirimli qiymət əsas qiymətdən az olmalıdır.';
    if (form.previewVideoUrl && !isHttpUrl(form.previewVideoUrl)) e.previewVideoUrl = 'Link https:// ilə başlamalıdır.';
    const badLecture = form.videoLectures.findIndex((l) => l.videoUrl && !isHttpUrl(l.videoUrl));
    if (badLecture >= 0) e.lectures = `${badLecture + 1}-ci dərsin video linki düzgün deyil.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const price = form.isFree ? 0 : parseFloat(form.price) || 0;
    const payload = {
      title: form.title.trim(),
      shortDescription: form.shortDescription,
      description: form.description,
      whatYouLearn: form.whatYouLearn,
      requirements: form.requirements,
      category: form.category,
      level: form.level,
      language: form.language,
      price,
      discountPrice: form.isFree ? 0 : parseFloat(form.discountPrice) || 0,
      currency: form.currency,
      isFree: price === 0,
      thumbnailUrl: form.thumbnailUrl,
      previewVideoUrl: form.previewVideoUrl.trim(),
      instructorName: form.instructorName.trim() || 'Edusaz Academy',
      baseLanguageCode: 'az',
      isPublished: form.isPublished,
      videoLectures: form.videoLectures
        .filter((l) => l.title.trim())
        .map((l) => ({ ...l, title: l.title.trim(), videoUrl: l.videoUrl.trim(), durationMinutes: Number(l.durationMinutes) || 15 })),
    };
    try {
      if (isEdit) await apiRequest(`/Courses/${course.id}`, { method: 'PUT', body: payload });
      else await apiRequest('/Courses', { method: 'POST', body: payload });
      toast.success(isEdit ? 'Kurs yeniləndi.' : 'Kurs əlavə olundu.');
      reload('courses');
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Kurs yadda saxlanmadı.'));
    } finally {
      setSaving(false);
    }
  };

  const disabled = saving || loadingDetail;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      busy={saving}
      submitDisabled={loadingDetail || uploading}
      title={isEdit ? 'Kursu redaktə et' : 'Yeni kurs'}
      description={isEdit ? course.title : 'Onlayn kurs və onun video dərslərini əlavə edin.'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Yadda saxla' : 'Kursu əlavə et'}
    >
      {loadingDetail ? (
        <div className="space-y-4" aria-busy="true" aria-label="Kurs yüklənir">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <>
          <FormSection title="Əsas məlumatlar">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kursun adı" required error={errors.title} className="sm:col-span-2">
                {(p) => <Input {...p} value={form.title} onChange={(e) => set('title')(e.target.value)} placeholder="Məs: React ilə veb proqramlaşdırma" disabled={disabled} />}
              </Field>
              <Field label="Qısa təsvir" hint="Kartda göstərilən bir cümləlik təsvir." className="sm:col-span-2">
                {(p) => <Input {...p} value={form.shortDescription} onChange={(e) => set('shortDescription')(e.target.value)} maxLength={160} disabled={disabled} />}
              </Field>
              <Field label="Kateqoriya" required>
                {(p) => (
                  <SimpleSelect
                    id={p.id}
                    value={form.category}
                    onValueChange={set('category')}
                    groups={COURSE_CATEGORY_GROUPS}
                    options={categoryKnown(form.category) ? [] : [{ value: form.category, label: form.category }]}
                    disabled={disabled}
                  />
                )}
              </Field>
              <Field label="Təlimçi / tədris mərkəzi">
                {(p) => <Input {...p} value={form.instructorName} onChange={(e) => set('instructorName')(e.target.value)} disabled={disabled} />}
              </Field>
              <Field label="Səviyyə">
                {(p) => <SimpleSelect id={p.id} value={form.level} onValueChange={set('level')} options={withOption(COURSE_LEVELS, form.level)} disabled={disabled} />}
              </Field>
              <Field label="Tədris dili">
                {(p) => <SimpleSelect id={p.id} value={form.language} onValueChange={set('language')} options={withOption(COURSE_LANGUAGES, form.language)} disabled={disabled} />}
              </Field>
            </div>
          </FormSection>

          <Separator />

          <FormSection title="Qiymət və yayım">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
                <span>
                  <span className="block text-sm font-medium text-foreground">Pulsuz kurs</span>
                  <span className="block text-xs text-muted-foreground">Hər kəs ödənişsiz qoşula bilər</span>
                </span>
                <Switch checked={form.isFree} onCheckedChange={set('isFree')} disabled={disabled} />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
                <span>
                  <span className="block text-sm font-medium text-foreground">Dərc olunub</span>
                  <span className="block text-xs text-muted-foreground">Söndürülsə, qaralama kimi gizli qalır</span>
                </span>
                <Switch checked={form.isPublished} onCheckedChange={set('isPublished')} disabled={disabled} />
              </label>
            </div>
            {!form.isFree && (
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Qiymət" required error={errors.price}>
                  {(p) => <Input {...p} type="number" inputMode="decimal" min="0" step="0.01" value={form.price} onChange={(e) => set('price')(e.target.value)} disabled={disabled} />}
                </Field>
                <Field label="Endirimli qiymət" error={errors.discountPrice} hint="İstəyə bağlı">
                  {(p) => (
                    <Input {...p} type="number" inputMode="decimal" min="0" step="0.01" value={form.discountPrice} onChange={(e) => set('discountPrice')(e.target.value)} disabled={disabled} />
                  )}
                </Field>
                <Field label="Valyuta">
                  {(p) => <SimpleSelect id={p.id} value={form.currency} onValueChange={set('currency')} options={COURSE_CURRENCIES} disabled={disabled} />}
                </Field>
              </div>
            )}
          </FormSection>

          <Separator />

          <FormSection title="Kart şəkli">
            <ImageField value={form.thumbnailUrl} onChange={set('thumbnailUrl')} folder="courses" disabled={disabled} onBusyChange={setUploading} />
          </FormSection>

          <Field label="Tanıtım videosu" error={errors.previewVideoUrl} hint="YouTube, Vimeo və ya MP4 linki">
            {(p) => (
              <div className="flex gap-2">
                <Input {...p} type="url" inputMode="url" value={form.previewVideoUrl} onChange={(e) => set('previewVideoUrl')(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" disabled={disabled} />
                {isHttpUrl(form.previewVideoUrl) && (
                  <Button asChild variant="outline" size="icon" aria-label="Videonu yeni pəncərədə aç">
                    <a href={form.previewVideoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink /></a>
                  </Button>
                )}
              </div>
            )}
          </Field>

          <Separator />

          <FormSection title="Video dərslər" description={`${form.videoLectures.length} dərs · adı boş olan dərslər yadda saxlanmır`}>
            <ol className="space-y-3">
              {form.videoLectures.map((lec, idx) => (
                <li key={idx} className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[auto_1fr_1.4fr_6rem_auto] sm:items-center">
                  <span className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground tabular-nums">{idx + 1}</span>
                  <Input aria-label={`${idx + 1}-ci dərsin adı`} value={lec.title} onChange={(e) => setLecture(idx, 'title', e.target.value)} placeholder="Dərsin adı" disabled={disabled} />
                  <Input
                    aria-label={`${idx + 1}-ci dərsin video linki`}
                    type="url"
                    inputMode="url"
                    value={lec.videoUrl}
                    onChange={(e) => setLecture(idx, 'videoUrl', e.target.value)}
                    placeholder="Video linki"
                    disabled={disabled}
                  />
                  <div className="relative">
                    <Input
                      aria-label={`${idx + 1}-ci dərsin müddəti (dəqiqə)`}
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={lec.durationMinutes}
                      onChange={(e) => setLecture(idx, 'durationMinutes', e.target.value)}
                      className="pr-10"
                      disabled={disabled}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">dəq</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setForm((f) => ({ ...f, videoLectures: f.videoLectures.filter((_, i) => i !== idx) }))}
                    disabled={disabled || form.videoLectures.length === 1}
                    aria-label={`${idx + 1}-ci dərsi sil`}
                    className="justify-self-end text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ol>
            {errors.lectures && <p className="text-xs font-medium text-destructive" role="alert">{errors.lectures}</p>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setForm((f) => ({ ...f, videoLectures: [...f.videoLectures, newLecture(f.videoLectures.length + 1)] }))}
              disabled={disabled}
            >
              <Plus />
              Dərs əlavə et
            </Button>
          </FormSection>

          <Separator />

          <FormSection title="Ətraflı məlumat" description="Azərbaycan dilində yazın.">
            <div className="grid gap-4">
              <Field label="Təsvir">
                {(p) => <Textarea {...p} rows={4} value={form.description} onChange={(e) => set('description')(e.target.value)} disabled={disabled} />}
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nə öyrənəcəksiniz" hint="Hər bəndi yeni sətirdə yazın.">
                  {(p) => <Textarea {...p} rows={4} value={form.whatYouLearn} onChange={(e) => set('whatYouLearn')(e.target.value)} disabled={disabled} />}
                </Field>
                <Field label="Tələblər" hint="Hər bəndi yeni sətirdə yazın.">
                  {(p) => <Textarea {...p} rows={4} value={form.requirements} onChange={(e) => set('requirements')(e.target.value)} disabled={disabled} />}
                </Field>
              </div>
            </div>
          </FormSection>

          <div className="flex gap-3 rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
            <Languages className="mt-0.5 size-4 shrink-0" />
            <p>Kursun adı və təsviri yadda saxlanan kimi server tərəfindən 31 dilə avtomatik tərcümə olunur. Bu bir neçə saniyə çəkə bilər.</p>
          </div>
        </>
      )}
    </FormDialog>
  );
}
