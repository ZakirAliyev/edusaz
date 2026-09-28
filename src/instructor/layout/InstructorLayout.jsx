import { createContext, Suspense, useContext, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, ChevronsUpDown, ExternalLink, LayoutDashboard, LogOut, UserRound, Users } from 'lucide-react';
import '@/admin/admin.css';
import { env, resolveMediaUrl } from '@/config/env';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
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
import { useGetInstructorProfileQuery, useGetMyCoursesQuery } from '@/services/apis/userApi';
import { useAdminBody } from '@/admin/components/common';
import { getInstructorSession, roleLabel, signOut } from '../lib/session';

const NAV = [
  { to: '/instructor-portal', end: true, label: 'İcmal', icon: LayoutDashboard },
  { to: '/instructor-portal/courses', label: 'Kurslarım', icon: BookOpen, count: true },
  { to: '/instructor-portal/students', label: 'Tələbələr və ödənişlər', icon: Users },
  { to: '/instructor-portal/analytics', label: 'Analitika', icon: BarChart3 },
  { to: '/instructor-portal/profile', label: 'Profil', icon: UserRound },
];

const InstructorContext = createContext(null);

export function useInstructor() {
  const ctx = useContext(InstructorContext);
  if (!ctx) throw new Error('useInstructor must be used within InstructorLayout');
  return ctx;
}

const isActive = (item, pathname) => (item.end ? pathname.replace(/\/$/, '') === item.to : pathname.startsWith(item.to));

function AppSidebar() {
  const { courses } = useInstructor();
  const { isMobile, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const close = () => isMobile && setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Edusaz">
              <NavLink to="/instructor-portal" onClick={close}>
                <img src="/edusaz-mark.svg" alt="" className="size-8 shrink-0 object-contain" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold text-foreground">Edusaz</span>
                  <span className="truncate text-xs text-muted-foreground">Müəllim portalı</span>
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
                  {item.count && courses.length > 0 && <SidebarMenuBadge className="tabular-nums">{courses.length}</SidebarMenuBadge>}
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
  const { email, role, profile } = useInstructor();
  const { isMobile } = useSidebar();
  const name = profile?.displayName || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || email;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg">
                {profile?.avatarUrl && <AvatarImage src={resolveMediaUrl(profile.avatarUrl)} alt="" className="object-cover" />}
                <AvatarFallback className="rounded-lg bg-accent text-sm font-semibold text-accent-foreground">{name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium text-foreground">{name}</span>
                <span className="truncate text-xs text-muted-foreground">{roleLabel(role)}</span>
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
              <NavLink to="/instructor-portal/profile">
                <UserRound />
                Profil
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Sayta keç
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
  const current = NAV.find((i) => isActive(i, pathname)) || NAV[0];
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/75 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{current.label}</p>
      {!env.isProduction && (
        <Badge variant="outline" className="hidden border-warning/30 bg-warning-soft text-warning sm:inline-flex" title={env.apiBaseUrl}>
          Development · API: {env.apiOrigin.replace(/^https?:\/\//, '')}
        </Badge>
      )}
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

export default function InstructorLayout() {
  useAdminBody();
  const session = useMemo(getInstructorSession, []);
  const email = session?.email || '';
  const profileQuery = useGetInstructorProfileQuery(email, { skip: !session });
  const coursesQuery = useGetMyCoursesQuery(email, { skip: !session });

  const value = useMemo(
    () => ({
      email,
      role: session?.role,
      profile: profileQuery.data,
      profileQuery,
      courses: Array.isArray(coursesQuery.data) ? coursesQuery.data : [],
      coursesQuery,
    }),
    [email, session, profileQuery, coursesQuery]
  );

  // Full page load (not a SPA redirect) so the panel stylesheet isn't carried to the public sign-in page.
  useEffect(() => {
    if (!session) window.location.replace('/signin');
  }, [session]);

  if (!session) return null;

  return (
    <div className="admin-root">
      <InstructorContext.Provider value={value}>
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
      </InstructorContext.Provider>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
