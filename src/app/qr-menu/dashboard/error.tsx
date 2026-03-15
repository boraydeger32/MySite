'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for monitoring (replace with your error reporting service)
    // eslint-disable-next-line no-console
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        {/* Error icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>

        {/* Title */}
        <h2 className="mt-6 font-display text-xl font-bold text-text-main">
          Bir hata olustu
        </h2>

        {/* Description */}
        <p className="mt-2 max-w-md text-sm text-text-muted">
          Dashboard yuklenirken beklenmedik bir hata meydana geldi.
          Lutfen tekrar deneyin veya sorun devam ederse destek ekibiyle iletisime gecin.
        </p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-4 max-w-lg rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="break-all text-xs font-mono text-red-400">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={reset}
            className="bg-accent-orange text-white hover:bg-accent-orange/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
          <Button
            asChild
            variant="ghost"
            className="border border-white/10 bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-main"
          >
            <Link href="/qr-menu/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfaya Don
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
