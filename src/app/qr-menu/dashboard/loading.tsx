'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header skeleton */}
      <div>
        <Skeleton className="h-8 w-40 bg-white/10" />
        <Skeleton className="mt-2 h-4 w-72 bg-white/5" />
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-lg bg-white/10" />
              <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
            </div>
            <Skeleton className="mt-3 h-7 w-20 bg-white/10" />
            <Skeleton className="mt-2 h-3 w-28 bg-white/5" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue Chart Skeleton */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-28 bg-white/10" />
              <Skeleton className="mt-1 h-3 w-16 bg-white/5" />
            </div>
            <Skeleton className="h-4 w-32 bg-white/5" />
          </div>
          <Skeleton className="h-[280px] w-full rounded-lg bg-white/5" />
        </div>

        {/* Top Products Skeleton */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-4">
            <Skeleton className="h-5 w-28 bg-white/10" />
            <Skeleton className="mt-1 h-3 w-32 bg-white/5" />
          </div>
          <Skeleton className="h-[280px] w-full rounded-lg bg-white/5" />
        </div>
      </div>

      {/* Heatmap Skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4">
          <Skeleton className="h-5 w-44 bg-white/10" />
          <Skeleton className="mt-1 h-3 w-56 bg-white/5" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-lg bg-white/5" />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Orders Skeleton */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-28 bg-white/10" />
              <Skeleton className="mt-1 h-3 w-20 bg-white/5" />
            </div>
            <Skeleton className="h-4 w-20 bg-white/5" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-16 bg-white/10" />
                <Skeleton className="h-4 w-14 bg-white/5" />
                <Skeleton className="hidden h-4 flex-1 bg-white/5 sm:block" />
                <Skeleton className="h-4 w-12 bg-white/10" />
                <Skeleton className="h-5 w-20 rounded-full bg-white/5" />
                <Skeleton className="h-4 w-16 bg-white/5" />
              </div>
            ))}
          </div>
        </div>

        {/* Right column skeletons */}
        <div className="flex flex-col gap-4">
          {/* Active Tables Skeleton */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-4">
              <Skeleton className="h-5 w-24 bg-white/10" />
              <Skeleton className="mt-1 h-3 w-28 bg-white/5" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-square rounded-lg bg-white/5"
                />
              ))}
            </div>
          </div>

          {/* Low Stock Skeleton */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
              <div>
                <Skeleton className="h-5 w-32 bg-white/10" />
                <Skeleton className="mt-1 h-3 w-20 bg-white/5" />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
