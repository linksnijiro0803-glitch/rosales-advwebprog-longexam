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

const ProductCard = ({ product, index }) => {
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

  return (
    <article className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4">
      <div className="flex aspect-4/3 items-center justify-center overflow-hidden rounded-[1.25rem] bg-zinc-200">
        <img
          src={image || logo}
          alt={product.productName || 'Product'}
          className={image ? 'h-full w-full object-cover' : 'h-16 w-16 rounded-full border-2 border-zinc-900 bg-zinc-50 object-contain'}
        />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {getCategoryName(product.category)} {String(index + 1).padStart(2, '0')}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-zinc-900">{product.productName}</h3>
      <p className="mt-2 text-base font-bold text-zinc-900">
        {currencyFormatter.format(Number(product.price) || 0)}
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        Stock: {product.stock ?? 0} | {product.status || 'available'}
      </p>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        {description.length > 120 ? `${description.substring(0, 120)}...` : description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button to={`/products/${productId}`}>View Product</Button>
        <Button type="button" variant="primary" onClick={handleAddToCart} disabled={saving || Number(product.stock) <= 0}>
          {saving ? 'Adding...' : 'Add'}
        </Button>
      </div>
      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </article>
  );
};

export default ProductCard;
