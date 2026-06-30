/**
 * Skeleton loaders.
 */
import { classNames } from '../../utils/helpers';

export function Skeleton({ className = '' }) {
  return <div className={classNames('skeleton rounded', className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/2" />
        <div className="h-4 skeleton w-1/3 mt-2" />
        <div className="h-3 skeleton w-2/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="aspect-square skeleton rounded-xl" />
      <div className="space-y-4">
        <div className="h-6 skeleton w-3/4" />
        <div className="h-8 skeleton w-1/3" />
        <div className="h-4 skeleton w-1/2" />
        <div className="h-32 skeleton" />
        <div className="h-10 skeleton w-1/2" />
      </div>
    </div>
  );
}

export function CategorySkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-3 space-y-2">
          <div className="aspect-square skeleton rounded-lg" />
          <div className="h-3 skeleton" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 flex gap-3">
          <div className="w-16 h-16 skeleton rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 skeleton w-3/4" />
            <div className="h-3 skeleton w-1/2" />
            <div className="h-3 skeleton w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
