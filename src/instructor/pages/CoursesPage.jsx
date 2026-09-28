import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { resolveMediaUrl } from '@/config/env';
import { Button } from '@/components/ui/button';
import { useDeleteCourseMutation, usePublishCourseMutation } from '@/services/apis/userApi';
import { DataTable } from '@/admin/components/DataTable';
import { ConfirmDeleteDialog } from '@/admin/components/dialogs';
import { PageHeader, RowActions, SearchInput, SimpleSelect, StatusBadge, includesText } from '@/admin/components/common';
import { PLACEHOLDER_IMAGE } from '@/admin/lib/constants';
import { errorMessage } from '@/admin/lib/api';
import { useInstructor } from '../layout/InstructorLayout';
import { LEVELS, categoryLabel, levelLabel } from '../lib/constants';
import { CoursePriceText } from './OverviewPage';

const STATUS_FILTER = [
  { value: 'published', label: 'Dərc olunub' },
  { value: 'draft', label: 'Qaralama' },
];

export default function CoursesPage() {
  const navigate = useNavigate();
  const { email, courses, coursesQuery } = useInstructor();
  const [publishCourse] = usePublishCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(
    () =>
      courses.filter(
        (c) =>
          (!level || c.level === level) &&
          (!status || (status === 'published') === !!c.isPublished) &&
          (!search || [c.title, c.category].some((f) => includesText(f, search)))
      ),
    [courses, level, status, search]
  );

  const togglePublish = async (c) => {
    try {
      await publishCourse({ id: c.id, email, publish: !c.isPublished }).unwrap();
      toast.success(c.isPublished ? 'Kurs qaralamaya qaytarıldı.' : 'Kurs dərc olundu.');
    } catch (err) {
      toast.error(errorMessage(err, 'Status dəyişmədi.'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCourse({ id: toDelete.id, email }).unwrap();
      toast.success('Kurs silindi.');
      setToDelete(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Kurs silinmədi.'));
    }
  };

  const columns = [
    {
      key: 'course',
      header: 'Kurs',
      cell: (c) => (
        <Link to={`/instructor-portal/courses/${c.id}`} className="flex items-center gap-3 outline-none">
          <img
            src={resolveMediaUrl(c.thumbnailUrl) || PLACEHOLDER_IMAGE}
            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
            alt=""
            className="h-10 w-16 shrink-0 rounded-md border object-cover"
          />
          <div className="min-w-0">
            <p className="max-w-72 truncate font-medium text-foreground hover:text-primary">{c.title}</p>
            <p className="max-w-72 truncate text-xs text-muted-foreground">{categoryLabel(c.category)}</p>
          </div>
        </Link>
      ),
    },
    { key: 'level', header: 'Səviyyə', headClassName: 'hidden lg:table-cell', className: 'hidden lg:table-cell', cell: (c) => levelLabel(c.level) },
    { key: 'students', header: 'Tələbələr', className: 'tabular-nums', cell: (c) => c.totalStudents || 0 },
    { key: 'price', header: 'Qiymət', cell: (c) => <CoursePriceText course={c} /> },
    {
      key: 'rating',
      header: 'Reytinq',
      headClassName: 'hidden xl:table-cell',
      className: 'hidden xl:table-cell',
      cell: (c) => (
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Star className="size-3.5 fill-warning text-warning" aria-hidden />
          {(c.rating || 0).toFixed(1)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (c) => (c.isPublished ? <StatusBadge tone="success">Dərc olunub</StatusBadge> : <StatusBadge tone="neutral">Qaralama</StatusBadge>),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Əməliyyatlar</span>,
      headClassName: 'w-12',
      className: 'text-right',
      cell: (c) => (
        <RowActions
          items={[
            { label: 'Redaktə et', icon: Pencil, onSelect: () => navigate(`/instructor-portal/courses/${c.id}`) },
            { label: c.isPublished ? 'Qaralamaya qaytar' : 'Dərc et', icon: c.isPublished ? EyeOff : Eye, onSelect: () => togglePublish(c) },
            { label: 'Sil', icon: Trash2, destructive: true, onSelect: () => setToDelete(c) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kurslarım"
        description="Kurslarınızı yaradın, redaktə edin və dərc edin."
        actions={
          <Button asChild>
            <Link to="/instructor-portal/courses/new">
              <Plus />
              Yeni kurs
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Kurs adı və ya kateqoriya…" />
        <SimpleSelect value={level} onValueChange={setLevel} options={LEVELS} noneLabel="Bütün səviyyələr" ariaLabel="Səviyyəyə görə filtr" className="sm:w-48" />
        <SimpleSelect value={status} onValueChange={setStatus} options={STATUS_FILTER} noneLabel="Bütün statuslar" ariaLabel="Statusa görə filtr" className="sm:w-44" />
      </div>

      <DataTable
        caption="Kurslarım"
        columns={columns}
        rows={rows}
        loading={coursesQuery.isLoading}
        error={coursesQuery.error ? errorMessage(coursesQuery.error, 'Kurslar yüklənmədi.') : null}
        onRetry={coursesQuery.refetch}
        resetKey={`${search}|${level}|${status}`}
        empty={
          search || level || status
            ? { title: 'Uyğun kurs tapılmadı', description: 'Axtarışı və ya filtrləri dəyişin.' }
            : {
                title: 'Hələ kursunuz yoxdur',
                description: 'İlk kursunuzu yaradın.',
                action: (
                  <Button asChild size="sm">
                    <Link to="/instructor-portal/courses/new">
                      <Plus />
                      Kurs yarat
                    </Link>
                  </Button>
                ),
              }
        }
      />

      <ConfirmDeleteDialog
        target={toDelete && { title: 'Kurs silinsin?', name: toDelete.title, description: 'və onun bütün dərsləri silinəcək. Bu əməliyyatı geri qaytarmaq mümkün deyil.' }}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
