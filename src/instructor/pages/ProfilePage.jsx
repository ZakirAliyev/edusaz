import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera, LogOut, Trash2 } from 'lucide-react';
import { resolveMediaUrl } from '@/config/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpdateInstructorProfileMutation } from '@/services/apis/userApi';
import { Field, FormSection, PageHeader, Spinner } from '@/admin/components/common';
import { errorMessage, uploadFile } from '@/admin/lib/api';
import { useInstructor } from '../layout/InstructorLayout';
import { roleLabel, signOut } from '../lib/session';

const EMPTY = { displayName: '', expertise: '', bio: '', avatarUrl: '', website: '', linkedin: '', youtube: '' };
const URL_FIELDS = ['website', 'linkedin', 'youtube'];

export default function ProfilePage() {
  const { email, role, profile, profileQuery } = useInstructor();
  const [updateProfile, { isLoading: saving }] = useUpdateInstructorProfileMutation();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const initial = useMemo(
    () =>
      profile
        ? {
            displayName: profile.displayName || '',
            expertise: profile.expertise || '',
            bio: profile.bio || '',
            avatarUrl: profile.avatarUrl || '',
            website: profile.website || '',
            linkedin: profile.linkedIn || profile.linkedin || '',
            youtube: profile.youTube || profile.youtube || '',
          }
        : EMPTY,
    [profile]
  );

  useEffect(() => setForm(initial), [initial]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Yalnız şəkil faylı seçin.');
    if (file.size > 5 * 1024 * 1024) return toast.error('Şəkil ən çox 5 MB ola bilər.');
    setUploading(true);
    try {
      const url = await uploadFile(file, 'avatars');
      setForm((f) => ({ ...f, avatarUrl: url }));
      toast.success('Şəkil yükləndi. Yadda saxlamağı unutmayın.');
    } catch (err) {
      toast.error(errorMessage(err, 'Şəkil yüklənmədi.'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.displayName.trim()) errs.displayName = 'Görünən ad mütləqdir.';
    URL_FIELDS.forEach((k) => {
      if (form[k] && !/^https?:\/\/\S+\.\S+/.test(form[k])) errs[k] = 'Link https:// ilə başlamalıdır.';
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      const { linkedin, youtube, ...rest } = form;
      await updateProfile({ email, ...rest, linkedIn: linkedin, youTube: youtube }).unwrap();
      toast.success('Profil yeniləndi.');
    } catch (err) {
      toast.error(errorMessage(err, 'Profil yadda saxlanmadı.'));
    }
  };

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const initialLetter = (form.displayName || email || '?')[0].toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader title="Profil" description="Tələbələr sizi platformada bu məlumatlarla görür." />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-xl border bg-card p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar className="size-20">
                {form.avatarUrl && <AvatarImage src={resolveMediaUrl(form.avatarUrl)} alt="Profil şəkli" className="object-cover" />}
                <AvatarFallback className="bg-accent text-2xl font-semibold text-accent-foreground">{initialLetter}</AvatarFallback>
              </Avatar>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
                  <Spinner className="text-primary" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} tabIndex={-1} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading || saving}>
                  <Camera />
                  {form.avatarUrl ? 'Şəkli dəyiş' : 'Şəkil yüklə'}
                </Button>
                {form.avatarUrl && (
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setForm((f) => ({ ...f, avatarUrl: '' }))} disabled={uploading || saving}>
                    <Trash2 />
                    Sil
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Kvadrat şəkil, maksimum 5 MB</p>
            </div>
          </div>

          <FormSection title="Əsas məlumat">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Görünən ad" required error={errors.displayName}>
                {(p) => <Input {...p} value={form.displayName} onChange={set('displayName')} disabled={saving} />}
              </Field>
              <Field label="İxtisas sahəsi">
                {(p) => <Input {...p} value={form.expertise} onChange={set('expertise')} placeholder="Məs: Veb proqramlaşdırma" disabled={saving} />}
              </Field>
            </div>
            <Field label="Haqqında" hint="Təcrübəniz, uğurlarınız və tədris üslubunuz.">
              {(p) => <Textarea {...p} rows={5} value={form.bio} onChange={set('bio')} disabled={saving} />}
            </Field>
          </FormSection>

          <FormSection title="Linklər">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Veb sayt" error={errors.website}>
                {(p) => <Input {...p} type="url" inputMode="url" value={form.website} onChange={set('website')} placeholder="https://…" disabled={saving} />}
              </Field>
              <Field label="LinkedIn" error={errors.linkedin}>
                {(p) => <Input {...p} type="url" inputMode="url" value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/…" disabled={saving} />}
              </Field>
              <Field label="YouTube" error={errors.youtube}>
                {(p) => <Input {...p} type="url" inputMode="url" value={form.youtube} onChange={set('youtube')} placeholder="https://youtube.com/@…" disabled={saving} />}
              </Field>
            </div>
          </FormSection>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setForm(initial)} disabled={!dirty || saving}>
              Dəyişiklikləri ləğv et
            </Button>
            <Button type="submit" disabled={!dirty || saving || uploading}>
              {saving && <Spinner />}
              Yadda saxla
            </Button>
          </div>
        </form>

        <aside className="h-fit space-y-4 rounded-xl border bg-card p-6 shadow-xs">
          <h2 className="text-sm font-semibold text-foreground">Hesab</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate text-foreground">{email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Hesab növü</dt>
              <dd className="text-foreground">{roleLabel(role)}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
              {[
                ['Kurs', profile?.totalCourses ?? 0],
                ['Tələbə', profile?.totalStudents ?? 0],
                ['Reytinq', (profile?.rating ?? 0).toFixed(1)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dd className="text-lg font-semibold tabular-nums text-foreground">{value}</dd>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                </div>
              ))}
            </div>
          </dl>
          <Button variant="outline" className="w-full text-destructive hover:bg-red-50 hover:text-destructive" onClick={signOut}>
            <LogOut />
            Hesabdan çıx
          </Button>
        </aside>
      </div>
    </div>
  );
}
