import { Suspense } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  ChevronsUpDown,
  ExternalLink,
  Globe2,
  GraduationCap,
  Languages,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import '../admin.css';
import { env } from '@/config/env';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  SidebarGroupLabel,
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
import { AdminDataProvider, useAdminData } from '../hooks/useAdminData';
import { clearSession, currentAdminEmail, isSuperAdminSession } from '../lib/auth';
import { Spinner, useAdminBody } from '../components/common';
import { Skeleton } from '@/components/ui/skeleton';

export const NAV_GROUPS = [
  {
    label: 'Ümumi',
    items: [
      { to: '/superadmin', end: true, label: 'İcmal', icon: LayoutDashboard },
      { to: '/superadmin/users', label: 'İstifadəçilər', icon: Users },
    ],
  },
  {
    label: 'Kataloq',
    items: [
      { to: '/superadmin/universities', label: 'Universitetlər', icon: Building2, count: 'universities' },
      { to: '/superadmin/programs', label: 'Proqramlar', icon: GraduationCap, count: 'programs' },
      { to: '/superadmin/scholarships', label: 'Təqaüdlər', icon: Wallet, count: 'scholarships' },
      { to: '/superadmin/courses', label: 'Kurslar', icon: BookOpen, count: 'courses' },
    ],
  },
  {
    label: 'Parametrlər',
    items: [
      { to: '/superadmin/countries', label: 'Ölkələr', icon: Globe2, count: 'countries' },
      { to: '/superadmin/languages', label: 'Dillər', icon: Languages, count: 'languages' },
      { to: '/superadmin/talents', label: 'Gizli bacarıqlar', icon: Sparkles, count: 'talents' },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function AppSidebar() {
  const data = useAdminData();
  const { isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const closeOnMobile = () => isMobile && setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Edusaz Admin">
              <NavLink to="/superadmin" onClick={closeOnMobile}>
                <img src="/edusaz-mark.svg" alt="" className="size-8 shrink-0 object-contain" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold text-foreground">Edusaz</span>
                  <span className="truncate text-xs text-muted-foreground">İdarəetmə paneli</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = item.end ? location.pathname === item.to || location.pathname === `${item.to}/` : location.pathname.startsWith(item.to);
                  const count = item.count ? data[item.count]?.length : null;
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <NavLink to={item.to} end={item.end} onClick={closeOnMobile}>
                          <item.icon />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                      {count > 0 && <SidebarMenuBadge className="tabular-nums">{count}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function UserMenu() {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const email = currentAdminEmail();

  const logout = () => {
    clearSession();
    navigate('/superadmin/login', { replace: true });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-accent text-sm font-semibold text-accent-foreground">
                  {email[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium text-foreground">SuperAdmin</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? 'top' : 'right'} align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium text-foreground">SuperAdmin</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Sayta keç
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={logout}>
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
  const { reload, isRefreshing } = useAdminData();
  const location = useLocation();
  const current =
    ALL_ITEMS.find((i) => (i.end ? location.pathname.replace(/\/$/, '') === i.to : location.pathname.startsWith(i.to))) || ALL_ITEMS[0];

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/75 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{current.label}</p>
      {!env.isProduction && (
        <Badge variant="outline" className="hidden border-warning/30 bg-warning-soft text-warning sm:inline-flex" title={env.apiBaseUrl}>
          {env.mode === 'development' ? 'Development' : env.mode} · API: {env.apiOrigin.replace(/^https?:\/\//, '')}
        </Badge>
      )}
      <Button variant="outline" size="sm" onClick={() => reload()} disabled={isRefreshing}>
        {isRefreshing ? <Spinner /> : <RefreshCw />}
        <span className="hidden sm:inline">Yenilə</span>
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

export default function AdminLayout() {
  const location = useLocation();
  useAdminBody();

  if (!isSuperAdminSession()) {
    return <Navigate to={`/superadmin/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return (
    <div className="admin-root">
      <TooltipProvider delayDuration={200}>
        <AdminDataProvider>
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
        </AdminDataProvider>
      </TooltipProvider>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
