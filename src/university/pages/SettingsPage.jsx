import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChangeUserPasswordMutation, useUpdateUserProfileMutation } from '@/services/apis/userApi';
import { Field, FormSection, PageHeader, Spinner } from '@/admin/components/common';
import { errorMessage } from '@/admin/lib/api';
import { useUniversitySession } from '../layout/UniversityLayout';
import { useUniversityData } from '../hooks/useUniversityData';
import { signOut } from '../lib/session';

function PasswordInput({ value, onChange, autoComplete, disabled, ...rest }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...rest} type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} disabled={disabled} className="pr-10" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
        aria-pressed={visible}
        className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function ProfileForm() {
  const { email, profile } = useUniversitySession();
  const [updateProfile, { isLoading: saving }] = useUpdateUserProfileMutation();
  const initial = useMemo(() => ({ firstName: profile?.firstName || '', lastName: profile?.lastName || '', phone: profile?.phone || '' }), [profile]);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  useEffect(() => setForm(initial), [initial]);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) {
      setError('Ad mütləqdir.');
      return;
    }
    try {
      // The API only updates non-empty fields, so a cleared surname/phone keeps its old value.
      await updateProfile({ email, firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim() }).unwrap();
      toast.success('Profil yeniləndi.');
    } catch (err) {
      toast.error(errorMessage(err, 'Profil yadda saxlanmadı.'));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-xl border bg-card p-6 shadow-xs">
      <FormSection title="Admin profili" description="Adınız və əlaqə nömrəniz.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ad" required error={error}>
            {(p) => (
              <Input
                {...p}
                value={form.firstName}
                onChange={(e) => {
                  setForm((f) => ({ ...f, firstName: e.target.value }));
                  setError('');
                }}
                autoComplete="given-name"
                disabled={saving}
              />
            )}
          </Field>
          <Field label="Soyad">
            {(p) => <Input {...p} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} autoComplete="family-name" disabled={saving} />}
          </Field>
          <Field label="Email" hint="Giriş emailini yalnız SuperAdmin dəyişə bilər.">
            {(p) => <Input {...p} value={email} disabled readOnly />}
          </Field>
          <Field label="Telefon">
            {(p) => <Input {...p} type="tel" inputMode="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+994 …" autoComplete="tel" disabled={saving} />}
          </Field>
        </div>
      </FormSection>
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={() => setForm(initial)} disabled={!dirty || saving}>Ləğv et</Button>
        <Button type="submit" disabled={!dirty || saving}>
          {saving && <Spinner />}
          Yadda saxla
        </Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const { email } = useUniversitySession();
  const [changePassword, { isLoading: saving }] = useChangeUserPasswordMutation();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.current) errs.current = 'Cari şifrəni daxil edin.';
    if (form.next.length < 4) errs.next = 'Yeni şifrə ən azı 4 simvol olmalıdır.';
    else if (form.next === form.current) errs.next = 'Yeni şifrə cari şifrədən fərqli olmalıdır.';
    if (form.confirm !== form.next) errs.confirm = 'Şifrələr uyğun gəlmir.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await changePassword({ email, currentPassword: form.current, newPassword: form.next }).unwrap();
      toast.success('Şifrə dəyişdirildi.');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(errorMessage(err, 'Şifrə dəyişdirilmədi. Cari şifrəni yoxlayın.'));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-xl border bg-card p-6 shadow-xs">
      <FormSection title="Şifrəni dəyiş">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Cari şifrə" required error={errors.current}>
            {(p) => <PasswordInput {...p} value={form.current} onChange={set('current')} autoComplete="current-password" disabled={saving} />}
          </Field>
          <Field label="Yeni şifrə" required error={errors.next} hint="Ən azı 4 simvol">
            {(p) => <PasswordInput {...p} value={form.next} onChange={set('next')} autoComplete="new-password" disabled={saving} />}
          </Field>
          <Field label="Yeni şifrənin təkrarı" required error={errors.confirm}>
            {(p) => <PasswordInput {...p} value={form.confirm} onChange={set('confirm')} autoComplete="new-password" disabled={saving} />}
          </Field>
        </div>
      </FormSection>
      <div className="flex justify-end border-t pt-4">
        <Button type="submit" disabled={saving || !form.current || !form.next}>
          {saving && <Spinner />}
          Şifrəni dəyiş
        </Button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const { university } = useUniversityData();
  return (
    <div className="space-y-6">
      <PageHeader title="Tənzimləmələr" description="Hesab məlumatlarınız və təhlükəsizlik." />
      <ProfileForm />
      <PasswordForm />
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Təhkim olunmuş universitet</p>
          <p className="text-sm text-muted-foreground">{university?.name || '—'}</p>
        </div>
        <Button variant="outline" className="text-destructive hover:bg-red-50 hover:text-destructive" onClick={signOut}>
          <LogOut />
          Hesabdan çıx
        </Button>
      </div>
    </div>
  );
}
