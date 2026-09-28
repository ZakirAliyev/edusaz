import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '../components/DataTable';
import { ConfirmDeleteDialog } from '../components/dialogs';
import { PageHeader, RowActions, SearchInput, SimpleSelect, StatusBadge, includesText } from '../components/common';
import { ProgramDialog } from '../dialogs/ProgramDialog';
import { DEGREES } from '../lib/constants';
import { apiRequest, errorMessage } from '../lib/api';
import { useAdminData } from '../hooks/useAdminData';

export default function ProgramsPage() {
  const { programs, loading, errors, reload } = useAdminData();
  const [search, setSearch] = useState('');
  const [degree, setDegree] = useState('');
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(
    () =>
      programs.filter(
        (p) => (!degree || p.degree === degree) && (!search || [p.title, p.university].some((f) => includesText(f, search)))
      ),
    [programs, degree, search]
  );

  const handleDelete = async () => {
    try {
      await apiRequest(`/Programs/${toDelete.id}`, { method: 'DELETE' });
      toast.success('Proqram silindi.');
      setToDelete(null);
      reload('programs');
    } catch (err) {
      toast.error(errorMessage(err, 'Proqram silinmədi.'));
    }
  };

  const columns = [
    { key: 'title', header: 'Proqram', cell: (p) => <p className="max-w-72 truncate font-medium text-foreground">{p.title}</p> },
    { key: 'university', header: 'Universitet', cell: (p) => p.university || <span className="text-muted-foreground">Ümumi</span> },
    { key: 'degree', header: 'Dərəcə', cell: (p) => (p.degree ? <StatusBadge tone="brand" dot={false}>{p.degree}</StatusBadge> : '—') },
    { key: 'duration', header: 'Müddət', cell: (p) => p.duration || '—' },
    { key: 'language', header: 'Tədris dili', cell: (p) => p.language || '—' },
    { key: 'fee', header: 'Təhsil haqqı', cell: (p) => <span className="font-medium tabular-nums">{p.tuitionFee || '—'}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Əməliyyatlar</span>,
      headClassName: 'w-12',
      className: 'text-right',
      cell: (p) => (
        <RowActions
          items={[
            { label: 'Redaktə et', icon: Pencil, onSelect: () => setDialog({ open: true, item: p }) },
            { label: 'Sil', icon: Trash2, destructive: true, onSelect: () => setToDelete(p) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proqramlar"
        description="Universitetlərin ixtisas və dərəcə proqramlarını idarə edin."
        actions={
          <Button onClick={() => setDialog({ open: true, item: null })}>
            <Plus />
            Yeni proqram
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Proqram və ya universitet…" />
        <SimpleSelect value={degree} onValueChange={setDegree} options={DEGREES} noneLabel="Bütün dərəcələr" ariaLabel="Dərəcəyə görə filtr" className="sm:w-52" />
      </div>

      <DataTable
        caption="Proqramlar"
        columns={columns}
        rows={rows}
        loading={loading.programs}
        error={errors.programs}
        onRetry={() => reload('programs')}
        resetKey={`${search}|${degree}`}
        empty={
          search || degree
            ? { title: 'Uyğun proqram tapılmadı', description: 'Axtarışı və ya filtri dəyişin.' }
            : { title: 'Hələ proqram yoxdur', description: 'İlk proqramı əlavə edin.' }
        }
      />

      <ProgramDialog open={dialog.open} program={dialog.item} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
      <ConfirmDeleteDialog target={toDelete && { title: 'Proqram silinsin?', name: toDelete.title }} onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
