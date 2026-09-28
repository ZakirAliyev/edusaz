import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Inbox, Plus, Sparkles, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/admin/components/DataTable';
import { PageHeader } from '@/admin/components/common';
import { StatTile } from '@/instructor/pages/OverviewPage';
import { useUniversitySession } from '../layout/UniversityLayout';
import { useUniversityData } from '../hooks/useUniversityData';
import { leadColumns } from './LeadsPage';
import { isNewLead } from '../lib/session';

export default function OverviewPage() {
  const { profile } = useUniversitySession();
  const { university, programs, scholarships, leads, loading, errors, reload } = useUniversityData();
  const newLeads = leads.filter(isNewLead).length;
  const accepted = leads.filter((l) => l.status === 'Accepted').length;
  const name = profile?.firstName || '';

  return (
    <div className="space-y-8">
      <PageHeader
        title={name ? `Xoş gəldiniz, ${name}` : 'Xoş gəldiniz'}
        description={university ? `${university.name} üzrə ixtisaslar, təqaüdlər və tələbə müraciətləri.` : undefined}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/university-portal/scholarships?new=1">
                <Plus />
                Təqaüd
              </Link>
            </Button>
            <Button asChild>
              <Link to="/university-portal/programs?new=1">
                <Plus />
                İxtisas
              </Link>
            </Button>
          </>
        }
      />

      {newLeads > 0 && (
        <Button asChild variant="outline" className="h-auto justify-start border-primary/20 bg-accent py-2.5 text-accent-foreground hover:bg-accent/70">
          <Link to="/university-portal/leads?status=Applied">
            <Sparkles />
            {newLeads} yeni müraciət cavab gözləyir
            <ArrowRight className="ml-2" />
          </Link>
        </Button>
      )}

      <section aria-label="Əsas göstəricilər" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="İxtisaslar" value={programs.length} icon={GraduationCap} loading={loading.programs} />
        <StatTile label="Təqaüdlər" value={scholarships.length} icon={Wallet} loading={loading.scholarships} />
        <StatTile label="Müraciətlər" value={leads.length} icon={Inbox} loading={loading.leads} hint={`${newLeads} yeni`} />
        <StatTile
          label="Qəbul olunan"
          value={leads.length ? `${Math.round((accepted / leads.length) * 100)}%` : '—'}
          icon={Sparkles}
          loading={loading.leads}
          hint={`${accepted} tələbə qəbul edilib`}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Son müraciətlər</h2>
          {leads.length > 5 && (
            <Button asChild variant="link" className="px-0">
              <Link to="/university-portal/leads">
                Hamısına bax <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
        <DataTable
          caption="Son müraciətlər"
          columns={leadColumns(true)}
          rows={leads.slice(0, 5)}
          loading={loading.leads}
          error={errors.leads}
          onRetry={() => reload('leads')}
          empty={{ title: 'Hələ müraciət yoxdur', description: 'Tələbələr universitetinizə müraciət etdikdə burada görünəcək.' }}
        />
      </section>
    </div>
  );
}
