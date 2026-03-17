'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
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
import { createClient } from '@/lib/supabase/client';
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

// ---------------------------------------------------------------------------
// Animation Variants (follows MobileMenu.tsx pattern)
// ---------------------------------------------------------------------------

const contentEntryVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30, delay: 0.05 },
  },
};

const mobileNavItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

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
  const router = useRouter();
  const [notificationCount] = useState(3);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [restaurantSlug, setRestaurantSlug] = useState('lezzet-duragi');

  useEffect(() => {
    async function fetchSlug() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('restaurants')
            .select('slug')
            .eq('owner_id', user.id)
            .single();
          if (data?.slug) setRestaurantSlug(data.slug);
        }
      } catch { /* fallback to demo-restoran */ }
    }
    fetchSlug();
  }, []);

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

  const handleLogout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Cikis yapildi.');
      router.push('/qr-menu/giris');
    } catch {
      toast.error('Cikis yapilamadi.', {
        description: 'Lutfen tekrar deneyiniz.',
      });
    }
  }, [router]);

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
    <div className="min-h-screen overflow-x-hidden bg-bg-dark">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#dashboard-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent-orange focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
      >
        Ana icerige atla
      </a>

      {/* Desktop Sidebar - hidden on mobile via Sidebar's own responsive logic */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content area - offset for desktop sidebar */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Header bar */}
        <header
          className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-bg-dark/95 px-4 backdrop-blur-xl lg:px-6"
          role="banner"
        >
          {/* Mobile hamburger - opens Sheet with sidebar navigation */}
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <button
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-accent-orange/50 hover:text-text-main lg:hidden"
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

              {/* Mobile navigation items - 44px min touch targets */}
              <nav
                className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
                aria-label="Dashboard navigasyonu"
              >
                {MOBILE_NAV_ITEMS.map((item, index) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.href}
                      variants={mobileNavItemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMobileSheet}
                        className={cn(
                          'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
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
                          aria-hidden="true"
                        />
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Mobile bottom actions - 44px min touch targets */}
              <div className="border-t border-white/10 px-3 py-3">
                <Link
                  href="/qr-menu/dashboard/ayarlar"
                  onClick={closeMobileSheet}
                  className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-text-main"
                >
                  <User className="h-5 w-5 shrink-0" aria-hidden="true" />
                  Profil
                </Link>
                <button
                  className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-red-400"
                  onClick={() => {
                    closeMobileSheet();
                    handleLogout();
                  }}
                >
                  <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
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
            <ol className="flex items-center gap-1.5">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                  )}
                  {crumb.isLast ? (
                    <span className="font-medium text-text-main" aria-current="page">
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
                </li>
              ))}
            </ol>
          </nav>

          {/* Mobile breadcrumb - simplified, only show current page */}
          <span className="text-sm font-medium text-text-main sm:hidden" aria-hidden="true">
            {breadcrumbs[breadcrumbs.length - 1]?.label}
          </span>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Notification bell - 44px touch target */}
            <button
              className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-accent-orange/50 hover:text-text-main sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
              aria-label={`Bildirimler - ${notificationCount} yeni`}
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              {notificationCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold leading-none text-white"
                  aria-hidden="true"
                >
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
                  aria-haspopup="true"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="" alt="" />
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
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-text-muted focus:bg-white/5 focus:text-text-main"
                >
                  <Link href="/qr-menu/dashboard/ayarlar">
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    Ayarlar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-text-muted focus:bg-white/5 focus:text-text-main"
                  onClick={() => window.open(`/${restaurantSlug}/masa/1`, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                  Menuyu Goruntule
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="cursor-pointer text-red-400 focus:bg-white/5 focus:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Cikis Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content with entry animation */}
        <motion.main
          id="dashboard-main-content"
          key={pathname}
          variants={contentEntryVariants}
          initial="hidden"
          animate="visible"
          className="p-4 lg:p-6"
          role="main"
          aria-label="Dashboard icerik alani"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
