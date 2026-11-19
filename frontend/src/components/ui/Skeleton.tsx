/**
 * Skeleton loading components
 */

import { cn } from '../../utils/helpers';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'text', width, height, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className, ...props }: { lines?: number; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '60%' : '100%' } height="1rem" />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card p-4 space-y-4 animate-in fade-in', className)} {...props}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="40%" height="1.25rem" />
          <Skeleton width="60%" height="1rem" />
        </div>
      </div>
      <Skeleton variant="rectangular" width="100%" height={120} />
      <div className="flex items-center gap-2">
        <Skeleton width="80px" height="24px" />
        <Skeleton width="80px" height="24px" />
        <Skeleton width="80px" height="24px" />
      </div>
    </div>
  );
}

export function SkeletonGameCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card-hover p-3 space-y-3', className)} {...props}>
      <Skeleton variant="rectangular" width="100%" aspectRatio="4/3" className="rounded-xl" />
      <div className="space-y-2 px-1">
        <Skeleton width="80%" height="1.25rem" />
        <Skeleton width="50%" height="0.875rem" />
        <div className="flex items-center gap-2">
          <Skeleton width="60px" height="20px" />
          <Skeleton width="60px" height="20px" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonMusicPlayer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('music-player-bar p-4', className)} {...props}>
      <div className="flex items-center gap-4 w-full max-w-7xl mx-auto">
        <Skeleton variant="rectangular" width={56} height={56} className="rounded-lg" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton width="40%" height="1.125rem" />
          <Skeleton width="60%" height="0.875rem" />
          <Skeleton variant="rectangular" width="100%" height={4} className="rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton width={32} height={32} variant="circular" />
          <Skeleton width={32} height={32} variant="circular" />
          <Skeleton width={32} height={32} variant="circular" />
          <Skeleton width={100} height={4} variant="rectangular" className="rounded-full" />
        </div>
      </div>
    </div>
  );
}