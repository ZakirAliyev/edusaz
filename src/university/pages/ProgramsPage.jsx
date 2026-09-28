import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/admin/components/DataTable';
import { ConfirmDeleteDialog } from '@/admin/components/dialogs';
import { PageHeader, RowActions, SearchInput, SimpleSelect, StatusBadge, includesText } from '@/admin/components/common';
import { ProgramDialog } from '@/admin/dialogs/ProgramDialog';
import { DEGREES } from '@/admin/lib/constants';
import { apiRequest, errorMessage } from '@/admin/lib/api';
import { useUniversityData } from '../hooks/useUniversityData';

export default function ProgramsPage() {
  const { university, universityId, programs, loading, errors, reload } = useUniversityData();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [degree, setDegree] = useState('');
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [toDelete, setToDelete] = useState(null);

  // "?new=1" (from the overview shortcut) opens the create dialog once.
  useEffect(() => {
    if (params.get('new')) {
      setDialog({ open: true, item: null });
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const rows = useMemo(
    () => programs.filter((p) => (!degree || p.degree === degree) && (!search || includesText(p.title, search))),
    [programs, degree, search]
  );

  const handleDelete = async () => {
    try {
      await apiRequest(`/Programs/${toDelete.id}`, { method: 'DELETE' });
      toast.success('İxtisas silindi.');
      setToDelete(null);
      reload('programs');
    } catch (err) {
      toast.error(errorMessage(err, 'İxtisas silinmədi.'));
    }
  };

  const columns = [
    { key: 'title', header: 'İxtisas', cell: (p) => <p className="max-w-80 truncate font-medium text-foreground">{p.title}</p> },
    { key: 'degree', header: 'Dərəcə', cell: (p) => (p.degree ? <StatusBadge tone="brand" dot={false}>{p.degree}</StatusBadge> : '—') },
    { key: 'duration', header: 'Müddət', cell: (p) => p.duration || '—' },
    { key: 'language', header: 'Tədris dili', headClassName: 'hidden lg:table-cell', className: 'hidden lg:table-cell', cell: (p) => p.language || '—' },
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
        title="İxtisaslar"
        description="Universitetinizin təklif etdiyi dərəcə proqramları."
        actions={
          <Button onClick={() => setDialog({ open: true, item: null })}>
            <Plus />
            Yeni ixtisas
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="İxtisas adı…" />
        <SimpleSelect value={degree} onValueChange={setDegree} options={DEGREES} noneLabel="Bütün dərəcələr" ariaLabel="Dərəcəyə görə filtr" className="sm:w-52" />
      </div>

      <DataTable
        caption="İxtisaslar"
        columns={columns}
        rows={rows}
        loading={loading.programs}
        error={errors.programs}
        onRetry={() => reload('programs')}
        resetKey={`${search}|${degree}`}
        empty={
          search || degree
            ? { title: 'Uyğun ixtisas tapılmadı', description: 'Axtarışı və ya filtri dəyişin.' }
            : {
                title: 'Hələ ixtisas yoxdur',
                description: 'İlk ixtisası əlavə edin — tələbələr onu universitet səhifənizdə görəcək.',
                action: (
                  <Button size="sm" onClick={() => setDialog({ open: true, item: null })}>
                    <Plus />
                    İxtisas əlavə et
                  </Button>
                ),
              }
        }
      />

      <ProgramDialog
        open={dialog.open}
        program={dialog.item}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        universityId={universityId}
        universities={university ? [university] : []}
        onSaved={() => reload('programs')}
      />
      <ConfirmDeleteDialog target={toDelete && { title: 'İxtisas silinsin?', name: toDelete.title }} onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
