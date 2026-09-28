import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Languages, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '../components/DataTable';
import { ConfirmDeleteDialog, FormDialog } from '../components/dialogs';
import { Field, PageHeader, RowActions, SearchInput, SimpleSelect, includesText } from '../components/common';
import { PRESET_FLAGS } from '../lib/constants';
import { apiRequest, errorMessage } from '../lib/api';
import { useAdminData } from '../hooks/useAdminData';

function CountryDialog({ open, onOpenChange, country }) {
  const { reload } = useAdminData();
  const [name, setName] = useState('');
  const [flag, setFlag] = useState('🌐');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = !!country;

  useEffect(() => {
    if (!open) return;
    setError('');
    setName(country?.name || '');
    setFlag(country?.flag || '🌐');
  }, [open, country]);

  const handleName = (value) => {
    setName(value);
    setError('');
    const preset = PRESET_FLAGS.find((f) => f.name.toLocaleLowerCase('az') === value.trim().toLocaleLowerCase('az'));
    if (preset) setFlag(preset.flag);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Ölkənin adı mütləqdir.');
      return;
    }
    setSaving(true);
    const body = { name: name.trim(), flagEmoji: flag || '🌐', baseLanguageCode: 'az' };
    try {
      if (isEdit) await apiRequest(`/Countries/${country.id}`, { method: 'PUT', body });
      else await apiRequest('/Countries', { method: 'POST', body });
      toast.success(isEdit ? 'Ölkə yeniləndi.' : 'Ölkə əlavə olundu.');
      reload('countries');
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Ölkə yadda saxlanmadı.'));
    } finally {
      setSaving(false);
    }
  };

  const flagOptions = PRESET_FLAGS.some((f) => f.flag === flag) ? PRESET_FLAGS : [{ flag, name: 'Cari bayraq' }, ...PRESET_FLAGS];

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      busy={saving}
      title={isEdit ? 'Ölkəni redaktə et' : 'Yeni ölkə'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Yadda saxla' : 'Ölkəni əlavə et'}
    >
      <Field label="Ölkənin adı" required error={error} hint="Azərbaycan dilində. Digər dillərə server avtomatik tərcümə edir.">
        {(p) => <Input {...p} value={name} onChange={(e) => handleName(e.target.value)} placeholder="Məs: İtaliya" autoFocus disabled={saving} />}
      </Field>
      <Field label="Bayraq">
        {(p) => (
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-2xl">{flag}</span>
            <SimpleSelect
              id={p.id}
              value={flag}
              onValueChange={setFlag}
              options={flagOptions.map((f) => ({ value: f.flag, label: `${f.flag}  ${f.name}` }))}
              disabled={saving}
            />
          </div>
        )}
      </Field>
      <div className="flex gap-3 rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
        <Languages className="mt-0.5 size-4 shrink-0" />
        <p>Yadda saxladıqdan sonra ölkə adı 31 dilə tərcümə olunur.</p>
      </div>
    </FormDialog>
  );
}

export default function CountriesPage() {
  const { countries, loading, errors, reload } = useAdminData();
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(
    () => countries.filter((c) => !search || [c.name, c.code].some((f) => includesText(f, search))),
    [countries, search]
  );

  const handleDelete = async () => {
    try {
      await apiRequest(`/Countries/${toDelete.id}`, { method: 'DELETE' });
      toast.success('Ölkə silindi.');
      setToDelete(null);
      reload('countries');
    } catch (err) {
      toast.error(errorMessage(err, 'Ölkə silinmədi.'));
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Ölkə',
      cell: (c) => (
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-2xl leading-none">{c.flag}</span>
          <span className="font-medium text-foreground">{c.name}</span>
        </div>
      ),
    },
    { key: 'code', header: 'Kod', cell: (c) => <span className="font-mono text-xs text-muted-foreground">{c.code || '—'}</span> },
    { key: 'unis', header: 'Universitetlər', className: 'tabular-nums', cell: (c) => c.universitiesCount },
    {
      key: 'actions',
      header: <span className="sr-only">Əməliyyatlar</span>,
      headClassName: 'w-12',
      className: 'text-right',
      cell: (c) => (
        <RowActions
          items={[
            { label: 'Redaktə et', icon: Pencil, onSelect: () => setDialog({ open: true, item: c }) },
            { label: 'Sil', icon: Trash2, destructive: true, onSelect: () => setToDelete(c) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ölkələr"
        description="Təhsil istiqamətləri kimi göstərilən ölkələri idarə edin."
        actions={
          <Button onClick={() => setDialog({ open: true, item: null })}>
            <Plus />
            Yeni ölkə
          </Button>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Ölkə adı və ya kodu…" />

      <DataTable
        caption="Ölkələr"
        columns={columns}
        rows={rows}
        loading={loading.countries}
        error={errors.countries}
        onRetry={() => reload('countries')}
        resetKey={search}
        empty={search ? { title: 'Uyğun ölkə tapılmadı', description: 'Axtarışı dəyişin.' } : { title: 'Hələ ölkə yoxdur', description: 'İlk ölkəni əlavə edin.' }}
      />

      <CountryDialog open={dialog.open} country={dialog.item} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
      <ConfirmDeleteDialog
        target={
          toDelete && {
            title: 'Ölkə silinsin?',
            name: toDelete.name,
            description:
              toDelete.universitiesCount > 0
                ? `silinəcək. Bu ölkəyə ${toDelete.universitiesCount} universitet bağlıdır — onların ölkə məlumatı itə bilər.`
                : undefined,
          }
        }
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
