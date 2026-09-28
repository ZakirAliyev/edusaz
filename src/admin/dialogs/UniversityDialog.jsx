import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FormDialog } from '../components/dialogs';
import { Field, SimpleSelect } from '../components/common';
import { UNIVERSITY_EMPTY, UniversityFields, toUniversityPayload, universityToForm, validateUniversity } from '../components/UniversityFields';
import { UNIVERSITY_STATUSES } from '../lib/constants';
import { apiRequest, errorMessage } from '../lib/api';
import { useAdminData } from '../hooks/useAdminData';

export function UniversityDialog({ open, onOpenChange, university }) {
  const { countries, reload } = useAdminData();
  const [form, setForm] = useState(UNIVERSITY_EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);
  const isEdit = !!university;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(universityToForm(university, countries));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, university]);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const onBusy = (b) => setUploads((n) => n + (b ? 1 : -1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateUniversity(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    const payload = toUniversityPayload(form, countries);
    try {
      if (isEdit) {
        await apiRequest(`/Universities/${university.id}`, { method: 'PUT', body: payload });
        if (university.status === 'Pending' && form.status === 'Active') {
          await apiRequest(`/Universities/${university.id}/approve`, { method: 'PUT' });
        }
        toast.success('Universitet yeniləndi.');
      } else {
        await apiRequest('/Universities', { method: 'POST', body: payload });
        toast.success('Universitet əlavə olundu.');
      }
      reload(['universities', 'countries']);
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Universitet yadda saxlanmadı.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      busy={saving}
      submitDisabled={uploads > 0}
      title={isEdit ? 'Universiteti redaktə et' : 'Yeni universitet'}
      description={isEdit ? university.name : 'Universitet profili platformada 31 dildə göstəriləcək.'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Yadda saxla' : 'Universiteti əlavə et'}
    >
      <UniversityFields
        form={form}
        set={set}
        errors={errors}
        countries={countries}
        disabled={saving}
        onBusy={onBusy}
        extraAdmissionField={
          isEdit &&
          university.status === 'Pending' && (
            <Field label="Status" hint="«Aktiv» seçilsə, universitet təsdiqlənəcək.">
              {(p) => <SimpleSelect id={p.id} value={form.status} onValueChange={set('status')} options={UNIVERSITY_STATUSES} disabled={saving} />}
            </Field>
          )
        }
      />
    </FormDialog>
  );
}
