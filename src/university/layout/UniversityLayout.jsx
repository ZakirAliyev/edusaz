import { createContext, Suspense, useContext, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Building2, ChevronsUpDown, ExternalLink, GraduationCap, Inbox, LayoutDashboard, LogOut, Settings, Unlink, Wallet } from 'lucide-react';
import '@/admin/admin.css';
import { env, resolveMediaUrl } from '@/config/env';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useGetUserProfileQuery } from '@/services/apis/userApi';
import { useAdminBody } from '@/admin/components/common';
import { PLACEHOLDER_IMAGE } from '@/admin/lib/constants';
import { UniversityDataProvider, useUniversityData } from '../hooks/useUniversityData';
import { getUniversitySession, isNewLead, signOut } from '../lib/session';

const NAV = [
  { to: '/university-portal', end: true, label: 'İcmal', icon: LayoutDashboard },
  { to: '/university-portal/profile', label: 'Universitet profili', icon: Building2 },
  { to: '/university-portal/programs', label: 'İxtisaslar', icon: GraduationCap, count: 'programs' },
  { to: '/university-portal/scholarships', label: 'Təqaüdlər', icon: Wallet, count: 'scholarships' },
  { to: '/university-portal/leads', label: 'Müraciətlər', icon: Inbox, count: 'newLeads' },
  { to: '/university-portal/analytics', label: 'Analitika', icon: BarChart3 },
  { to: '/university-portal/settings', label: 'Tənzimləmələr', icon: Settings },
];

const SessionContext = createContext(null);
export const useUniversitySession = () => useContext(SessionContext);

const isActive = (item, pathname) => (item.end ? pathname.replace(/\/$/, '') === item.to : pathname.startsWith(item.to));
const adminName = (profile, email) => [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || email;

function AppSidebar() {
  const { university, programs, scholarships, leads } = useUniversityData();
  const { isMobile, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const close = () => isMobile && setOpenMobile(false);
  const counts = { programs: programs.length, scholarships: scholarships.length, newLeads: leads.filter(isNewLead).length };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={university?.name || 'Universitet'}>
              <NavLink to="/university-portal" onClick={close}>
                <img
                  src={resolveMediaUrl(university?.logoUrl) || '/edusaz-mark.svg'}
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                  alt=""
                  className="size-8 shrink-0 rounded-lg border object-cover"
                />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold text-foreground">{university?.name || 'Universitet'}</span>
                  <span className="truncate text-xs text-muted-foreground">Universitet portalı</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item, pathname)} tooltip={item.label}>
                    <NavLink to={item.to} end={item.end} onClick={close}>
                      <item.icon />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                  {item.count && counts[item.count] > 0 && (
                    <SidebarMenuBadge className={item.count === 'newLeads' ? 'bg-primary text-primary-foreground tabular-nums' : 'tabular-nums'}>
                      {counts[item.count]}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function UserMenu() {
  const { email, profile } = useUniversitySession();
  const { universityId } = useUniversityData();
  const { isMobile } = useSidebar();
  const name = adminName(profile, email);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg">
                {profile?.profileImageUrl && <AvatarImage src={resolveMediaUrl(profile.profileImageUrl)} alt="" className="object-cover" />}
                <AvatarFallback className="rounded-lg bg-accent text-sm font-semibold text-accent-foreground">{name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium text-foreground">{name}</span>
                <span className="truncate text-xs text-muted-foreground">Universitet admini</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? 'top' : 'right'} align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/university-portal/settings">
                <Settings />
                Tənzimləmələr
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/universities/${universityId}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Saytda bax
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={signOut}>
              <LogOut />
              Çıxış
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function Topbar() {
  const { pathname } = useLocation();
  const { universityId } = useUniversityData();
  const current = NAV.find((i) => isActive(i, pathname)) || NAV[0];
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/75 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{current.label}</p>
      {!env.isProduction && (
        <Badge variant="outline" className="hidden border-warning/30 bg-warning-soft text-warning lg:inline-flex" title={env.apiBaseUrl}>
          Development · API: {env.apiOrigin.replace(/^https?:\/\//, '')}
        </Badge>
      )}
      <Button asChild variant="outline" size="sm">
        <a href={`/universities/${universityId}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink />
          <span className="hidden sm:inline">Saytda bax</span>
        </a>
      </Button>
    </header>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Yüklənir">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

function NotLinked({ email }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border bg-card p-8 text-center shadow-xs">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-warning-soft text-warning">
          <Unlink className="size-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-foreground">Hesab universitetə bağlı deyil</h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{email}</span> hesabı heç bir universitetə təhkim olunmayıb. SuperAdmin-dən hesabınızı universitetinizə bağlamasını xahiş edin.
          </p>
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut />
          Çıxış
        </Button>
      </div>
    </div>
  );
}

export default function UniversityLayout() {
  useAdminBody();
  const session = useMemo(getUniversitySession, []);
  const email = session?.email || '';
  const profileQuery = useGetUserProfileQuery(email, { skip: !session });
  const profile = profileQuery.data;
  const universityId = profile?.universityId || '';

  // Full page load (not a SPA redirect) so the panel stylesheet isn't carried to the public sign-in page.
  useEffect(() => {
    if (!session) window.location.replace('/signin');
  }, [session]);

  const sessionValue = useMemo(() => ({ email, profile, profileQuery }), [email, profile, profileQuery]);

  if (!session) return null;

  let content;
  if (profileQuery.isLoading) {
    content = (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-3 px-4" aria-busy="true" aria-label="Yüklənir">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  } else if (profileQuery.error) {
    content = (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-4 rounded-xl border bg-card p-8 text-center shadow-xs">
          <h1 className="text-lg font-semibold text-foreground">Profil yüklənmədi</h1>
          <p className="text-sm text-muted-foreground">Serverə qoşulmaq mümkün olmadı. Bir az sonra yenidən cəhd edin.</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={signOut}>Çıxış</Button>
            <Button onClick={() => profileQuery.refetch()}>Yenidən cəhd et</Button>
          </div>
        </div>
      </div>
    );
  } else if (!universityId) {
    content = <NotLinked email={email} />;
  } else {
    content = (
      <UniversityDataProvider universityId={universityId}>
        <TooltipProvider delayDuration={200}>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="min-h-svh min-w-0 bg-background">
              <Topbar />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-8">
                <Suspense fallback={<PageSkeleton />}>
                  <Outlet />
                </Suspense>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </UniversityDataProvider>
    );
  }

  return (
    <div className="admin-root">
      <SessionContext.Provider value={sessionValue}>{content}</SessionContext.Provider>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
