import { CheckCircle2, GraduationCap, Inbox, Wallet } from 'lucide-react';
import { PageHeader } from '@/admin/components/common';
import { RankedBars, countBy } from '@/admin/pages/OverviewPage';
import { StatTile } from '@/instructor/pages/OverviewPage';
import { useUniversityData } from '../hooks/useUniversityData';
import { leadStatusMeta } from '../lib/session';

// Everything here is computed from the university's real programs and applications.
export default function AnalyticsPage() {
  const { programs, scholarships, leads, loading } = useUniversityData();
  const accepted = leads.filter((l) => l.status === 'Accepted').length;
  const decided = leads.filter((l) => l.status === 'Accepted' || l.status === 'Rejected').length;

  const byStatus = countBy(leads, (l) => leadStatusMeta(l.status).label);
  const byOrigin = countBy(leads, (l) => (l.origin ? `${l.flag || ''} ${l.origin}`.trim() : null)).slice(0, 6);
  const byProgram = countBy(leads, (l) => l.program || 'Ümumi müraciət').slice(0, 6);
  const byDegree = countBy(programs, (p) => p.degree).slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader title="Analitika" description="Müraciətlər və təklif etdiyiniz proqramlar üzrə göstəricilər." />

      <section aria-label="Əsas göstəricilər" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Müraciətlər" value={leads.length} icon={Inbox} loading={loading.leads} />
        <StatTile
          label="Qəbul faizi"
          value={decided ? `${Math.round((accepted / decided) * 100)}%` : '—'}
          icon={CheckCircle2}
          loading={loading.leads}
          hint={decided ? `Qərar verilmiş ${decided} müraciətdən` : 'Hələ qərar verilməyib'}
        />
        <StatTile label="İxtisaslar" value={programs.length} icon={GraduationCap} loading={loading.programs} />
        <StatTile label="Təqaüdlər" value={scholarships.length} icon={Wallet} loading={loading.scholarships} />
      </section>

      <section aria-label="Paylanmalar" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RankedBars title="Müraciətlər status üzrə" rows={byStatus} loading={loading.leads} emptyText="Hələ müraciət yoxdur." unit="müraciət" />
        <RankedBars title="Tələbələrin ölkələri" description="Ən çox müraciət gələn ölkələr" rows={byOrigin} loading={loading.leads} emptyText="Hələ müraciət yoxdur." unit="müraciət" />
        <RankedBars title="Ən çox seçilən ixtisaslar" rows={byProgram} loading={loading.leads} emptyText="Hələ müraciət yoxdur." unit="müraciət" />
        <RankedBars title="İxtisaslar dərəcə üzrə" rows={byDegree} loading={loading.programs} emptyText="Hələ ixtisas əlavə olunmayıb." unit="ixtisas" />
      </section>
    </div>
  );
}
