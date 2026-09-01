import { useEffect, useState } from 'react';
import Button from '../../components/Button.jsx';
import ProductList from '../../components/ProductList.jsx';
import { getProducts } from '../../services/productService.js';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await getProducts();

        if (isMounted) {
          setProducts(Array.isArray(response?.data) ? response.data : []);
          setError('');
        }
      } catch (apiError) {
        if (isMounted) {
          setError(apiError.message || 'Unable to load products.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
          Products
        </p>
        <h1 className="max-w-xl text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
          Shop campus essentials in a simple product grid
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-600 sm:text-base">
          Browse practical items for class, study, commute, and everyday campus routines.
        </p>
        <div className="mt-6">
          <Button to="/">Back Home</Button>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Featured Products
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-900">Product card grid</h2>
        </div>

        {loading && (
          <p className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-5 text-sm text-zinc-600">
            Loading products...
          </p>
        )}

        {!loading && error && (
          <p className="rounded-3xl border-2 border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-5 text-sm text-zinc-600">
            No products available.
          </p>
        )}

        {!loading && !error && products.length > 0 && <ProductList products={products} />}
      </section>
    </div>
  );
}

export default ProductListPage
