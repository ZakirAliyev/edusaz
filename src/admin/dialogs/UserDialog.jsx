import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useAdminCreateUserMutation, useAdminUpdateUserMutation } from '@/services/apis/userApi';
import { FormDialog } from '../components/dialogs';
import { Field, SimpleSelect } from '../components/common';
import { CREATABLE_ROLES, ROLES } from '../lib/constants';
import { errorMessage } from '../lib/api';
import { useAdminData } from '../hooks/useAdminData';

const EMPTY = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'Teacher', universityId: '', status: 'Active' };

export function UserDialog({ open, onOpenChange, user }) {
  const { universities } = useAdminData();
  const [createUser, { isLoading: creating }] = useAdminCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useAdminUpdateUserMutation();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const isEdit = !!user;
  const busy = creating || updating;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      user
        ? {
            ...EMPTY,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: user.role || 'Teacher',
            universityId: user.role === 'UniversityAdmin' ? user.universityId || '' : '',
            status: user.status || 'Active',
          }
        : EMPTY
    );
  }, [open, user]);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email mütləqdir.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Email formatı düzgün deyil.';
    if (!isEdit || form.password) {
      if (!form.password) e.password = 'Şifrə mütləqdir.';
      else if (form.password.length < 4) e.password = 'Şifrə ən azı 4 simvol olmalıdır.';
    }
    if (!isEdit && form.password !== form.confirmPassword) e.confirmPassword = 'Şifrələr uyğun gəlmir.';
    if (form.role === 'UniversityAdmin' && !form.universityId) e.universityId = 'Universitet seçin.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const rest = { ...form };
    delete rest.confirmPassword;
    const payload = {
      ...rest,
      email: rest.email.trim(),
      // universityId is only meaningful for university admins; the API expects null otherwise.
      universityId: rest.role === 'UniversityAdmin' && rest.universityId ? rest.universityId : null,
    };
    try {
      if (isEdit) {
        await updateUser({ id: user.id, ...payload }).unwrap();
        toast.success('Hesab yeniləndi.');
      } else {
        await createUser(payload).unwrap();
        toast.success('Yeni hesab yaradıldı.');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Hesab yadda saxlanmadı.'));
    }
  };

  const roleOptions = isEdit && user?.role === 'SuperAdmin' ? ROLES : CREATABLE_ROLES;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      busy={busy}
      title={isEdit ? 'Hesabı redaktə et' : 'Yeni hesab'}
      description={isEdit ? user.email : 'Müəllim, tədris mərkəzi, universitet admini və ya tələbə hesabı yaradın.'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Yadda saxla' : 'Hesabı yarat'}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Hesab növü" required error={errors.role}>
          {(p) => (
            <SimpleSelect
              id={p.id}
              value={form.role}
              onValueChange={(v) => {
                setForm((f) => ({ ...f, role: v, universityId: v === 'UniversityAdmin' ? f.universityId : '' }));
                setErrors((er) => ({ ...er, universityId: undefined }));
              }}
              options={roleOptions}
              disabled={busy}
            />
          )}
        </Field>
        <Field label="Status">
          {(p) => (
            <SimpleSelect
              id={p.id}
              value={form.status}
              onValueChange={set('status')}
              options={[
                { value: 'Active', label: 'Aktiv — giriş açıqdır' },
                { value: 'Disabled', label: 'Deaktiv — bloklanıb' },
              ]}
              disabled={busy}
            />
          )}
        </Field>

        {form.role === 'UniversityAdmin' && (
          <Field label="Universitet" required error={errors.universityId} className="sm:col-span-2">
            {(p) => (
              <SimpleSelect
                id={p.id}
                value={form.universityId}
                onValueChange={set('universityId')}
                options={universities.map((u) => ({ value: u.id, label: u.country ? `${u.name} · ${u.country}` : u.name }))}
                placeholder="Universitet seçin"
                invalid={!!errors.universityId}
                disabled={busy}
              />
            )}
          </Field>
        )}

        <Field label="Ad">
          {(p) => <Input {...p} value={form.firstName} onChange={(e) => set('firstName')(e.target.value)} autoComplete="given-name" disabled={busy} />}
        </Field>
        <Field label="Soyad">
          {(p) => <Input {...p} value={form.lastName} onChange={(e) => set('lastName')(e.target.value)} autoComplete="family-name" disabled={busy} />}
        </Field>

        <Field label="Email" required error={errors.email} className="sm:col-span-2">
          {(p) => (
            <Input {...p} type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} placeholder="ad@edusaz.com" autoComplete="off" disabled={busy} />
          )}
        </Field>

        <Field
          label={isEdit ? 'Yeni şifrə' : 'Şifrə'}
          required={!isEdit}
          error={errors.password}
          hint={isEdit ? 'Dəyişmək istəmirsinizsə boş saxlayın.' : 'Ən azı 4 simvol.'}
          className={isEdit ? 'sm:col-span-2' : undefined}
        >
          {(p) => <Input {...p} type="password" value={form.password} onChange={(e) => set('password')(e.target.value)} autoComplete="new-password" disabled={busy} />}
        </Field>
        {!isEdit && (
          <Field label="Şifrə təkrarı" required error={errors.confirmPassword}>
            {(p) => (
              <Input {...p} type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword')(e.target.value)} autoComplete="new-password" disabled={busy} />
            )}
          </Field>
        )}
      </div>
    </FormDialog>
  );
}
