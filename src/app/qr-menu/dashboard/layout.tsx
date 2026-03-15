'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  ChevronRight,
  ExternalLink,
  LogOut,
  Settings,
  User,
  Menu,
  Home,
  UtensilsCrossed,
  Grid3X3,
  ClipboardList,
  Palette,
  BarChart3,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/qr-menu/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast: boolean;
}

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: 'Ana Sayfa',
  menu: 'Menu Yonetimi',
  masalar: 'Masalar',
  siparisler: 'Siparisler',
  tema: 'Tema',
  analitik: 'Analitik',
  kampanyalar: 'Kampanyalar',
  ayarlar: 'Ayarlar',
};

const MOBILE_NAV_ITEMS = [
  { label: 'Ana Sayfa', href: '/qr-menu/dashboard', icon: Home },
  { label: 'Menu', href: '/qr-menu/dashboard/menu', icon: UtensilsCrossed },
  { label: 'Masalar', href: '/qr-menu/dashboard/masalar', icon: Grid3X3 },
  { label: 'Siparisler', href: '/qr-menu/dashboard/siparisler', icon: ClipboardList },
  { label: 'Tema', href: '/qr-menu/dashboard/tema', icon: Palette },
  { label: 'Analitik', href: '/qr-menu/dashboard/analitik', icon: BarChart3 },
  { label: 'Kampanyalar', href: '/qr-menu/dashboard/kampanyalar', icon: Megaphone },
  { label: 'Ayarlar', href: '/qr-menu/dashboard/ayarlar', icon: Settings },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [notificationCount] = useState(3);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const closeMobileSheet = useCallback(() => {
    setIsMobileSheetOpen(false);
  }, []);

  const isActive = useCallback(
    (href: string) => {
      if (href === '/qr-menu/dashboard') {
        return pathname === '/qr-menu/dashboard';
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const segments = pathname
      .replace('/qr-menu/', '')
      .split('/')
      .filter(Boolean);

    return segments.map((segment, index) => ({
      label: BREADCRUMB_LABELS[segment] || segment,
      href: '/qr-menu/' + segments.slice(0, index + 1).join('/'),
      isLast: index === segments.length - 1,
    }));
  }, [pathname]);

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Desktop Sidebar - hidden on mobile via Sidebar's own responsive logic */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content area - offset for desktop sidebar */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Header bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-bg-dark/95 px-4 backdrop-blur-xl lg:px-6">
          {/* Mobile hamburger - opens Sheet with sidebar navigation */}
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-accent-orange/50 hover:text-text-main lg:hidden"
                aria-label="Navigasyon menusunu ac"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 border-white/10 bg-bg-dark/95 p-0 backdrop-blur-xl"
            >
              <SheetHeader className="border-b border-white/10 px-4 py-4">
                <SheetTitle className="flex items-center gap-3 text-left">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-orange/10">
                    <UtensilsCrossed className="h-5 w-5 text-accent-orange" />
                  </span>
                  <span className="font-display text-base font-bold text-text-main">
                    Restoran
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile navigation items */}
              <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
                {MOBILE_NAV_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileSheet}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-accent-orange/10 text-accent-orange'
                          : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          active
                            ? 'text-accent-orange'
                            : 'text-text-muted'
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile bottom actions */}
              <div className="border-t border-white/10 px-3 py-3">
                <Link
                  href="/qr-menu/dashboard/ayarlar"
                  onClick={closeMobileSheet}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-text-main"
                >
                  <User className="h-5 w-5 shrink-0" />
                  Profil
                </Link>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-red-400"
                  onClick={closeMobileSheet}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Cikis Yap
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Breadcrumb navigation */}
          <nav
            className="hidden items-center gap-1.5 text-sm sm:flex"
            aria-label="Breadcrumb"
          >
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
                )}
                {crumb.isLast ? (
                  <span className="font-medium text-text-main">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-text-muted transition-colors hover:text-text-main"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile breadcrumb - simplified, only show current page */}
          <span className="text-sm font-medium text-text-main sm:hidden">
            {breadcrumbs[breadcrumbs.length - 1]?.label}
          </span>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Notification bell */}
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-accent-orange/50 hover:text-text-main"
              aria-label={`Bildirimler - ${notificationCount} yeni`}
            >
              <Bell className="h-[18px] w-[18px]" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold leading-none text-white">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1.5 transition-colors hover:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/50"
                  aria-label="Kullanici menusu"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="" alt="Kullanici" />
                    <AvatarFallback className="bg-accent-orange/10 text-xs font-semibold text-accent-orange">
                      RS
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-text-main md:inline-block">
                    Restoran Sahibi
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-white/10 bg-bg-dark/95 backdrop-blur-xl"
              >
                <DropdownMenuLabel className="text-text-main">
                  Hesabim
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-text-muted focus:bg-white/5 focus:text-text-main"
                >
                  <Link href="/qr-menu/dashboard/ayarlar">
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-text-muted focus:bg-white/5 focus:text-text-main"
                >
                  <Link href="/qr-menu/dashboard/ayarlar">
                    <Settings className="mr-2 h-4 w-4" />
                    Ayarlar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-text-muted focus:bg-white/5 focus:text-text-main"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Menuyu Goruntule
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="cursor-pointer text-red-400 focus:bg-white/5 focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cikis Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
