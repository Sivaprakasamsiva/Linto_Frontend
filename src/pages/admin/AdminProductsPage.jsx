/**
 * Admin products management.
 */
import { useState } from 'react';
import { FiSearch, FiStar, FiArchive, FiTrash2 } from 'react-icons/fi';
import { useAdminProducts, useAdminProductAction } from '../../hooks/queries';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers';
import { Spinner, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { data, isLoading } = useAdminProducts(search, status);
  const productAction = useAdminProductAction();

  const handleAction = async (productId, action) => {
    if (!confirm(`Are you sure you want to ${action} this product?`)) return;
    try {
      await productAction.mutateAsync({ productId, action });
      toast.success(`Action ${action} applied.`);
    } catch (err) {
      toast.error('Failed.');
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-4">Manage Products</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search by title, seller email, district..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
          <option value="unlisted">Unlisted</option>
          <option value="expired">Expired</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {isLoading ? <div className="flex justify-center py-20"><Spinner size={32} /></div> : !data?.results?.length ? (
        <EmptyState icon={FiSearch} title="No products found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-left">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Seller</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Listed</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3">
                      <p className="font-medium line-clamp-1">{p.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{p.district}, {p.state}</p>
                    </td>
                    <td className="p-3 text-xs">{p.seller?.full_name}</td>
                    <td className="p-3">{formatPrice(p.price)}</td>
                    <td className="p-3">
                      <span className={getStatusColor(p.status)}>{getStatusLabel(p.status)}</span>
                    </td>
                    <td className="p-3 text-xs">{formatDate(p.listed_at)}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {!p.is_featured && (
                          <button onClick={() => handleAction(p.id, 'feature')} className="btn-outline !py-1 !px-2 text-xs" title="Feature">
                            <FiStar />
                          </button>
                        )}
                        {p.is_featured && (
                          <button onClick={() => handleAction(p.id, 'unfeature')} className="btn-outline !py-1 !px-2 text-xs text-amber-600">
                            ★
                          </button>
                        )}
                        <button onClick={() => handleAction(p.id, 'archive')} className="btn-outline !py-1 !px-2 text-xs">
                          <FiArchive />
                        </button>
                        <button onClick={() => handleAction(p.id, 'delete')} className="btn-outline !py-1 !px-2 text-xs text-red-600">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
