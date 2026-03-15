'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function SiparislerLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-6 p-6">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
          <div>
            <Skeleton className="h-6 w-28 bg-white/10" />
            <Skeleton className="mt-1 h-4 w-40 bg-white/5" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36 rounded-xl bg-white/5" />
          <Skeleton className="h-10 w-20 rounded-xl bg-white/5" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-64 rounded-lg bg-white/5" />
        <Skeleton className="h-10 w-48 rounded-xl bg-white/5" />
      </div>

      {/* Stats Bar Skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg bg-white/5" />
        ))}
      </div>

      {/* Kanban Columns Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, colIdx) => (
          <div
            key={colIdx}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            {/* Column header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded bg-white/10" />
                <Skeleton className="h-5 w-24 bg-white/10" />
              </div>
              <Skeleton className="h-5 w-8 rounded-full bg-white/5" />
            </div>

            {/* Order cards */}
            <div className="space-y-3">
              {Array.from({ length: colIdx === 0 ? 3 : 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 bg-white/10" />
                    <Skeleton className="h-4 w-16 bg-white/5" />
                  </div>
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-3 w-full bg-white/5" />
                    <Skeleton className="h-3 w-2/3 bg-white/5" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
                    <Skeleton className="h-4 w-14 bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
