'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function MenuLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-40 bg-white/10" />
          <Skeleton className="mt-2 h-4 w-64 bg-white/5" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-20 rounded-lg bg-white/5" />
          <Skeleton className="h-7 w-20 rounded-lg bg-white/5" />
          <Skeleton className="h-7 w-24 rounded-lg bg-white/5" />
        </div>
      </div>

      {/* Action Bar Skeleton */}
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg bg-white/5" />
        ))}
      </div>

      {/* Main Layout: Categories + Items */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left Panel: Category Skeletons */}
        <div className="space-y-4">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
                <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/10" />
                  <Skeleton className="h-3 w-16 bg-white/5" />
                </div>
              </div>
            ))}
          </div>

          {/* Category selection list skeleton */}
          <div className="space-y-1">
            <Skeleton className="mb-2 h-3 w-20 bg-white/5" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg bg-white/5" />
            ))}
          </div>
        </div>

        {/* Right Panel: Item Grid Skeletons */}
        <div className="space-y-4">
          {/* Items Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
              <Skeleton className="h-6 w-32 bg-white/10" />
              <Skeleton className="h-5 w-14 rounded-full bg-white/5" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-64 rounded-lg bg-white/5" />
              <Skeleton className="h-9 w-20 rounded-lg bg-white/5" />
              <Skeleton className="h-9 w-28 rounded-lg bg-white/10" />
            </div>
          </div>

          {/* Item Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex gap-4">
                  <Skeleton className="h-24 w-24 shrink-0 rounded-lg bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 bg-white/10" />
                    <Skeleton className="h-3 w-full bg-white/5" />
                    <Skeleton className="h-3 w-20 bg-white/5" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-5 w-12 rounded-full bg-white/5" />
                      <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
