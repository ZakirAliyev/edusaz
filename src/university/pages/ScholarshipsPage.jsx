import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/admin/components/DataTable';
import { ConfirmDeleteDialog } from '@/admin/components/dialogs';
import { PageHeader, RowActions, SearchInput, SimpleSelect, StatusBadge, formatDate, includesText } from '@/admin/components/common';
import { ScholarshipDialog } from '@/admin/dialogs/ScholarshipDialog';
import { SCHOLARSHIP_STATUSES } from '@/admin/lib/constants';
import { apiRequest, errorMessage } from '@/admin/lib/api';
import { useUniversityData } from '../hooks/useUniversityData';

export default function ScholarshipsPage() {
  const { university, universityId, countries, scholarships, loading, errors, reload } = useUniversityData();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    if (params.get('new')) {
      setDialog({ open: true, item: null });
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const rows = useMemo(
    () => scholarships.filter((s) => (!status || s.status === status) && (!search || [s.title, s.provider].some((f) => includesText(f, search)))),
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
    { key: 'coverage', header: 'Əhatə', cell: (s) => <p className="max-w-64 truncate" title={s.coverage}>{s.coverage || '—'}</p> },
    { key: 'places', header: 'Yer sayı', headClassName: 'hidden lg:table-cell', className: 'hidden lg:table-cell', cell: (s) => s.places || '—' },
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
        description="Universitetinizin tələbələrə təklif etdiyi təqaüd və güzəştlər."
        actions={
          <Button onClick={() => setDialog({ open: true, item: null })}>
            <Plus />
            Yeni təqaüd
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Təqaüd adı və ya təminatçı…" />
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
            : {
                title: 'Hələ təqaüd yoxdur',
                description: 'Təqaüd əlavə etmək universitetinizi tələbələr üçün daha cəlbedici edir.',
                action: (
                  <Button size="sm" onClick={() => setDialog({ open: true, item: null })}>
                    <Plus />
                    Təqaüd əlavə et
                  </Button>
                ),
              }
        }
      />

      <ScholarshipDialog
        open={dialog.open}
        scholarship={dialog.item}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        universityId={universityId}
        universities={university ? [university] : []}
        countries={countries}
        defaults={{ provider: university?.name || '', countryId: university?.countryId || '' }}
        onSaved={() => reload('scholarships')}
      />
      <ConfirmDeleteDialog target={toDelete && { title: 'Təqaüd silinsin?', name: toDelete.title }} onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
