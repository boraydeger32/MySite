'use client';

import { useEffect } from 'react';

export default function RestoranError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Restoran Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050A14] px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-white">
          Bir hata olustu
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Sayfa yuklenirken bir sorun yasandi. Lutfen tekrar deneyin.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-[#FF6B2B] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#FF6B2B]/90"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
