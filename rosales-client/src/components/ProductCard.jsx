import Button from './Button';
import logo from '../assets/img/nubdexchange_logo.png';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMyCart, saveCartItems } from '../services/cartService';

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const getCategoryName = (category) => {
  if (!category) {
    return 'Uncategorized';
  }

  if (typeof category === 'string') {
    return category;
  }

  return category.categoryName || 'Uncategorized';
};

const getProductImage = (product) => product.images?.find(Boolean);

const ProductCard = ({ product }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const image = getProductImage(product);
  const productId = product._id || product.id;
  const description = product.description || 'No description available.';

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setError('Log in to add this item.');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const cart = await getMyCart(token);
      const currentItems = cart?.items || [];
      const existingItem = currentItems.find((item) => (item.product?._id || item.product) === productId);
      const nextItems = existingItem
        ? currentItems.map((item) => (item.product?._id || item.product) === productId
          ? { product: productId, quantity: Number(item.quantity) + 1, price: Number(product.price) }
          : { product: item.product?._id || item.product, quantity: item.quantity, price: item.price })
        : [
          ...currentItems.map((item) => ({ product: item.product?._id || item.product, quantity: item.quantity, price: item.price })),
          { product: productId, quantity: 1, price: Number(product.price) },
        ];

      await saveCartItems({ token, userId: user.id, cart, items: nextItems });
      setMessage('Added.');
    } catch (apiError) {
      setError(apiError.message || 'Unable to add item.');
    } finally {
      setSaving(false);
    }
  };

  const inStock = Number(product.stock) > 0 && product.status !== 'sold' && product.status !== 'inactive';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10">
      <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden bg-slate-100">
        <img
          src={image || logo}
          alt={product.productName || 'Product'}
          className={image ? 'h-full w-full object-cover transition duration-300 group-hover:scale-105' : 'h-20 w-20 rounded-full bg-white object-contain p-1 shadow-sm'}
        />
        <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
          {inStock ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">{getCategoryName(product.category)}</p>
        <h3 className="mt-2 text-lg font-extrabold leading-snug text-blue-950">{product.productName}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-xl font-black text-slate-950">{currencyFormatter.format(Number(product.price) || 0)}</p>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">{product.condition || 'good'}</span>
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{description}</p>
        <p className="mt-3 text-xs font-medium text-slate-500">{product.stock ?? 0} in stock</p>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Button to={`/products/${productId}`} className="px-3">View</Button>
          <Button type="button" variant="primary" className="px-3" onClick={handleAddToCart} disabled={saving || !inStock}>
            {saving ? 'Adding…' : 'Add to cart'}
          </Button>
        </div>
        {message && <p className="mt-3 text-sm font-medium text-emerald-700" role="status">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
      </div>
    </article>
  );
};

export default ProductCard;
