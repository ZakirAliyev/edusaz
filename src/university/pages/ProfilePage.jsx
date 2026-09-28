import { useEffect, useMemo, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { PageHeader, Spinner, StatusBadge } from '@/admin/components/common';
import { UniversityFields, toUniversityPayload, universityToForm, validateUniversity } from '@/admin/components/UniversityFields';
import { apiRequest, errorMessage } from '@/admin/lib/api';
import { useUniversityData } from '../hooks/useUniversityData';

export default function ProfilePage() {
  const { university, countries, universityId, loading, errors: loadErrors, reload } = useUniversityData();
  const initial = useMemo(() => universityToForm(university, countries), [university, countries]);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);

  useEffect(() => setForm(initial), [initial]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !saving && currentLocation.pathname !== nextLocation.pathname);

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
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const onBusy = (b) => setUploads((n) => n + (b ? 1 : -1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateUniversity(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Formda düzəliş tələb olunan sahələr var.');
      return;
    }
    setSaving(true);
    try {
      await apiRequest(`/Universities/${universityId}`, { method: 'PUT', body: toUniversityPayload(form, countries) });
      toast.success('Universitet profili yeniləndi.');
      await reload('university');
    } catch (err) {
      toast.error(errorMessage(err, 'Profil yadda saxlanmadı.'));
    } finally {
      setSaving(false);
    }
  };

  if ((loading.university || loading.countries) && !university) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Yüklənir">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[32rem] w-full rounded-xl" />
      </div>
    );
  }

  if (loadErrors.university && !university) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-14 text-center">
        <p className="text-sm text-muted-foreground">{loadErrors.university}</p>
        <Button variant="outline" size="sm" onClick={() => reload('university')}>Yenidən cəhd et</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <PageHeader
        title="Universitet profili"
        description="Tələbələr universitetinizi platformada bu məlumatlarla görür."
        actions={university?.status === 'Pending' ? <StatusBadge tone="warning">SuperAdmin təsdiqi gözlənilir</StatusBadge> : <StatusBadge tone="success">Aktiv</StatusBadge>}
      />

      <div className="space-y-6 rounded-xl border bg-card p-6 shadow-xs">
        <UniversityFields form={form} set={set} errors={errors} countries={countries} disabled={saving} onBusy={onBusy} />
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 -mb-6 border-t bg-card/95 backdrop-blur md:-mx-6 md:-mb-8">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p className={cn('text-sm', dirty ? 'text-warning' : 'text-muted-foreground')} aria-live="polite">
            {dirty ? 'Yadda saxlanmamış dəyişikliklər var' : 'Bütün dəyişikliklər yadda saxlanılıb'}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setForm(initial)} disabled={!dirty || saving}>
              Dəyişiklikləri ləğv et
            </Button>
            <Button type="submit" disabled={!dirty || saving || uploads > 0}>
              {saving && <Spinner />}
              {saving ? 'Yadda saxlanılır…' : 'Yadda saxla'}
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
