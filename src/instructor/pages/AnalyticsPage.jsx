import { BarChart3, BookOpen, Star, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetInstructorAnalyticsQuery } from '@/services/apis/userApi';
import { DataTable } from '@/admin/components/DataTable';
import { PageHeader } from '@/admin/components/common';
import { errorMessage } from '@/admin/lib/api';
import { useInstructor } from '../layout/InstructorLayout';
import { formatMoney } from '../lib/constants';
import { StatTile } from './OverviewPage';

/** Single-series column chart: one brand hue, value labels in text ink, hover shows the exact figures. */
function RevenueChart({ months }) {
  const max = Math.max(1, ...months.map((m) => Number(m.revenue) || 0));
  return (
    <div className="flex h-56 items-end gap-2 sm:gap-4" role="list" aria-label="Aylıq gəlir">
      {months.map((m) => {
        const value = Number(m.revenue) || 0;
        const label = `${m.month}: ${formatMoney(value)}, ${m.enrollments ?? 0} qeydiyyat`;
        return (
          <div key={m.month} role="listitem" className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2" title={label} aria-label={label}>
            <span className="text-xs font-medium tabular-nums text-foreground">{value ? Math.round(value) : ''}</span>
            <div className="flex w-full max-w-12 flex-1 items-end rounded-t-md bg-muted">
              <div className="w-full rounded-t-md bg-brand group-hover:bg-primary-hover" style={{ height: `${Math.max(2, (value / max) * 100)}%` }} />
            </div>
            <span className="truncate text-xs text-muted-foreground">{m.month?.split(' ')[0]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const { email, courses } = useInstructor();
  const { data, isLoading, error, refetch } = useGetInstructorAnalyticsQuery(email, { skip: !email });
  const months = data?.monthlyRevenue || [];
  const top = (data?.topCourses || []).map((c, i) => ({ ...c, rank: i + 1 }));

  if (error && !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analitika" />
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">{errorMessage(error, 'Analitika yüklənmədi.')}</p>
          <Button variant="outline" size="sm" onClick={refetch}>Yenidən cəhd et</Button>
        </div>
      </div>
    );
  }

  const hasRevenue = months.some((m) => Number(m.revenue) > 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Analitika" description="Kurslarınızın qeydiyyat və gəlir göstəriciləri." />

      <section aria-label="Əsas göstəricilər" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Kurslar" value={data?.totalCourses ?? courses.length} icon={BookOpen} loading={isLoading} hint={`${data?.publishedCourses ?? 0} dərc olunub`} />
        <StatTile label="Tələbələr" value={data?.totalStudents ?? 0} icon={Users} loading={isLoading} />
        <StatTile label="Ümumi gəlir" value={formatMoney(data?.totalRevenue ?? 0)} icon={Wallet} loading={isLoading} />
        <StatTile label="Orta reytinq" value={(data?.averageRating ?? 0).toFixed(1)} icon={Star} loading={isLoading} hint={`${data?.totalReviews ?? 0} rəy`} />
      </section>

      <Card className="gap-4 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">Aylıq gəlir</CardTitle>
          <CardDescription>Son aylar üzrə, AZN</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : hasRevenue ? (
            <RevenueChart months={months} />
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <BarChart3 className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Hələ gəlir yoxdur. İlk ödənişlərdən sonra qrafik burada görünəcək.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Ən uğurlu kurslar</h2>
        <DataTable
          caption="Ən uğurlu kurslar"
          columns={[
            { key: 'rank', header: '#', headClassName: 'w-12', className: 'tabular-nums text-muted-foreground', cell: (c) => c.rank },
            { key: 'title', header: 'Kurs', cell: (c) => <p className="max-w-80 truncate font-medium text-foreground">{c.courseTitle}</p> },
            { key: 'enrollments', header: 'Tələbələr', className: 'tabular-nums', cell: (c) => c.enrollments },
            { key: 'revenue', header: 'Gəlir', className: 'tabular-nums', cell: (c) => formatMoney(c.revenue) },
            { key: 'rating', header: 'Reytinq', className: 'tabular-nums', cell: (c) => (c.rating || 0).toFixed(1) },
          ]}
          rows={top}
          loading={isLoading}
          getRowKey={(c) => c.courseId}
          empty={{ title: 'Hələ məlumat yoxdur', description: 'Tələbələr qoşulduqca kurslarınız burada sıralanacaq.' }}
        />
      </section>
    </div>
  );
}
