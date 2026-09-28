import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, StatusBadge } from '../components/common';
import { useAdminData } from '../hooks/useAdminData';

export default function LanguagesPage() {
  const { languages, loading, errors, reload } = useAdminData();
  const activeCount = languages.filter((l) => l.active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dillər"
        description={
          loading.languages
            ? 'Platformanın dəstəklədiyi dillər.'
            : `Platforma ${languages.length} dildə işləyir, onlardan ${activeCount}-i aktivdir. Yeni məzmun bu dillərə avtomatik tərcümə olunur.`
        }
      />

      {errors.languages && !languages.length ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-4 py-14 text-center">
          <AlertCircle className="size-6 text-destructive" />
          <p className="text-sm text-muted-foreground">{errors.languages}</p>
          <Button variant="outline" size="sm" onClick={() => reload('languages')}>Yenidən cəhd et</Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading.languages && !languages.length
            ? Array.from({ length: 8 }).map((_, i) => (
                <li key={i}>
                  <Skeleton className="h-[74px] rounded-xl" />
                </li>
              ))
            : languages.map((l) => (
                <li key={l.code} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
                  <span aria-hidden className="text-2xl leading-none">{l.flag}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{l.name}</p>
                    <p className="font-mono text-xs text-muted-foreground uppercase">{l.code}</p>
                  </div>
                  {l.active ? <StatusBadge tone="success">Aktiv</StatusBadge> : <StatusBadge tone="neutral">Deaktiv</StatusBadge>}
                </li>
              ))}
        </ul>
      )}
    </div>
  );
}
