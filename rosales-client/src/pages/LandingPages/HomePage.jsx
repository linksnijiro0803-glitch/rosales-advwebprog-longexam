import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import ProductList from '../../components/ProductList';
import banner from '../../assets/img/nu_bulldogex_banner.jpg';
import { getProducts } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getProducts({ limit: 4 })
      .then((response) => {
        if (active) setProducts(Array.isArray(response?.data) ? response.data.slice(0, 4) : []);
      })
      .catch((apiError) => {
        if (active) setError(apiError.message || 'Unable to load featured products.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-blue-950 text-white">
        <img src={banner} alt="Bulldogs campus marketplace" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-950 via-blue-950/90 to-blue-950/45" />
        <div className="page-shell flex min-h-[34rem] items-center py-16 sm:min-h-[40rem]">
          <div className="max-w-3xl">
            <p className="eyebrow !text-amber-300">The campus marketplace</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Buy, Sell, and Exchange Within the Bulldogs Community
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              Discover school essentials, useful finds, and community listings in one trusted place built for Bulldogs.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/products" className="border-amber-400 bg-amber-400 text-blue-950 hover:border-amber-300 hover:bg-amber-300">Browse Products</Button>
              {!isAuthenticated && <Button to="/auth/signup" className="border-white/50 bg-white/10 text-white hover:border-white hover:text-white">Create Account</Button>}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell page-section">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['Community-first', 'Browse listings created for the Bulldogs community.'],
            ['Clear product details', 'See price, condition, availability, and seller information at a glance.'],
            ['Simple ordering', 'Move from discovery to cart and checkout without the clutter.'],
          ].map(([title, copy]) => (
            <article key={title} className="panel p-6">
              <div className="mb-4 h-1.5 w-12 rounded-full bg-amber-400" />
              <h2 className="text-lg font-extrabold text-blue-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="page-shell page-section">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Fresh listings</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Featured products</h2>
              <p className="mt-3 text-slate-600">Real products currently available in the marketplace.</p>
            </div>
            <Button to="/products">View all products</Button>
          </div>
          {loading && <div className="state-panel" role="status">Loading featured products…</div>}
          {!loading && error && <div className="alert-error" role="alert">{error}</div>}
          {!loading && !error && products.length === 0 && <div className="state-panel">No products are available yet.</div>}
          {!loading && !error && products.length > 0 && <ProductList products={products} />}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
