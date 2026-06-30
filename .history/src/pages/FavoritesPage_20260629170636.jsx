// frontend/src/pages/FavoritesPage.jsx
/**
 * Favorites page.
 */
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton, EmptyState } from '../components/ui';
import { useFavorites } from '../hooks/queries';

export default function FavoritesPage() {
  const { data, isLoading, isError } = useFavorites();
  
  console.log('Favorites data:', data);
  console.log('Favorites isError:', isError);
  
  // Extract favorites from the response
  // The FavoriteSerializer returns { id, product, created_at }
  // So we need to extract the product from each favorite
  const favorites = data?.results || [];
  const favoriteProducts = favorites.map(fav => fav.product).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet><title>Favorites - Lintro</title></Helmet>
      <h1 className="font-display font-bold text-2xl mb-6">My Favorites</h1>
      
      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : isError ? (
        <EmptyState
          icon={FiHeart}
          title="Could not load favorites"
          description="Please refresh the page or try again later."
          action={<button onClick={() => window.location.reload()} className="btn-primary">Refresh</button>}
        />
      ) : favoriteProducts.length === 0 ? (
        <EmptyState
          icon={FiHeart}
          title="No favorites yet"
          description="Tap the heart icon on any product to save it here."
          action={<Link to="/search" className="btn-primary">Browse Products</Link>}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}