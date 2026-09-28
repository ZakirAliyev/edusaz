import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ListVideo, Plus, Star, Users, Wallet } from 'lucide-react';
import { resolveMediaUrl } from '@/config/env';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, StatusBadge } from '@/admin/components/common';
import { PLACEHOLDER_IMAGE } from '@/admin/lib/constants';
import { useInstructor } from '../layout/InstructorLayout';
import { categoryLabel, formatMoney, levelLabel } from '../lib/constants';

export function StatTile({ label, value, icon: Icon, loading, hint }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function CoursePriceText({ course }) {
  if (course.isFree || !Number(course.price)) return <StatusBadge tone="success" dot={false}>Pulsuz</StatusBadge>;
  const hasDiscount = Number(course.discountPrice) > 0 && Number(course.discountPrice) < Number(course.price);
  return (
    <span className="tabular-nums">
      <span className="font-medium text-foreground">{formatMoney(hasDiscount ? course.discountPrice : course.price, course.currency || 'AZN')}</span>
      {hasDiscount && <span className="ml-1.5 text-xs text-muted-foreground line-through">{course.price}</span>}
    </span>
  );
}

export default function OverviewPage() {
  const { profile, profileQuery, courses, coursesQuery } = useInstructor();
  const name = profile?.displayName || profile?.firstName || '';
  const published = courses.filter((c) => c.isPublished).length;
  const recent = courses.slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        title={name ? `Xoş gəldiniz, ${name}` : 'Xoş gəldiniz'}
        description="Kurslarınızın ümumi vəziyyəti."
        actions={
          <Button asChild>
            <Link to="/instructor-portal/courses/new">
              <Plus />
              Yeni kurs
            </Link>
          </Button>
        }
      />

      <section aria-label="Əsas göstəricilər" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Kurslar" value={courses.length} icon={BookOpen} loading={coursesQuery.isLoading} hint={`${published} dərc olunub`} />
        <StatTile label="Tələbələr" value={profile?.totalStudents ?? 0} icon={Users} loading={profileQuery.isLoading} />
        <StatTile label="Gəlir" value={formatMoney(profile?.totalRevenue ?? 0)} icon={Wallet} loading={profileQuery.isLoading} />
        <StatTile label="Orta reytinq" value={(profile?.rating ?? 0).toFixed(1)} icon={Star} loading={profileQuery.isLoading} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Son kurslar</h2>
          {courses.length > 3 && (
            <Button asChild variant="link" className="px-0">
              <Link to="/instructor-portal/courses">
                Hamısına bax <ArrowRight />
              </Link>
            </Button>
          )}
        </div>

        {coursesQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-accent text-primary">
              <BookOpen className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Hələ kursunuz yoxdur</p>
              <p className="text-sm text-muted-foreground">İlk kursunuzu yaradın, bölmə və video dərslər əlavə edin.</p>
            </div>
            <Button asChild>
              <Link to="/instructor-portal/courses/new">
                <Plus />
                Kurs yarat
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/instructor-portal/courses/${c.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs outline-none hover:border-primary/30 hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={resolveMediaUrl(c.thumbnailUrl) || PLACEHOLDER_IMAGE}
                      onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                      alt=""
                      className="size-full object-cover"
                    />
                    <span className="absolute top-3 left-3">
                      {c.isPublished ? <StatusBadge tone="success" className="bg-white/95">Dərc olunub</StatusBadge> : <StatusBadge tone="neutral" className="bg-white/95">Qaralama</StatusBadge>}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-xs text-muted-foreground">{categoryLabel(c.category)} · {levelLabel(c.level)}</p>
                    <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary">{c.title}</h3>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="size-4" /> {c.totalStudents || 0}</span>
                      <span className="flex items-center gap-1"><ListVideo className="size-4" /> {c.totalLectures || 0} dərs</span>
                      <CoursePriceText course={c} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
