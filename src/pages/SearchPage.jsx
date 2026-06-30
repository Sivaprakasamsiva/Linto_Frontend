// frontend/src/pages/SearchPage.jsx

/**
 * Search page with filters.
 */
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiFilter, FiX, FiSearch, FiMapPin, FiSliders, FiCheckCircle,
} from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton, EmptyState, ErrorState, Pagination, Spinner } from '../components/ui';
import { useProductSearch, useCategories } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { getUserLocation, classNames, formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Viewed' },
  { value: 'demanded', label: 'Most Demanded' },
  { value: 'verified', label: 'Verified Sellers' },
  { value: 'nearby', label: 'Nearby' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [localQ, setLocalQ] = useState(searchParams.get('q') || '');
  const { data: categories } = useCategories();
  const { isAuthenticated } = useAuth();

  const params = {
    q: searchParams.get('q') || undefined,
    category_slug: searchParams.get('category_slug') || undefined,
    min_price: searchParams.get('min_price') || undefined,
    max_price: searchParams.get('max_price') || undefined,
    condition: searchParams.get('condition') || undefined,
    state: searchParams.get('state') || undefined,
    district: searchParams.get('district') || undefined,
    verified_seller: searchParams.get('verified_seller') === 'true' ? true : undefined,
    negotiable: searchParams.get('negotiable') === 'true' ? true : undefined,
    sort: searchParams.get('sort') || 'newest',
    lat: searchParams.get('lat') || undefined,
    lng: searchParams.get('lng') || undefined,
    page: parseInt(searchParams.get('page') || '1', 10),
  };

  const { data, isLoading, isError, refetch } = useProductSearch(params);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === null) next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ q: localQ, page: 1 });
  };

  const handleSort = (sort) => updateParams({ sort, page: 1 });

  const handleUseLocation = async () => {
    try {
      const { latitude, longitude } = await getUserLocation();
      updateParams({ lat: latitude, lng: longitude, sort: 'nearby', page: 1 });
      toast.success('Showing listings near you.');
    } catch (err) {
      toast.error('Could not get your location.');
    }
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalQ('');
  };

  const hasActiveFilters = ['q', 'category_slug', 'min_price', 'max_price', 'condition', 'state', 'district', 'verified_seller', 'negotiable']
    .some((k) => searchParams.has(k));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
      <Helmet><title>Search - Lintro</title></Helmet>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search for products, brands, locations..."
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            className="input pl-10 pr-24"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary !py-1.5">
            Search
          </button>
        </div>
      </form>

      {/* ===== FIXED: Filter bar with proper alignment ===== */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Filters button - left aligned */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline text-sm py-2 px-3 flex items-center gap-1.5"
        >
          <FiFilter size={16} /> Filters
        </button>

        {/* Use My Location button - center */}
        <button 
          onClick={handleUseLocation} 
          className="btn-outline text-sm py-2 px-3 flex items-center gap-1.5"
        >
          <FiMapPin size={16} /> Use My Location
        </button>

        {/* Sort dropdown - right aligned with ml-auto */}
        <div className="ml-auto">
          <select
            value={params.sort}
            onChange={(e) => handleSort(e.target.value)}
            className="input !w-auto !py-2 text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters sidebar (desktop) */}
        <aside className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
          <div className="card p-4 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <FilterSection title="Category">
              <select
                value={searchParams.get('category_slug') || ''}
                onChange={(e) => updateParams({ category_slug: e.target.value, page: 1 })}
                className="input"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </FilterSection>

            <FilterSection title="Price Range (₹)">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={searchParams.get('min_price') || ''}
                  onChange={(e) => updateParams({ min_price: e.target.value, page: 1 })}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={searchParams.get('max_price') || ''}
                  onChange={(e) => updateParams({ max_price: e.target.value, page: 1 })}
                  className="input"
                />
              </div>
            </FilterSection>

            <FilterSection title="Condition">
              <select
                value={searchParams.get('condition') || ''}
                onChange={(e) => updateParams({ condition: e.target.value, page: 1 })}
                className="input"
              >
                <option value="">Any</option>
                <option value="new">Brand New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="defective">Defective</option>
              </select>
            </FilterSection>

            <FilterSection title="State">
              <input
                type="text"
                placeholder="e.g., TamilNadu"
                value={searchParams.get('state') || ''}
                onChange={(e) => updateParams({ state: e.target.value, page: 1 })}
                className="input"
              />
            </FilterSection>

            <FilterSection title="District">
              <input
                type="text"
                placeholder="e.g., Tirupur"
                value={searchParams.get('district') || ''}
                onChange={(e) => updateParams({ district: e.target.value, page: 1 })}
                className="input"
              />
            </FilterSection>

            <FilterSection title="Seller">
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={searchParams.get('verified_seller') === 'true'}
                  onChange={(e) => updateParams({ verified_seller: e.target.checked ? 'true' : undefined, page: 1 })}
                  className="rounded"
                />
                <span className="text-sm">Verified sellers only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={searchParams.get('negotiable') === 'true'}
                  onChange={(e) => updateParams({ negotiable: e.target.checked ? 'true' : undefined, page: 1 })}
                  className="rounded"
                />
                <span className="text-sm">Negotiable only</span>
              </label>
            </FilterSection>
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : data?.results?.length === 0 ? (
            <EmptyState
              icon={FiSearch}
              title="No products found"
              description="Try adjusting your filters or search terms."
              action={
                <button onClick={clearFilters} className="btn-primary">
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 text-sm text-slate-500">
                <span>Showing {data?.results?.length} of {data?.count} results</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data?.results?.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
              <Pagination
                count={data?.count || 0}
                page={params.page}
                pageSize={20}
                onPageChange={(p) => updateParams({ page: p })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="mb-4">
      <label className="label">{title}</label>
      {children}
    </div>
  );
}