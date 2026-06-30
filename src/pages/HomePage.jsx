/**
 * Home page - hero, categories, featured, recent listings.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch, FiMapPin, FiShield, FiUsers, FiPackage,
  FiTrendingUp, FiArrowRight, FiSmartphone, FiWatch, FiBookOpen,
  FiMonitor, FiTruck, FiCoffee, FiBox,
} from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton, CategorySkeleton } from '../components/ui/Skeletons';
import { EmptyState } from '../components/ui';
import {
  useCategories, useFeaturedProducts, useRecentProducts, usePublicConfig,
} from '../hooks/queries';

import LintroLogo from '../Logo/Lintro_Logo.png';

const CATEGORY_ICONS = {
  mobile: FiSmartphone,
  laptop: FiMonitor,
  tablet: FiMonitor,
  watch: FiWatch,
  vehicle: FiTruck,
  electronics: FiBox,
  furniture: FiCoffee,
  toys: FiBox,
  books: FiBookOpen,
};

export default function HomePage() {
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: featured, isLoading: featLoading } = useFeaturedProducts();
  const { data: recent, isLoading: recLoading } = useRecentProducts();
  const { data: config } = usePublicConfig();

  return (
    <div>
      <Helmet>
        {/* ===== UPDATE TITLE WITH LOGO ===== */}
        <title>Lintro - Buy & Sell Second-Hand Products in India</title>
        <meta name="description" content="India's trusted marketplace for second-hand mobiles, laptops, vehicles, furniture and more. Buy from verified sellers near you." />
        
        {/* ===== ADD FAVICON ===== */}
        <link rel="icon" href={LintroLogo} type="image/png" />
        <link rel="apple-touch-icon" href={LintroLogo} />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-4">
                Buy & Sell <span className="text-amber-300">Second-Hand</span> Products Across India
              </h1>
              <p className="text-blue-100 text-base md:text-lg mb-6">
                Find great deals on mobiles, laptops, vehicles, furniture, and more.
                Connect directly with verified sellers in your area. No middlemen.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/search" className="btn bg-white text-brand hover:bg-blue-50">
                  <FiSearch /> Browse Products
                </Link>
                <Link to="/sell" className="btn bg-amber-500 text-white hover:bg-amber-600">
                  <FiPackage /> Sell an Item
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                <div>
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-xs text-blue-100">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">Verified</div>
                  <div className="text-xs text-blue-100">Sellers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">PAN India</div>
                  <div className="text-xs text-blue-100">Coverage</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white/10 backdrop-blur p-6 rounded-3xl border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center">
                      <FiShield className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="font-semibold">Safe & Transparent</div>
                      <div className="text-xs text-blue-100">Verified seller badges</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                      <FiUsers className="text-amber-300" />
                      <span className="text-sm">Direct buyer-seller chat</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                      <FiMapPin className="text-amber-300" />
                      <span className="text-sm">Find listings near you</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                      <FiTrendingUp className="text-amber-300" />
                      <span className="text-sm">See buyer demand per listing</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Categories */}
        {config?.theme?.show_categories_section !== false && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl md:text-2xl">Browse by Category</h2>
              <Link to="/search" className="text-sm text-brand hover:underline flex items-center gap-1">
                View all <FiArrowRight size={14} />
              </Link>
            </div>
            {catLoading ? (
              <CategorySkeleton />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {categories?.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.slug] || FiBox;
                  return (
                    <Link
                      key={cat.id}
                      to={`/search?category_slug=${cat.slug}`}
                      className="card p-3 flex flex-col items-center text-center hover:shadow-md transition-shadow group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-2 group-hover:bg-brand/20">
                        <Icon className="text-brand" size={22} />
                      </div>
                      <span className="text-xs font-medium line-clamp-2">{cat.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Featured */}
        {config?.theme?.show_featured_section !== false && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl md:text-2xl flex items-center gap-2">
                <FiTrendingUp className="text-amber-500" /> Featured Listings
              </h2>
              <Link to="/search" className="text-sm text-brand hover:underline flex items-center gap-1">
                See all <FiArrowRight size={14} />
              </Link>
            </div>
            {featLoading ? (
              <ProductGridSkeleton count={4} />
            ) : featured?.results?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featured.results.slice(0, 8).map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState icon={FiPackage} title="No featured listings" description="Check back later for featured items." />
            )}
          </section>
        )}

        {/* Recent */}
        {config?.theme?.show_recent_section !== false && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl md:text-2xl">Recently Added</h2>
              <Link to="/search" className="text-sm text-brand hover:underline flex items-center gap-1">
                Browse all <FiArrowRight size={14} />
              </Link>
            </div>
            {recLoading ? (
              <ProductGridSkeleton />
            ) : recent?.results?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {recent.results.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState icon={FiPackage} title="No listings yet" description="Be the first to list something!" />
            )}
          </section>
        )}

        {/* CTA */}
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 p-8 md:p-12 text-center text-white">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
            Have something to sell?
          </h2>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Turn your unused items into cash. List in minutes, connect with buyers near you.
          </p>
          <Link to="/sell" className="btn bg-amber-500 text-white hover:bg-amber-600 text-base px-6 py-3">
            <FiPackage /> Start Selling
          </Link>
        </section>
      </div>
    </div>
  );
}
