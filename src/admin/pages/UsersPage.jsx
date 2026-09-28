import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAdminDeleteUserMutation, useGetUsersQuery } from '@/services/apis/userApi';
import { DataTable } from '../components/DataTable';
import { ConfirmDeleteDialog } from '../components/dialogs';
import { PageHeader, RowActions, SearchInput, SimpleSelect, StatusBadge, formatDate, includesText } from '../components/common';
import { UserDialog } from '../dialogs/UserDialog';
import { ROLES, roleMeta } from '../lib/constants';
import { errorMessage } from '../lib/api';

const toList = (d) => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
const fullName = (u) => `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email?.split('@')[0] || '—';

export default function UsersPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetUsersQuery();
  const [deleteUser] = useAdminDeleteUserMutation();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [dialog, setDialog] = useState({ open: false, user: null });
  const [toDelete, setToDelete] = useState(null);

  const users = toList(data);
  const rows = useMemo(
    () =>
      users.filter(
        (u) =>
          (!role || (u.role || '').toLowerCase() === role.toLowerCase()) &&
          (!search || [fullName(u), u.email, u.universityName].some((f) => includesText(f, search)))
      ),
    [users, role, search]
  );

  const handleDelete = async () => {
    try {
      await deleteUser(toDelete.id).unwrap();
      toast.success('Hesab silindi.');
      setToDelete(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Hesab silinmədi.'));
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'İstifadəçi',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">
              {(u.firstName?.[0] || u.email?.[0] || '?').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{fullName(u)}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      cell: (u) => {
        const m = roleMeta(u.role);
        return <StatusBadge tone={m.tone} dot={false}>{m.label}</StatusBadge>;
      },
    },
    {
      key: 'university',
      header: 'Universitet',
      cell: (u) => (u.universityName ? <span className="text-foreground">{u.universityName}</span> : <span className="text-muted-foreground">—</span>),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (u) =>
        !u.status || u.status === 'Active' ? <StatusBadge tone="success">Aktiv</StatusBadge> : <StatusBadge tone="danger">Deaktiv</StatusBadge>,
    },
    { key: 'created', header: 'Qeydiyyat', cell: (u) => <span className="text-muted-foreground tabular-nums">{formatDate(u.createdAt)}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Əməliyyatlar</span>,
      headClassName: 'w-12',
      className: 'text-right',
      cell: (u) => (
        <RowActions
          items={[
            { label: 'Redaktə et', icon: Pencil, onSelect: () => setDialog({ open: true, user: u }) },
            u.role !== 'SuperAdmin' && { label: 'Sil', icon: Trash2, destructive: true, onSelect: () => setToDelete(u) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="İstifadəçilər"
        description="Müəllim, tədris mərkəzi, universitet admini və tələbə hesablarını idarə edin."
        actions={
          <Button onClick={() => setDialog({ open: true, user: null })}>
            <Plus />
            Yeni hesab
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Ad, email və ya universitet…" />
        <SimpleSelect value={role} onValueChange={setRole} options={ROLES} noneLabel="Bütün rollar" ariaLabel="Rola görə filtr" className="sm:w-48" />
      </div>

      <DataTable
        caption="İstifadəçilər"
        columns={columns}
        rows={rows}
        loading={isLoading || (isFetching && !users.length)}
        error={error ? errorMessage(error, 'İstifadəçilər yüklənmədi.') : null}
        onRetry={refetch}
        resetKey={`${search}|${role}`}
        empty={
          search || role
            ? { title: 'Uyğun hesab tapılmadı', description: 'Axtarışı və ya filtri dəyişin.' }
            : { title: 'Hələ hesab yoxdur', description: 'İlk hesabı yaradın.' }
        }
      />

      <UserDialog open={dialog.open} user={dialog.user} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
      <ConfirmDeleteDialog
        target={toDelete && { title: 'Hesab silinsin?', name: fullName(toDelete) }}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
