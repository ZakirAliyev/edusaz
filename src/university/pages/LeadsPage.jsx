import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Phone } from 'lucide-react';
import { DataTable } from '@/admin/components/DataTable';
import { PageHeader, SearchInput, SimpleSelect, formatDate, includesText } from '@/admin/components/common';
import { apiRequest, errorMessage } from '@/admin/lib/api';
import { cn } from '@/lib/utils';
import { useUniversityData } from '../hooks/useUniversityData';
import { LEAD_STATUSES, leadStatusMeta, normalizeLeadStatus } from '../lib/session';

const TONE_CLASS = {
  info: 'text-info',
  warning: 'text-warning',
  success: 'text-success',
  danger: 'text-destructive',
};

/** Inline status control for fast triage; the colored label keeps the state visible without opening anything. */
export function LeadStatusSelect({ lead }) {
  const { reload } = useUniversityData();
  const [saving, setSaving] = useState(false);
  const meta = leadStatusMeta(lead.status);

  const change = async (status) => {
    if (status === normalizeLeadStatus(lead.status)) return;
    setSaving(true);
    try {
      await apiRequest(`/StudentLeads/${lead.id}/status`, { method: 'PUT', body: { status } });
      toast.success(`Status: ${leadStatusMeta(status).label}`);
      await reload('leads');
    } catch (err) {
      toast.error(errorMessage(err, 'Status dəyişmədi.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SimpleSelect
      value={normalizeLeadStatus(lead.status)}
      onValueChange={change}
      options={LEAD_STATUSES}
      ariaLabel={`${lead.name || 'Tələbə'} müraciətinin statusu`}
      disabled={saving}
      className={cn('h-8 w-40 font-medium', TONE_CLASS[meta.tone])}
    />
  );
}

export const leadColumns = (compact = false) => [
  {
    key: 'student',
    header: 'Tələbə',
    cell: (l) => (
      <div className="min-w-0">
        <p className="max-w-56 truncate font-medium text-foreground">{l.name || '—'}</p>
        <p className="max-w-56 truncate text-xs text-muted-foreground">
          {l.flag && <span aria-hidden>{l.flag} </span>}
          {l.origin || 'Ölkə göstərilməyib'}
        </p>
      </div>
    ),
  },
  {
    key: 'contact',
    header: 'Əlaqə',
    cell: (l) => (
      <div className="space-y-0.5 text-sm">
        {l.email && (
          <a href={`mailto:${l.email}`} className="flex max-w-56 items-center gap-1.5 truncate text-foreground hover:text-primary">
            <Mail className="size-3.5 shrink-0 text-muted-foreground" />
            {l.email}
          </a>
        )}
        {l.phone && (
          <a href={`tel:${l.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
            <Phone className="size-3.5 shrink-0" />
            {l.phone}
          </a>
        )}
      </div>
    ),
  },
  { key: 'program', header: 'İxtisas', cell: (l) => <p className="max-w-56 truncate">{l.program || 'Ümumi müraciət'}</p> },
  ...(compact
    ? []
    : [{ key: 'match', header: 'Uyğunluq', headClassName: 'hidden xl:table-cell', className: 'hidden xl:table-cell tabular-nums', cell: (l) => l.match || '—' }]),
  { key: 'date', header: 'Tarix', cell: (l) => <span className="tabular-nums text-muted-foreground">{formatDate(l.createdAt)}</span> },
  { key: 'status', header: 'Status', cell: (l) => <LeadStatusSelect lead={l} /> },
];

export default function LeadsPage() {
  const { leads, loading, errors, reload } = useUniversityData();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [search, setSearch] = useState('');

  const rows = useMemo(
    () =>
      leads.filter(
        (l) =>
          (!status || normalizeLeadStatus(l.status) === status) &&
          (!search || [l.name, l.email, l.phone, l.program, l.origin].some((f) => includesText(f, search)))
      ),
    [leads, status, search]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Müraciətlər" description="Universitetinizə müraciət edən tələbələr. Statusu dəyişməklə müraciətləri idarə edin." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Ad, email, telefon və ya ixtisas…" />
        <SimpleSelect
          value={status}
          onValueChange={(v) => setParams(v ? { status: v } : {}, { replace: true })}
          options={LEAD_STATUSES}
          noneLabel="Bütün statuslar"
          ariaLabel="Statusa görə filtr"
          className="sm:w-48"
        />
      </div>

      <DataTable
        caption="Tələbə müraciətləri"
        columns={leadColumns()}
        rows={rows}
        loading={loading.leads}
        error={errors.leads}
        onRetry={() => reload('leads')}
        resetKey={`${search}|${status}`}
        empty={
          search || status
            ? { title: 'Uyğun müraciət tapılmadı', description: 'Axtarışı və ya filtri dəyişin.' }
            : { title: 'Hələ müraciət yoxdur', description: 'Tələbələr universitetinizə müraciət etdikdə burada görünəcək.' }
        }
      />
    </div>
  );
}
