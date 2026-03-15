'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Building2,
  Users,
  CreditCard,
  Cpu,
  Megaphone,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface AdminSidebarProps {
  className?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Ana Sayfa', href: '/super-admin/dashboard', icon: Home },
  { label: 'Restoranlar', href: '/super-admin/dashboard/restoranlar', icon: Building2 },
  { label: 'Kullanicilar', href: '/super-admin/dashboard/kullanicilar', icon: Users },
  { label: 'Planlar', href: '/super-admin/dashboard/planlar', icon: CreditCard },
  { label: 'Sistem', href: '/super-admin/dashboard/sistem', icon: Cpu },
  { label: 'Duyurular', href: '/super-admin/dashboard/duyurular', icon: Megaphone },
];

const SIDEBAR_WIDTH_EXPANDED = 256;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const sidebarVariants = {
  expanded: {
    width: SIDEBAR_WIDTH_EXPANDED,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  collapsed: {
    width: SIDEBAR_WIDTH_COLLAPSED,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

const labelVariants = {
  visible: {
    opacity: 1,
    x: 0,
    display: 'block' as const,
    transition: { delay: 0.1, duration: 0.2 },
  },
  hidden: {
    opacity: 0,
    x: -10,
    transitionEnd: { display: 'none' as const },
    transition: { duration: 0.1 },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const mobileMenuVariants = {
  hidden: {
    x: '-100%',
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  visible: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle escape key for mobile menu
  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    },
    [closeMobileMenu]
  );

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileOpen, handleEscapeKey]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Cikis yapildi.');
      router.push('/super-admin/giris');
    } catch {
      toast.error('Cikis yapilamadi.', {
        description: 'Lutfen tekrar deneyiniz.',
      });
    }
  };

  const isActive = (href: string) => {
    if (href === '/super-admin/dashboard') {
      return pathname === '/super-admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, collapsed: boolean) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          collapsed && 'justify-center px-0',
          active
            ? 'bg-accent-blue/10 text-accent-blue'
            : 'text-text-muted hover:bg-white/5 hover:text-text-main'
        )}
        title={collapsed ? item.label : undefined}
        aria-current={active ? 'page' : undefined}
      >
        {/* Active indicator */}
        {active && (
          <motion.span
            layoutId="admin-sidebar-active-indicator"
            className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent-blue"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}

        <Icon
          className={cn(
            'h-5 w-5 shrink-0 transition-colors',
            active ? 'text-accent-blue' : 'text-text-muted group-hover:text-text-main'
          )}
        />

        {!collapsed && (
          <motion.span
            variants={labelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <span className="pointer-events-none absolute left-full z-50 ml-2 hidden rounded-md bg-bg-dark/95 px-2.5 py-1.5 text-xs font-medium text-text-main shadow-lg shadow-black/30 ring-1 ring-white/10 backdrop-blur-xl group-hover:block">
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  const renderMobileNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    return (
      <motion.div key={item.href} variants={itemVariants}>
        <Link
          href={item.href}
          onClick={closeMobileMenu}
          className={cn(
            'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
            active
              ? 'bg-accent-blue/10 text-accent-blue'
              : 'text-text-main hover:bg-white/5 hover:text-accent-blue'
          )}
          aria-current={active ? 'page' : undefined}
        >
          <Icon
            className={cn(
              'h-5 w-5 shrink-0',
              active ? 'text-accent-blue' : 'text-text-muted'
            )}
          />
          {item.label}
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <motion.button
        onClick={toggleMobileMenu}
        className="fixed left-4 top-4 z-80 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-bg-dark/90 text-text-main backdrop-blur-xl transition-colors hover:border-accent-blue/50 hover:text-accent-blue lg:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isMobileOpen ? 'Menuyu kapat' : 'Menuyu ac'}
        aria-expanded={isMobileOpen}
      >
        <Menu className="h-5 w-5" />
      </motion.button>

      {/* Mobile overlay + slide-out menu */}
      <AnimatePresence mode="wait">
        {isMobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-90 bg-bg-dark/60 backdrop-blur-sm lg:hidden"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.3 }}
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            <motion.nav
              className="fixed inset-y-0 left-0 z-100 flex w-full max-w-xs flex-col border-r border-white/10 bg-bg-dark/95 backdrop-blur-xl lg:hidden"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigasyon menusu"
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-blue/10">
                    <Shield className="h-5 w-5 text-accent-blue" />
                  </span>
                  <span className="font-display text-lg font-bold text-text-main">
                    Super Admin
                  </span>
                </div>
                <motion.button
                  onClick={closeMobileMenu}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-main transition-colors hover:border-accent-blue/50 hover:text-accent-blue"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Menuyu kapat"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Mobile nav items */}
              <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                {NAV_ITEMS.map((item) => renderMobileNavItem(item))}
              </div>

              {/* Mobile bottom section */}
              <div className="border-t border-white/10 p-3">
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-red-400"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    Cikis Yap
                  </button>
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/10 bg-bg-dark/95 backdrop-blur-xl lg:flex',
          className
        )}
        variants={sidebarVariants}
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        aria-label="Admin navigasyon"
      >
        {/* Logo / Platform info */}
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center w-full')}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-blue/10">
              <Shield className="h-5 w-5 text-accent-blue" />
            </span>
            {!isCollapsed && (
              <motion.span
                variants={labelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="truncate font-display text-base font-bold text-text-main"
              >
                Super Admin
              </motion.span>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => renderNavItem(item, isCollapsed))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10 px-3 py-3">
          <button
            onClick={handleLogout}
            className={cn(
              'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-white/5 hover:text-red-400',
              isCollapsed && 'justify-center px-0'
            )}
            title={isCollapsed ? 'Cikis Yap' : undefined}
          >
            <LogOut
              className="h-5 w-5 shrink-0 text-text-muted transition-colors group-hover:text-red-400"
            />
            {!isCollapsed && (
              <motion.span
                variants={labelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="whitespace-nowrap"
              >
                Cikis Yap
              </motion.span>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full z-50 ml-2 hidden rounded-md bg-bg-dark/95 px-2.5 py-1.5 text-xs font-medium text-text-main shadow-lg shadow-black/30 ring-1 ring-white/10 backdrop-blur-xl group-hover:block">
                Cikis Yap
              </span>
            )}
          </button>
        </div>

        {/* Collapse toggle */}
        <div className="border-t border-white/10 p-3">
          <motion.button
            onClick={toggleCollapse}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-text-main',
              isCollapsed && 'justify-center px-0'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={isCollapsed ? 'Menuyu genislet' : 'Menuyu daralt'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 shrink-0" />
                <motion.span
                  variants={labelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="whitespace-nowrap"
                >
                  Daralt
                </motion.span>
              </>
            )}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
