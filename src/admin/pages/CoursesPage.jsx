import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { resolveMediaUrl } from '@/config/env';
import { Button } from '@/components/ui/button';
import { DataTable } from '../components/DataTable';
import { ConfirmDeleteDialog } from '../components/dialogs';
import { PageHeader, RowActions, SearchInput, SimpleSelect, StatusBadge, includesText } from '../components/common';
import { CourseDialog } from '../dialogs/CourseDialog';
import { PLACEHOLDER_IMAGE } from '../lib/constants';
import { apiRequest, errorMessage } from '../lib/api';
import { useAdminData } from '../hooks/useAdminData';

const PUBLISH_FILTER = [
  { value: 'published', label: 'Dərc olunub' },
  { value: 'draft', label: 'Qaralama' },
];

export default function CoursesPage() {
  const { courses, loading, errors, reload } = useAdminData();
  const [search, setSearch] = useState('');
  const [published, setPublished] = useState('');
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(
    () =>
      courses.filter((c) => {
        const isPublished = c.isPublished !== false;
        if (published === 'published' && !isPublished) return false;
        if (published === 'draft' && isPublished) return false;
        return !search || [c.title, c.category, c.instructorName, c.level].some((f) => includesText(f, search));
      }),
    [courses, published, search]
  );

  const handleDelete = async () => {
    try {
      await apiRequest(`/Courses/${toDelete.id}`, { method: 'DELETE' });
      toast.success('Kurs silindi.');
      setToDelete(null);
      reload('courses');
    } catch (err) {
      toast.error(errorMessage(err, 'Kurs silinmədi.'));
    }
  };

  const columns = [
    {
      key: 'course',
      header: 'Kurs',
      cell: (c) => (
        <div className="flex items-center gap-3">
          <img
            src={resolveMediaUrl(c.thumbnailUrl) || PLACEHOLDER_IMAGE}
            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
            alt=""
            className="h-10 w-16 shrink-0 rounded-md border object-cover"
          />
          <div className="min-w-0">
            <p className="max-w-72 truncate font-medium text-foreground">{c.title}</p>
            <p className="max-w-72 truncate text-xs text-muted-foreground">{c.instructorName || 'Edusaz Academy'}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Kateqoriya', cell: (c) => <p className="max-w-48 truncate">{c.category || '—'}</p> },
    { key: 'level', header: 'Səviyyə', headClassName: 'hidden xl:table-cell', className: 'hidden xl:table-cell', cell: (c) => c.level || '—' },
    {
      key: 'price',
      header: 'Qiymət',
      cell: (c) =>
        c.isFree || !Number(c.price) ? (
          <StatusBadge tone="success" dot={false}>Pulsuz</StatusBadge>
        ) : (
          <span className="font-medium tabular-nums">{c.price} {c.currency || 'AZN'}</span>
        ),
    },
    { key: 'lectures', header: 'Dərslər', className: 'tabular-nums', cell: (c) => c.totalLectures ?? 0 },
    {
      key: 'status',
      header: 'Status',
      cell: (c) => (c.isPublished !== false ? <StatusBadge tone="success">Dərc olunub</StatusBadge> : <StatusBadge tone="neutral">Qaralama</StatusBadge>),
    },
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
        title="Kurslar"
        description="Onlayn kursları, qiymətləri və video dərsləri idarə edin."
        actions={
          <Button onClick={() => setDialog({ open: true, item: null })}>
            <Plus />
            Yeni kurs
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Kurs, kateqoriya və ya təlimçi…" />
        <SimpleSelect value={published} onValueChange={setPublished} options={PUBLISH_FILTER} noneLabel="Hamısı" ariaLabel="Yayım statusuna görə filtr" className="sm:w-44" />
      </div>

      <DataTable
        caption="Kurslar"
        columns={columns}
        rows={rows}
        loading={loading.courses}
        error={errors.courses}
        onRetry={() => reload('courses')}
        resetKey={`${search}|${published}`}
        empty={
          search || published
            ? { title: 'Uyğun kurs tapılmadı', description: 'Axtarışı və ya filtri dəyişin.' }
            : { title: 'Hələ kurs yoxdur', description: 'İlk kursu əlavə edin.' }
        }
      />

      <CourseDialog open={dialog.open} course={dialog.item} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
      <ConfirmDeleteDialog target={toDelete && { title: 'Kurs silinsin?', name: toDelete.title }} onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
