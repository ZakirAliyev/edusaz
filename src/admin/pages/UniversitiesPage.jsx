import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { resolveMediaUrl } from '@/config/env';
import { Button } from '@/components/ui/button';
import { DataTable } from '../components/DataTable';
import { ConfirmDeleteDialog } from '../components/dialogs';
import { PageHeader, RowActions, SearchInput, SimpleSelect, StatusBadge, includesText } from '../components/common';
import { UniversityDialog } from '../dialogs/UniversityDialog';
import { PLACEHOLDER_IMAGE, UNIVERSITY_STATUSES } from '../lib/constants';
import { apiRequest, errorMessage } from '../lib/api';
import { useAdminData } from '../hooks/useAdminData';

export default function UniversitiesPage() {
  const { universities, loading, errors, reload } = useAdminData();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const status = params.get('status') || '';
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [toDelete, setToDelete] = useState(null);

  const setStatus = (v) => setParams(v ? { status: v } : {}, { replace: true });

  const rows = useMemo(
    () =>
      universities.filter(
        (u) => (!status || u.status === status) && (!search || [u.name, u.country, u.city].some((f) => includesText(f, search)))
      ),
    [universities, status, search]
  );

  const approve = async (u) => {
    try {
      await apiRequest(`/Universities/${u.id}/approve`, { method: 'PUT' });
      toast.success(`${u.name} təsdiqləndi.`);
      reload('universities');
    } catch (err) {
      toast.error(errorMessage(err, 'Təsdiqlənmədi.'));
    }
  };

  const handleDelete = async () => {
    try {
      await apiRequest(`/Universities/${toDelete.id}`, { method: 'DELETE' });
      toast.success('Universitet silindi.');
      setToDelete(null);
      reload(['universities', 'countries']);
    } catch (err) {
      toast.error(errorMessage(err, 'Universitet silinmədi.'));
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Universitet',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <img
            src={resolveMediaUrl(u.logoUrl) || PLACEHOLDER_IMAGE}
            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
            alt=""
            className="size-10 shrink-0 rounded-lg border object-cover"
          />
          <div className="min-w-0">
            <p className="max-w-64 truncate font-medium text-foreground">{u.name}</p>
            {u.website ? (
              <a href={u.website} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-64 items-center gap-1 truncate text-xs text-muted-foreground hover:text-primary">
                {u.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="size-3 shrink-0" />
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">Sayt yoxdur</p>
            )}
          </div>
        </div>
      ),
    },
    { key: 'location', header: 'Yer', cell: (u) => [u.city, u.country].filter(Boolean).join(', ') || '—' },
    { key: 'ranking', header: 'Reytinq', headClassName: 'hidden xl:table-cell', className: 'hidden xl:table-cell', cell: (u) => u.ranking || '—' },
    { key: 'tuition', header: 'Təhsil haqqı', cell: (u) => <span className="tabular-nums">{u.tuition || '—'}</span> },
    { key: 'language', header: 'Tədris dili', headClassName: 'hidden 2xl:table-cell', className: 'hidden 2xl:table-cell', cell: (u) => u.teachingLanguage || '—' },
    {
      key: 'status',
      header: 'Status',
      cell: (u) => {
        const m = UNIVERSITY_STATUSES.find((s) => s.value === u.status) || UNIVERSITY_STATUSES[0];
        return <StatusBadge tone={m.tone}>{m.label}</StatusBadge>;
      },
    },
    {
      key: 'actions',
      header: <span className="sr-only">Əməliyyatlar</span>,
      headClassName: 'w-12',
      className: 'text-right',
      cell: (u) => (
        <RowActions
          items={[
            u.status === 'Pending' && { label: 'Təsdiqlə', icon: CheckCircle2, onSelect: () => approve(u) },
            { label: 'Redaktə et', icon: Pencil, onSelect: () => setDialog({ open: true, item: u }) },
            { label: 'Sil', icon: Trash2, destructive: true, onSelect: () => setToDelete(u) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Universitetlər"
        description="Universitet profillərini, şəkillərini və qəbul məlumatlarını idarə edin."
        actions={
          <Button onClick={() => setDialog({ open: true, item: null })}>
            <Plus />
            Yeni universitet
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Ad, ölkə və ya şəhər…" />
        <SimpleSelect value={status} onValueChange={setStatus} options={UNIVERSITY_STATUSES} noneLabel="Bütün statuslar" ariaLabel="Statusa görə filtr" className="sm:w-48" />
      </div>

      <DataTable
        caption="Universitetlər"
        columns={columns}
        rows={rows}
        loading={loading.universities}
        error={errors.universities}
        onRetry={() => reload('universities')}
        resetKey={`${search}|${status}`}
        empty={
          search || status
            ? { title: 'Uyğun universitet tapılmadı', description: 'Axtarışı və ya filtri dəyişin.' }
            : { title: 'Hələ universitet yoxdur', description: 'İlk universiteti əlavə edin.' }
        }
      />

      <UniversityDialog open={dialog.open} university={dialog.item} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
      <ConfirmDeleteDialog
        target={toDelete && { title: 'Universitet silinsin?', name: toDelete.name, description: 'və ona bağlı proqramlar platformadan silinəcək. Bu əməliyyatı geri qaytarmaq mümkün deyil.' }}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
