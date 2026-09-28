import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Building2, Clock, Globe2, GraduationCap, Sparkles, Users, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useGetUsersQuery } from '@/services/apis/userApi';
import { useAdminData } from '../hooks/useAdminData';
import { PageHeader } from '../components/common';
import { roleMeta } from '../lib/constants';

const toUserList = (d) => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);

function StatTile({ to, label, value, icon: Icon, loading }) {
  return (
    <Link
      to={to}
      className="group rounded-xl border bg-card p-5 shadow-xs outline-none hover:border-primary/30 hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value.toLocaleString('az-AZ')}</p>
      )}
      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
        İdarə et <ArrowRight className="size-3" />
      </p>
    </Link>
  );
}

/** Ranked horizontal bars: one hue (brand), values in text ink, sorted descending. */
export function RankedBars({ title, description, rows, loading, emptyText, unit }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Card className="gap-4 shadow-xs">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="space-y-3.5">
            {rows.map((r) => (
              <li key={r.label} title={`${r.label}: ${r.value} ${unit}`}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate text-foreground">{r.label}</span>
                  <span className="shrink-0 font-medium text-foreground tabular-nums">{r.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export const countBy = (items, keyFn) => {
  const map = new Map();
  items.forEach((it) => {
    const k = keyFn(it);
    if (k) map.set(k, (map.get(k) || 0) + 1);
  });
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
};

export default function OverviewPage() {
  const { universities, programs, scholarships, courses, countries, talents, loading } = useAdminData();
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const users = toUserList(usersData);

  const pendingUnis = universities.filter((u) => u.status === 'Pending').length;
  const newTalents = talents.filter((t) => !t.status || t.status === 'New').length;

  const tiles = [
    { to: '/superadmin/users', label: 'İstifadəçilər', value: users.length, icon: Users, loading: usersLoading },
    { to: '/superadmin/universities', label: 'Universitetlər', value: universities.length, icon: Building2, loading: loading.universities },
    { to: '/superadmin/programs', label: 'Proqramlar', value: programs.length, icon: GraduationCap, loading: loading.programs },
    { to: '/superadmin/scholarships', label: 'Təqaüdlər', value: scholarships.length, icon: Wallet, loading: loading.scholarships },
    { to: '/superadmin/courses', label: 'Kurslar', value: courses.length, icon: BookOpen, loading: loading.courses },
    { to: '/superadmin/countries', label: 'Ölkələr', value: countries.length, icon: Globe2, loading: loading.countries },
  ];

  const byCountry = countries
    .filter((c) => c.universitiesCount > 0)
    .map((c) => ({ label: `${c.flag} ${c.name}`, value: c.universitiesCount }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const byDegree = countBy(programs, (p) => p.degree).slice(0, 6);
  const byRole = countBy(users, (u) => roleMeta(u.role).label);

  const tasks = [
    pendingUnis > 0 && { to: '/superadmin/universities?status=Pending', icon: Clock, text: `${pendingUnis} universitet təsdiq gözləyir` },
    newTalents > 0 && { to: '/superadmin/talents?status=New', icon: Sparkles, text: `${newTalents} yeni istedad müraciəti` },
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <PageHeader title="İcmal" description="Platformadakı əsas göstəricilər və diqqət tələb edən işlər." />

      {tasks.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {tasks.map((t) => (
            <Button key={t.to} asChild variant="outline" className="h-auto justify-start border-warning/30 bg-warning-soft py-2.5 text-warning hover:bg-warning-soft/70 hover:text-warning">
              <Link to={t.to}>
                <t.icon />
                {t.text}
                <ArrowRight className="ml-auto sm:ml-2" />
              </Link>
            </Button>
          ))}
        </div>
      )}

      <section aria-label="Əsas göstəricilər" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <StatTile key={t.to} {...t} />
        ))}
      </section>

      <section aria-label="Paylanmalar" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RankedBars
          title="Universitetlər ölkələr üzrə"
          description="Ən çox universiteti olan ölkələr"
          rows={byCountry}
          loading={loading.countries}
          emptyText="Hələ universitet əlavə olunmayıb."
          unit="universitet"
        />
        <RankedBars
          title="Proqramlar dərəcə üzrə"
          description="Təhsil pilləsinə görə proqram sayı"
          rows={byDegree}
          loading={loading.programs}
          emptyText="Hələ proqram əlavə olunmayıb."
          unit="proqram"
        />
        <RankedBars
          title="İstifadəçilər rol üzrə"
          description="Hesab növlərinə görə bölgü"
          rows={byRole}
          loading={usersLoading}
          emptyText="İstifadəçi tapılmadı."
          unit="hesab"
        />
      </section>
    </div>
  );
}
