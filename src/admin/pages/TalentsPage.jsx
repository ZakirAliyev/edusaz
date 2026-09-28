import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, FileText, Mic, Trash2, Video } from 'lucide-react';
import { resolveMediaUrl } from '@/config/env';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DataTable } from '../components/DataTable';
import { ConfirmDeleteDialog } from '../components/dialogs';
import { Field, PageHeader, RowActions, SearchInput, SimpleSelect, Spinner, StatusBadge, formatDate, includesText } from '../components/common';
import { TALENT_STATUSES, talentStatusMeta } from '../lib/constants';
import { apiRequest, errorMessage } from '../lib/api';
import { useAdminData } from '../hooks/useAdminData';

const talentName = (t) => t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim() || '—';

const parseFiles = (json) => {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return (Array.isArray(parsed) ? parsed : [parsed])
      .map((f) => (typeof f === 'string' ? { url: f, name: f.split('/').pop() } : { url: f.fileUrl || f.url, name: f.fileName || f.name || f.originalName }))
      .filter((f) => f.url);
  } catch {
    return [];
  }
};

function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{children || '—'}</dd>
    </div>
  );
}

function TalentSheet({ talent, onOpenChange, onDelete }) {
  const { reload } = useAdminData();
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [status, setStatus] = useState('New');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!talent) return;
    setDetail(talent);
    setStatus(talent.status || 'New');
    setNotes(talent.adminNotes || '');
    const controller = new AbortController();
    setLoadingDetail(true);
    apiRequest(`/HiddenTalents/${talent.id}`, { signal: controller.signal })
      .then((d) => {
        if (!d) return;
        setDetail(d);
        setStatus(d.status || 'New');
        setNotes(d.adminNotes || '');
      })
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
    return () => controller.abort();
  }, [talent]);

  const dirty = detail && (status !== (detail.status || 'New') || notes !== (detail.adminNotes || ''));

  const save = async () => {
    setSaving(true);
    try {
      await apiRequest(`/HiddenTalents/${talent.id}/status`, { method: 'PATCH', body: { status, adminNotes: notes } });
      setDetail((d) => ({ ...d, status, adminNotes: notes }));
      toast.success('Müraciət yeniləndi.');
      reload('talents');
    } catch (err) {
      toast.error(errorMessage(err, 'Müraciət yenilənmədi.'));
    } finally {
      setSaving(false);
    }
  };

  const d = detail || {};
  const files = parseFiles(d.uploadedFilesJson);
  const m = talentStatusMeta(d.status);

  return (
    <Sheet open={!!talent} onOpenChange={(open) => !open && !saving && onOpenChange(false)}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b p-6">
          <div className="flex items-center gap-2">
            <StatusBadge tone={m.tone}>{m.label}</StatusBadge>
            <span className="text-xs text-muted-foreground">{formatDate(d.createdDate)}</span>
          </div>
          <SheetTitle className="text-lg">{talentName(d)}</SheetTitle>
          <SheetDescription>{d.skillName || 'İstedad müraciəti'}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
          <section>
            <h3 className="mb-1 text-sm font-semibold text-foreground">Əlaqə</h3>
            <dl className="divide-y">
              <InfoRow label="Telefon">{d.phone && <a href={`tel:${d.phone}`} className="text-primary hover:underline">{d.phone}</a>}</InfoRow>
              <InfoRow label="Email">{d.email && <a href={`mailto:${d.email}`} className="text-primary hover:underline">{d.email}</a>}</InfoRow>
              <InfoRow label="Yaş / şəhər">{[d.age, d.cityCountry].filter(Boolean).join(' · ')}</InfoRow>
              <InfoRow label="Linklər">
                {d.socialLinks && (
                  <a href={d.socialLinks} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {d.socialLinks}
                  </a>
                )}
              </InfoRow>
            </dl>
          </section>

          <section>
            <h3 className="mb-1 text-sm font-semibold text-foreground">Bacarıq</h3>
            <dl className="divide-y">
              <InfoRow label="Səviyyə">{d.skillLevel}</InfoRow>
              <InfoRow label="Təcrübə">{d.experienceDuration}</InfoRow>
              <InfoRow label="İnvestisiya">{d.estimatedInvestment}</InfoRow>
              <InfoRow label="Komanda">{d.teamStatus}</InfoRow>
            </dl>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">İdeya</h3>
            {loadingDetail && !d.ideaDescription ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <p className="rounded-lg bg-muted/60 p-3 text-sm whitespace-pre-line text-foreground">{d.ideaDescription || 'Qeyd olunmayıb.'}</p>
            )}
            {d.problemSolved && (
              <>
                <h4 className="pt-2 text-sm font-medium text-foreground">Həll etdiyi problem</h4>
                <p className="rounded-lg bg-muted/60 p-3 text-sm whitespace-pre-line text-foreground">{d.problemSolved}</p>
              </>
            )}
          </section>

          {(d.voiceNoteUrl || d.videoUrl || files.length > 0) && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Media və fayllar</h3>
              {d.voiceNoteUrl && (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mic className="size-3.5" /> Səsli izah</p>
                  <audio controls src={resolveMediaUrl(d.voiceNoteUrl)} className="w-full" />
                </div>
              )}
              {d.videoUrl && (
                <a href={d.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-primary hover:bg-accent">
                  <Video className="size-4 shrink-0" />
                  <span className="truncate">{d.videoUrl}</span>
                </a>
              )}
              {files.map((f) => (
                <a key={f.url} href={resolveMediaUrl(f.url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-primary hover:bg-accent">
                  <FileText className="size-4 shrink-0" />
                  <span className="truncate">{f.name || f.url}</span>
                </a>
              ))}
              {d.uploadedFilesJson && files.length === 0 && (
                <code className="block rounded-lg bg-muted p-3 text-xs break-all">{d.uploadedFilesJson}</code>
              )}
            </section>
          )}

          <Separator />

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">İdarəetmə</h3>
            <Field label="Status">
              {(p) => <SimpleSelect id={p.id} value={status} onValueChange={setStatus} options={TALENT_STATUSES} disabled={saving} />}
            </Field>
            <Field label="Admin qeydləri" hint="Yalnız adminlər görür.">
              {(p) => <Textarea {...p} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={saving} />}
            </Field>
          </section>
        </div>

        <SheetFooter className="flex-row items-center justify-between border-t bg-muted/40 p-4">
          <Button variant="ghost" className="text-destructive hover:bg-red-50 hover:text-destructive" onClick={() => onDelete(d)} disabled={saving}>
            <Trash2 />
            Sil
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Bağla</Button>
            <Button onClick={save} disabled={!dirty || saving}>
              {saving && <Spinner />}
              Yadda saxla
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function TalentsPage() {
  const { talents, loading, errors, reload } = useAdminData();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const status = params.get('status') || '';
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const setStatus = (v) => setParams(v ? { status: v } : {}, { replace: true });

  const rows = useMemo(
    () =>
      talents.filter(
        (t) =>
          (!status || (t.status || 'New') === status) &&
          (!search || [talentName(t), t.skillName, t.phone, t.email].some((f) => includesText(f, search)))
      ),
    [talents, status, search]
  );

  const handleDelete = async () => {
    try {
      await apiRequest(`/HiddenTalents/${toDelete.id}`, { method: 'DELETE' });
      toast.success('Müraciət silindi.');
      setToDelete(null);
      setSelected(null);
      reload('talents');
    } catch (err) {
      toast.error(errorMessage(err, 'Müraciət silinmədi.'));
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Müraciətçi',
      cell: (t) => (
        <button type="button" onClick={() => setSelected(t)} className="min-w-0 text-left">
          <p className="max-w-56 truncate font-medium text-foreground hover:text-primary">{talentName(t)}</p>
          <p className="max-w-56 truncate text-xs text-muted-foreground">{t.email || t.phone || '—'}</p>
        </button>
      ),
    },
    { key: 'skill', header: 'Bacarıq', cell: (t) => <p className="max-w-48 truncate">{t.skillName || '—'}</p> },
    { key: 'level', header: 'Səviyyə', cell: (t) => t.skillLevel || '—' },
    {
      key: 'media',
      header: 'Media',
      cell: (t) => {
        const items = [
          t.hasVoiceNote && { icon: Mic, label: 'Səs yazısı var' },
          t.videoUrl && { icon: Video, label: 'Video var' },
          t.filesCount > 0 && { icon: FileText, label: `${t.filesCount} fayl` },
        ].filter(Boolean);
        return items.length ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            {items.map(({ icon: Icon, label }) => (
              <span key={label} title={label} className="inline-flex items-center gap-1 text-xs">
                <Icon className="size-4" aria-label={label} />
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    { key: 'date', header: 'Tarix', cell: (t) => <span className="text-muted-foreground tabular-nums">{formatDate(t.createdDate)}</span> },
    {
      key: 'status',
      header: 'Status',
      cell: (t) => {
        const m = talentStatusMeta(t.status);
        return <StatusBadge tone={m.tone}>{m.label}</StatusBadge>;
      },
    },
    {
      key: 'actions',
      header: <span className="sr-only">Əməliyyatlar</span>,
      headClassName: 'w-12',
      className: 'text-right',
      cell: (t) => (
        <RowActions
          items={[
            { label: 'Ətraflı bax', icon: Eye, onSelect: () => setSelected(t) },
            { label: 'Sil', icon: Trash2, destructive: true, onSelect: () => setToDelete(t) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Gizli bacarıqlar" description="İstifadəçilərin göndərdiyi istedad, bacarıq və biznes ideyası müraciətləri." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Ad, bacarıq, telefon və ya email…" />
        <SimpleSelect value={status} onValueChange={setStatus} options={TALENT_STATUSES} noneLabel="Bütün statuslar" ariaLabel="Statusa görə filtr" className="sm:w-52" />
      </div>

      <DataTable
        caption="İstedad müraciətləri"
        columns={columns}
        rows={rows}
        loading={loading.talents}
        error={errors.talents}
        onRetry={() => reload('talents')}
        resetKey={`${search}|${status}`}
        empty={
          search || status
            ? { title: 'Uyğun müraciət tapılmadı', description: 'Axtarışı və ya filtri dəyişin.' }
            : { title: 'Hələ müraciət yoxdur', description: 'Yeni müraciətlər burada görünəcək.' }
        }
      />

      <TalentSheet talent={selected} onOpenChange={() => setSelected(null)} onDelete={setToDelete} />
      <ConfirmDeleteDialog target={toDelete && { title: 'Müraciət silinsin?', name: talentName(toDelete) }} onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
