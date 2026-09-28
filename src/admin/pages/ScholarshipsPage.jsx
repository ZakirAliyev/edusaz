import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '../components/DataTable';
import { ConfirmDeleteDialog } from '../components/dialogs';
import { PageHeader, RowActions, SearchInput, SimpleSelect, StatusBadge, formatDate, includesText } from '../components/common';
import { ScholarshipDialog } from '../dialogs/ScholarshipDialog';
import { SCHOLARSHIP_STATUSES } from '../lib/constants';
import { apiRequest, errorMessage } from '../lib/api';
import { useAdminData } from '../hooks/useAdminData';

export default function ScholarshipsPage() {
  const { scholarships, loading, errors, reload } = useAdminData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(
    () =>
      scholarships.filter(
        (s) =>
          (!status || s.status === status) && (!search || [s.title, s.provider, s.country].some((f) => includesText(f, search)))
      ),
    [scholarships, status, search]
  );

  const handleDelete = async () => {
    try {
      await apiRequest(`/Scholarships/${toDelete.id}`, { method: 'DELETE' });
      toast.success('Təqaüd silindi.');
      setToDelete(null);
      reload('scholarships');
    } catch (err) {
      toast.error(errorMessage(err, 'Təqaüd silinmədi.'));
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Təqaüd',
      cell: (s) => (
        <div className="min-w-0">
          <p className="max-w-72 truncate font-medium text-foreground">{s.title}</p>
          <p className="max-w-72 truncate text-xs text-muted-foreground">{s.provider || '—'}</p>
        </div>
      ),
    },
    { key: 'country', header: 'Ölkə', cell: (s) => s.country || '—' },
    { key: 'coverage', header: 'Əhatə', cell: (s) => <p className="max-w-64 truncate" title={s.coverage}>{s.coverage || '—'}</p> },
    { key: 'deadline', header: 'Son tarix', cell: (s) => <span className="tabular-nums">{formatDate(s.deadline)}</span> },
    {
      key: 'status',
      header: 'Status',
      cell: (s) => {
        const m = SCHOLARSHIP_STATUSES.find((x) => x.value === s.status);
        return <StatusBadge tone={m?.tone || 'neutral'}>{m?.short || s.status}</StatusBadge>;
      },
    },
    {
      key: 'actions',
      header: <span className="sr-only">Əməliyyatlar</span>,
      headClassName: 'w-12',
      className: 'text-right',
      cell: (s) => (
        <RowActions
          items={[
            { label: 'Redaktə et', icon: Pencil, onSelect: () => setDialog({ open: true, item: s }) },
            { label: 'Sil', icon: Trash2, destructive: true, onSelect: () => setToDelete(s) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Təqaüdlər"
        description="Qlobal və yerli təqaüd proqramlarını idarə edin."
        actions={
          <Button onClick={() => setDialog({ open: true, item: null })}>
            <Plus />
            Yeni təqaüd
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Ad, təminatçı və ya ölkə…" />
        <SimpleSelect
          value={status}
          onValueChange={setStatus}
          options={SCHOLARSHIP_STATUSES.map((s) => ({ value: s.value, label: s.short }))}
          noneLabel="Bütün statuslar"
          ariaLabel="Statusa görə filtr"
          className="sm:w-48"
        />
      </div>

      <DataTable
        caption="Təqaüdlər"
        columns={columns}
        rows={rows}
        loading={loading.scholarships}
        error={errors.scholarships}
        onRetry={() => reload('scholarships')}
        resetKey={`${search}|${status}`}
        empty={
          search || status
            ? { title: 'Uyğun təqaüd tapılmadı', description: 'Axtarışı və ya filtri dəyişin.' }
            : { title: 'Hələ təqaüd yoxdur', description: 'İlk təqaüdü əlavə edin.' }
        }
      />

      <ScholarshipDialog open={dialog.open} scholarship={dialog.item} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
      <ConfirmDeleteDialog target={toDelete && { title: 'Təqaüd silinsin?', name: toDelete.title }} onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
