import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Info, ListVideo, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCreateCourseMutation, useGetInstructorCourseByIdQuery, useUpdateCourseMutation } from '@/services/apis/userApi';
import { Field, FormSection, SimpleSelect, Spinner } from '@/admin/components/common';
import { ImageField } from '@/admin/components/MediaFields';
import { TranslationEditor } from '@/admin/components/TranslationEditor';
import { LANGUAGES } from '@/admin/lib/constants';
import { errorMessage } from '@/admin/lib/api';
import { useInstructor } from '../layout/InstructorLayout';
import { CATEGORIES, CURRENCIES, LECTURE_TYPES, LEVELS, convertToAZN } from '../lib/constants';

let uid = 0;
const nextKey = () => `k${Date.now().toString(36)}${(uid += 1)}`;
const isGuid = (v) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const isHttpUrl = (s) => /^https?:\/\/\S+\.\S+/i.test(s);

const newLecture = () => ({ key: nextKey(), title: '', videoUrl: '', durationMinutes: '', isFree: false, lectureType: 'Video' });
const newSection = () => ({ key: nextKey(), title: '', description: '', lectures: [newLecture()] });

const EMPTY = {
  title: '',
  shortDescription: '',
  description: '',
  whatYouLearn: '',
  requirements: '',
  category: 'Programming',
  subCategory: '',
  tags: '',
  language: 'az',
  level: 'Beginner',
  isFree: false,
  price: '',
  discountPrice: '',
  currency: 'AZN',
  thumbnailUrl: '',
  previewVideoUrl: '',
  isPublished: false,
  sections: [],
  translations: {},
};

const TRANSLATED_FIELDS = ['title', 'shortDescription', 'description', 'whatYouLearn', 'requirements'];

const fromDetail = (d) => ({
  ...EMPTY,
  ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, d[k] ?? EMPTY[k]])),
  price: d.price ? String(d.price) : '',
  discountPrice: d.discountPrice ? String(d.discountPrice) : '',
  currency: d.currency || 'AZN',
  sections: (d.sections || []).map((s) => ({
    key: nextKey(),
    id: s.id,
    title: s.title || '',
    description: s.description || '',
    lectures: (s.lectures || []).map((l) => ({
      key: nextKey(),
      id: l.id,
      title: l.title || '',
      description: l.description || '',
      videoUrl: l.videoUrl || '',
      resourceUrl: l.resourceUrl || '',
      durationMinutes: l.durationMinutes ? String(l.durationMinutes) : '',
      isFree: !!l.isFree,
      lectureType: l.lectureType || 'Video',
    })),
  })),
  translations: d.translations || {},
});

const FIELD_TAB = { title: 'basic', price: 'pricing', discountPrice: 'pricing', previewVideoUrl: 'pricing', curriculum: 'curriculum' };

function validate(form) {
  const e = {};
  if (!form.title.trim()) e.title = 'Kursun adı mütləqdir.';
  if (!form.isFree) {
    if (!(Number(form.price) > 0)) e.price = 'Ödənişli kurs üçün qiymət daxil edin.';
    else if (form.discountPrice && Number(form.discountPrice) >= Number(form.price)) e.discountPrice = 'Endirimli qiymət əsas qiymətdən az olmalıdır.';
  }
  if (form.previewVideoUrl && !isHttpUrl(form.previewVideoUrl)) e.previewVideoUrl = 'Link https:// ilə başlamalıdır.';
  form.sections.forEach((s, si) => {
    if (!s.title.trim()) e.curriculum = e.curriculum || `${si + 1}-ci bölmənin adı boşdur.`;
    s.lectures.forEach((l, li) => {
      if (!l.title.trim()) e.curriculum = e.curriculum || `${si + 1}.${li + 1} dərsin adı boşdur.`;
      else if (l.videoUrl && !isHttpUrl(l.videoUrl)) e.curriculum = e.curriculum || `${si + 1}.${li + 1} dərsin video linki düzgün deyil.`;
    });
  });
  return e;
}

function toPayload(form, email) {
  const sourceTranslation = Object.fromEntries(TRANSLATED_FIELDS.map((k) => [k, form[k]]));
  const translations = Object.fromEntries(
    Object.entries({ ...form.translations, [form.language]: sourceTranslation })
      .filter(([, t]) => t && (t.title || t.description || t.shortDescription))
      .map(([code, t]) => [code, Object.fromEntries(TRANSLATED_FIELDS.map((k) => [k, t[k] || '']))])
  );
  const price = form.isFree ? 0 : Number(form.price) || 0;
  return {
    email,
    title: form.title.trim(),
    shortDescription: form.shortDescription,
    description: form.description,
    whatYouLearn: form.whatYouLearn,
    requirements: form.requirements,
    category: form.category,
    subCategory: form.subCategory,
    tags: form.tags,
    language: form.language,
    level: form.level,
    isFree: price === 0,
    price,
    discountPrice: form.isFree ? 0 : Number(form.discountPrice) || 0,
    currency: form.currency,
    thumbnailUrl: form.thumbnailUrl,
    previewVideoUrl: form.previewVideoUrl.trim(),
    isPublished: form.isPublished,
    sections: form.sections.map((s, si) => ({
      id: isGuid(s.id) ? s.id : undefined,
      title: s.title.trim(),
      description: s.description || '',
      order: si + 1,
      lectures: s.lectures.map((l, li) => ({
        id: isGuid(l.id) ? l.id : undefined,
        title: l.title.trim(),
        description: l.description || '',
        videoUrl: l.videoUrl.trim(),
        resourceUrl: l.resourceUrl || '',
        durationMinutes: parseInt(l.durationMinutes, 10) || 0,
        isFree: l.isFree,
        lectureType: l.lectureType,
        order: li + 1,
      })),
    })),
    translations,
  };
}

const move = (list, from, to) => {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};

function Curriculum({ sections, onChange, disabled }) {
  const setSection = (si, patch) => onChange(sections.map((s, i) => (i === si ? { ...s, ...patch } : s)));
  const setLecture = (si, li, patch) =>
    setSection(si, { lectures: sections[si].lectures.map((l, i) => (i === li ? { ...l, ...patch } : l)) });

  const totalLectures = sections.reduce((n, s) => n + s.lectures.length, 0);
  const totalMinutes = sections.reduce((n, s) => n + s.lectures.reduce((m, l) => m + (parseInt(l.durationMinutes, 10) || 0), 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {sections.length} bölmə · {totalLectures} dərs · {Math.floor(totalMinutes / 60)} saat {totalMinutes % 60} dəq
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...sections, newSection()])} disabled={disabled}>
          <Plus />
          Bölmə əlavə et
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-12 text-center">
          <ListVideo className="size-6 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Kurs proqramı boşdur</p>
            <p className="text-sm text-muted-foreground">Dərsləri bölmələrə ayırın — məsələn, «Giriş», «Əsas mövzular», «Layihə».</p>
          </div>
          <Button type="button" size="sm" onClick={() => onChange([newSection()])} disabled={disabled}>
            <Plus />
            İlk bölməni əlavə et
          </Button>
        </div>
      ) : (
        <ol className="space-y-4">
          {sections.map((section, si) => (
            <li key={section.key} className="rounded-xl border bg-card shadow-xs">
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <span className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Bölmə {si + 1}</span>
                <Input
                  aria-label={`${si + 1}-ci bölmənin adı`}
                  value={section.title}
                  onChange={(e) => setSection(si, { title: e.target.value })}
                  placeholder="Bölmənin adı"
                  className="h-8 flex-1 font-medium"
                  disabled={disabled}
                />
                <div className="flex shrink-0 items-center">
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Bölməni yuxarı apar" onClick={() => onChange(move(sections, si, si - 1))} disabled={disabled || si === 0}>
                    <ArrowUp />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Bölməni aşağı apar" onClick={() => onChange(move(sections, si, si + 1))} disabled={disabled || si === sections.length - 1}>
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Bölməni sil"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onChange(sections.filter((_, i) => i !== si))}
                    disabled={disabled}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <ol className="divide-y">
                {section.lectures.map((lec, li) => (
                  <li key={lec.key} className="grid gap-3 px-4 py-3 lg:grid-cols-[2rem_1fr_1.3fr_auto] lg:items-start">
                    <span className="pt-2 text-xs font-medium text-muted-foreground tabular-nums">{si + 1}.{li + 1}</span>
                    <Input aria-label="Dərsin adı" value={lec.title} onChange={(e) => setLecture(si, li, { title: e.target.value })} placeholder="Dərsin adı" disabled={disabled} />
                    <div className="grid gap-2">
                      <div className="flex gap-2">
                        <Input
                          aria-label="Video linki"
                          type="url"
                          inputMode="url"
                          value={lec.videoUrl}
                          onChange={(e) => setLecture(si, li, { videoUrl: e.target.value })}
                          placeholder="Video linki (YouTube, Vimeo, MP4)"
                          disabled={disabled}
                        />
                        {isHttpUrl(lec.videoUrl) && (
                          <Button asChild variant="outline" size="icon" aria-label="Videonu yeni pəncərədə aç">
                            <a href={lec.videoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink /></a>
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="relative w-28">
                          <Input
                            aria-label="Müddət (dəqiqə)"
                            type="number"
                            inputMode="numeric"
                            min="0"
                            value={lec.durationMinutes}
                            onChange={(e) => setLecture(si, li, { durationMinutes: e.target.value })}
                            placeholder="0"
                            className="h-8 pr-10"
                            disabled={disabled}
                          />
                          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">dəq</span>
                        </div>
                        <SimpleSelect
                          value={lec.lectureType}
                          onValueChange={(v) => setLecture(si, li, { lectureType: v })}
                          options={LECTURE_TYPES}
                          ariaLabel="Dərsin növü"
                          className="h-8 w-28"
                          disabled={disabled}
                        />
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                          <Checkbox checked={lec.isFree} onCheckedChange={(v) => setLecture(si, li, { isFree: v === true })} disabled={disabled} />
                          Pulsuz baxış
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-end lg:pt-0.5">
                      <Button type="button" variant="ghost" size="icon-sm" aria-label="Dərsi yuxarı apar" onClick={() => setSection(si, { lectures: move(section.lectures, li, li - 1) })} disabled={disabled || li === 0}>
                        <ArrowUp />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Dərsi aşağı apar"
                        onClick={() => setSection(si, { lectures: move(section.lectures, li, li + 1) })}
                        disabled={disabled || li === section.lectures.length - 1}
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Dərsi sil"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setSection(si, { lectures: section.lectures.filter((_, i) => i !== li) })}
                        disabled={disabled}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="border-t px-4 py-2.5">
                <Button type="button" variant="ghost" size="sm" onClick={() => setSection(si, { lectures: [...section.lectures, newLecture()] })} disabled={disabled}>
                  <Plus />
                  Dərs əlavə et
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function CourseEditorPage() {
  const { id } = useParams();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const { email } = useInstructor();
  const detailQuery = useGetInstructorCourseByIdQuery(id, { skip: !isEdit, refetchOnMountOrArgChange: true });
  const [createCourse] = useCreateCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();

  const [form, setForm] = useState(EMPTY);
  const [baseline, setBaseline] = useState(() => JSON.stringify(EMPTY));
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(0);
  const skipBlock = useRef(false);

  useEffect(() => {
    if (!isEdit || !detailQuery.data) return;
    const next = fromDetail(detailQuery.data);
    setForm(next);
    setBaseline(JSON.stringify(next));
  }, [isEdit, detailQuery.data]);

  const dirty = useMemo(() => JSON.stringify(form) !== baseline, [form, baseline]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !skipBlock.current && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, ...(key === 'sections' ? { curriculum: undefined } : {}) }));
  };
  const onBusy = (b) => setBusy((n) => n + (b ? 1 : -1));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    const firstKey = Object.keys(errs)[0];
    if (firstKey) {
      setTab(FIELD_TAB[firstKey] || 'basic');
      toast.error('Formda düzəliş tələb olunan sahələr var.');
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(form, email);
      if (isEdit) {
        await updateCourse({ id, ...payload }).unwrap();
        setBaseline(JSON.stringify(form));
        detailQuery.refetch();
        toast.success('Dəyişikliklər yadda saxlanıldı.');
      } else {
        const res = await createCourse(payload).unwrap();
        toast.success('Kurs yaradıldı.');
        skipBlock.current = true;
        const newId = res?.data?.id || res?.id;
        navigate(newId ? `/instructor-portal/courses/${newId}` : '/instructor-portal/courses', { replace: true });
        skipBlock.current = false;
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Kurs yadda saxlanmadı.'));
    } finally {
      setSaving(false);
    }
  };

  const tabHasError = (t) => Object.keys(errors).some((k) => errors[k] && (FIELD_TAB[k] || 'basic') === t);
  const disabled = saving;
  const sourceLangName = LANGUAGES.find((l) => l.code === form.language)?.name;
  const effectivePrice = Number(form.discountPrice) > 0 ? form.discountPrice : form.price;

  if (isEdit && detailQuery.isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Kurs yüklənir">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-9 w-96" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isEdit && detailQuery.error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-16 text-center">
        <p className="font-medium text-foreground">Kurs tapılmadı</p>
        <p className="text-sm text-muted-foreground">{errorMessage(detailQuery.error, 'Kurs yüklənmədi.')}</p>
        <Button asChild variant="outline">
          <Link to="/instructor-portal/courses">Kurslara qayıt</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-2">
        <Button asChild variant="link" className="h-auto px-0 text-muted-foreground">
          <Link to="/instructor-portal/courses">
            <ArrowLeft />
            Kurslarım
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{isEdit ? form.title || 'Kursu redaktə et' : 'Yeni kurs'}</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto w-full flex-wrap justify-start sm:w-fit">
          {[
            ['basic', 'Əsas məlumat'],
            ['pricing', 'Media və qiymət'],
            ['curriculum', 'Kurs proqramı'],
            ['translations', 'Tərcümələr'],
          ].map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="gap-1.5 px-3">
              {label}
              {tabHasError(value) && <span aria-label="xəta var" className="size-1.5 rounded-full bg-destructive" />}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <div className="grid gap-6 rounded-xl border bg-card p-6 shadow-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kursun adı" required error={errors.title} className="sm:col-span-2">
                {(p) => <Input {...p} value={form.title} onChange={(e) => set('title')(e.target.value)} placeholder="Məs: Sıfırdan veb proqramlaşdırma" disabled={disabled} />}
              </Field>
              <Field label="Qısa təsvir" hint="Kurs kartında göstərilir (160 simvola qədər)." className="sm:col-span-2">
                {(p) => <Input {...p} value={form.shortDescription} onChange={(e) => set('shortDescription')(e.target.value)} maxLength={160} disabled={disabled} />}
              </Field>
              <Field label="Kateqoriya">
                {(p) => <SimpleSelect id={p.id} value={form.category} onValueChange={set('category')} options={CATEGORIES} disabled={disabled} />}
              </Field>
              <Field label="Səviyyə">
                {(p) => <SimpleSelect id={p.id} value={form.level} onValueChange={set('level')} options={LEVELS} disabled={disabled} />}
              </Field>
              <Field label="Tədris dili" hint="Tərcümələr bu dildən edilir.">
                {(p) => (
                  <SimpleSelect
                    id={p.id}
                    value={form.language}
                    onValueChange={set('language')}
                    options={LANGUAGES.map((l) => ({ value: l.code, label: `${l.flag}  ${l.name}` }))}
                    disabled={disabled}
                  />
                )}
              </Field>
              <Field label="Teqlər" hint="Vergüllə ayırın: react, javascript, frontend">
                {(p) => <Input {...p} value={form.tags} onChange={(e) => set('tags')(e.target.value)} disabled={disabled} />}
              </Field>
            </div>
            <Field label="Təsvir">
              {(p) => <Textarea {...p} rows={5} value={form.description} onChange={(e) => set('description')(e.target.value)} placeholder="Kurs kimlər üçündür, nə öyrədir, necə qurulub…" disabled={disabled} />}
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
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <div className="grid gap-6 rounded-xl border bg-card p-6 shadow-xs">
            <FormSection title="Kurs şəkli" description="Tövsiyə olunan ölçü 1280×720 (16:9).">
              <ImageField value={form.thumbnailUrl} onChange={set('thumbnailUrl')} folder="courses" disabled={disabled} onBusyChange={onBusy} />
            </FormSection>
            <Field label="Tanıtım videosu" error={errors.previewVideoUrl} hint="YouTube, Vimeo və ya MP4 linki">
              {(p) => <Input {...p} type="url" inputMode="url" value={form.previewVideoUrl} onChange={(e) => set('previewVideoUrl')(e.target.value)} placeholder="https://…" disabled={disabled} />}
            </Field>

            <FormSection title="Qiymət">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border px-4 py-3">
                <span>
                  <span className="block text-sm font-medium text-foreground">Pulsuz kurs</span>
                  <span className="block text-xs text-muted-foreground">Tələbələr ödənişsiz qoşula bilər</span>
                </span>
                <Switch checked={form.isFree} onCheckedChange={set('isFree')} disabled={disabled} />
              </label>
              {!form.isFree && (
                <>
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
                      {(p) => <SimpleSelect id={p.id} value={form.currency} onValueChange={set('currency')} options={CURRENCIES} disabled={disabled} />}
                    </Field>
                  </div>
                  {form.currency !== 'AZN' && Number(effectivePrice) > 0 && (
                    <div className="flex gap-3 rounded-lg bg-info-soft px-4 py-3 text-sm text-info">
                      <Info className="mt-0.5 size-4 shrink-0" />
                      <p>
                        Ödəniş ePoint ilə yalnız AZN-lə qəbul olunur. Tələbədən təxminən{' '}
                        <strong className="tabular-nums">{convertToAZN(effectivePrice, form.currency)} AZN</strong> tutulacaq.
                      </p>
                    </div>
                  )}
                </>
              )}
            </FormSection>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-foreground">Dərc olunsun</span>
                <span className="block text-xs text-muted-foreground">Söndürülsə, kurs qaralama kimi yalnız sizə görünür</span>
              </span>
              <Switch checked={form.isPublished} onCheckedChange={set('isPublished')} disabled={disabled} />
            </label>
          </div>
        </TabsContent>

        <TabsContent value="curriculum" className="mt-6 space-y-3">
          {errors.curriculum && (
            <p role="alert" className="rounded-lg border border-destructive/20 bg-red-50 px-4 py-2.5 text-sm text-destructive">{errors.curriculum}</p>
          )}
          <Curriculum sections={form.sections} onChange={set('sections')} disabled={disabled} />
        </TabsContent>

        <TabsContent value="translations" className="mt-6">
          <TranslationEditor
            value={{ ...form.translations, [form.language]: { title: form.title, shortDescription: form.shortDescription, description: form.description } }}
            onChange={set('translations')}
            sourceLang={form.language}
            source={{ title: form.title.trim(), shortDescription: form.shortDescription.trim(), description: form.description.trim() }}
            fields={[
              { key: 'title', label: 'Ad' },
              { key: 'shortDescription', label: 'Qısa təsvir' },
              { key: 'description', label: 'Təsvir', multiline: true },
            ]}
            disabled={disabled}
            onBusyChange={onBusy}
          />
          <p className="mt-3 text-xs text-muted-foreground">Mənbə dili: {sourceLangName}. Tədris dilini «Əsas məlumat» bölməsində dəyişə bilərsiniz.</p>
        </TabsContent>
      </Tabs>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-30 -mx-4 -mb-6 border-t bg-card/95 backdrop-blur md:-mx-6 md:-mb-8">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p className={cn('text-sm', dirty ? 'text-warning' : 'text-muted-foreground')} aria-live="polite">
            {dirty ? 'Yadda saxlanmamış dəyişikliklər var' : isEdit ? 'Bütün dəyişikliklər yadda saxlanılıb' : 'Yeni kurs'}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/instructor-portal/courses')} disabled={saving}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={saving || busy > 0 || (isEdit && !dirty)}>
              {saving && <Spinner />}
              {saving ? 'Yadda saxlanılır…' : isEdit ? 'Yadda saxla' : 'Kursu yarat'}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={blocker.state === 'blocked'} onOpenChange={(open) => !open && blocker.reset?.()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dəyişikliklər yadda saxlanmayıb</AlertDialogTitle>
            <AlertDialogDescription>Səhifədən çıxsanız, etdiyiniz dəyişikliklər itəcək.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>Səhifədə qal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => blocker.proceed?.()}>
              Çıx
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
