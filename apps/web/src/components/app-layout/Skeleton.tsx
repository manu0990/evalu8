'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-md bg-muted/70 animate-[skeleton-pulse_2s_ease-in-out_infinite] ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/40 to-transparent"></div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-lg bg-card">
            <div className="flex items-center space-x-3 mb-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-9 w-20 mb-2" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
      
      {/* Recent meetings section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        
        {/* Meeting cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-lg bg-card">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MeetingGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-6 rounded-lg bg-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-20 w-full" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}