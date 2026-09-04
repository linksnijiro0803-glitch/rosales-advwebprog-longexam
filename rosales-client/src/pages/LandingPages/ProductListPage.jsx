import { useEffect, useMemo, useState } from 'react';
import ProductList from '../../components/ProductList.jsx';
import { getProducts } from '../../services/productService.js';

const getCategoryName = (category) => typeof category === 'string' ? category : category?.categoryName || 'Uncategorized';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    let active = true;

    getProducts({ limit: 100 })
      .then((response) => {
        if (active) setProducts(Array.isArray(response?.data) ? response.data : []);
      })
      .catch((apiError) => {
        if (active) setError(apiError.message || 'Unable to load products.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((product) => getCategoryName(product.category)))].sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === 'all' || getCategoryName(product.category) === category;
      const matchesSearch = !query || `${product.productName} ${product.description || ''}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, products, search]);

  return (
    <div>
      <header className="bg-blue-950 text-white">
        <div className="page-shell page-section">
          <p className="eyebrow !text-amber-300">Marketplace</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Find your next campus essential</h1>
          <p className="mt-4 max-w-2xl leading-7 text-blue-100">Browse real listings from the Bulldogs Exchange catalog.</p>
        </div>
      </header>

      <section className="page-shell page-section">
        <div className="panel mb-8 grid gap-4 p-4 sm:grid-cols-[1fr_15rem] sm:p-5">
          <div>
            <label htmlFor="product-search" className="text-sm font-bold text-slate-700">Search products</label>
            <input id="product-search" type="search" className="field" placeholder="Search by name or description" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div>
            <label htmlFor="product-category" className="text-sm font-bold text-slate-700">Category</label>
            <select id="product-category" className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
        </div>

        {loading && <div className="state-panel" role="status">Loading products…</div>}
        {!loading && error && <div className="alert-error" role="alert">{error}</div>}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="state-panel">{products.length ? 'No products match your search.' : 'No products are available yet.'}</div>
        )}
        {!loading && !error && filteredProducts.length > 0 && (
          <>
            <p className="mb-5 text-sm font-medium text-slate-500">Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</p>
            <ProductList products={filteredProducts} />
          </>
        )}
      </section>
    </div>
  );
};

export default ProductListPage;
