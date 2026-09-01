import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import logo from '../../assets/img/nubdexchange_logo.png';
import { getProductById } from '../../services/productService.js';
import { getMyCart, saveCartItems } from '../../services/cartService.js';
import { createReview, deleteReview, getReviews, updateReview } from '../../services/reviewService.js';
import { useAuth } from '../../hooks/useAuth.js';

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

const getSupplierName = (supplier) => {
  if (!supplier) {
    return null;
  }

  if (typeof supplier === 'string') {
    return supplier;
  }

  return supplier.supplierName || null;
};

const getProductImage = (product) => product?.images?.find(Boolean);

function ProductPage() {
  const { id } = useParams();
  const { user, token, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });
  const [editingReviewId, setEditingReviewId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        const response = await getProductById(id);
        const reviewResponse = await getReviews();

        if (isMounted) {
          setProduct(response?.data || null);
          setReviews((reviewResponse?.data || []).filter((review) => {
            const productId = review.product?._id || review.product;
            return productId === id;
          }));
          setError('');
        }
      } catch (apiError) {
        if (isMounted) {
          setError(apiError.message || 'Unable to load product.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setActionError('Please log in before adding items to your cart.');
      return;
    }

    setSubmitting(true);
    setActionError('');
    setActionMessage('');

    try {
      const cart = await getMyCart(token);
      const currentItems = cart?.items || [];
      const existingItem = currentItems.find((item) => (item.product?._id || item.product) === product._id);
      const nextItems = existingItem
        ? currentItems.map((item) => (item.product?._id || item.product) === product._id
          ? { product: product._id, quantity: Number(item.quantity) + 1, price: Number(product.price) }
          : { product: item.product?._id || item.product, quantity: item.quantity, price: item.price })
        : [
          ...currentItems.map((item) => ({ product: item.product?._id || item.product, quantity: item.quantity, price: item.price })),
          { product: product._id, quantity: 1, price: Number(product.price) },
        ];

      await saveCartItems({ token, userId: user.id, cart, items: nextItems });
      setActionMessage('Added to cart.');
    } catch (apiError) {
      setActionError(apiError.message || 'Unable to add item to cart.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetReviewForm = () => {
    setReviewForm({ rating: '5', comment: '' });
    setEditingReviewId('');
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setActionError('Please log in before writing a review.');
      return;
    }

    if (!reviewForm.comment.trim()) {
      setActionError('Review comment is required.');
      return;
    }

    setSubmitting(true);
    setActionError('');
    setActionMessage('');

    try {
      const payload = {
        user: user.id,
        product: product._id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      };
      const response = editingReviewId
        ? await updateReview(editingReviewId, payload, token)
        : await createReview(payload, token);

      setReviews((current) => editingReviewId
        ? current.map((review) => review._id === editingReviewId ? response.data : review)
        : [response.data, ...current]);
      setActionMessage(editingReviewId ? 'Review updated.' : 'Review posted.');
      resetReviewForm();
    } catch (apiError) {
      setActionError(apiError.message || 'Unable to save review.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({ rating: String(review.rating), comment: review.comment });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Delete this review?')) {
      return;
    }

    setSubmitting(true);
    setActionError('');
    setActionMessage('');

    try {
      await deleteReview(reviewId, token);
      setReviews((current) => current.filter((review) => review._id !== reviewId));
      setActionMessage('Review deleted.');
      if (editingReviewId === reviewId) {
        resetReviewForm();
      }
    } catch (apiError) {
      setActionError(apiError.message || 'Unable to delete review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-zinc-900">Loading product...</h1>
          </div>
        </section>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-zinc-900">Product not found</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {error || 'Unable to load product.'}
            </p>
            <Button to="/products" className="mt-6">Back to Products</Button>
          </div>
        </section>
      </div>
    );
  }

  const image = getProductImage(product);
  const supplierName = getSupplierName(product.supplier);

  return (
    <div className="flex w-full flex-col gap-6">
      
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4">
            <Button to="/products">Back to Products</Button>
          </div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {getCategoryName(product.category)}
          </p>
          <h1 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
            {product.productName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <span className="font-bold text-zinc-900">
              {currencyFormatter.format(Number(product.price) || 0)}
            </span>
            <span>Stock: {product.stock ?? 0}</span>
            <span>Status: {product.status || 'available'}</span>
            <span>Condition: {product.condition || 'good'}</span>
          </div>
          {supplierName && (
            <p className="mt-3 text-sm text-zinc-600">Supplier: {supplierName}</p>
          )}
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex aspect-4/3 items-center justify-center overflow-hidden rounded-[1.25rem] border-2 border-zinc-900 bg-zinc-200">
            <img
              src={image || logo}
              alt={product.productName || 'Product'}
              className={image ? 'h-full w-full object-cover' : 'h-24 w-24 rounded-full border-2 border-zinc-900 bg-zinc-50 object-contain'}
            />
          </div>

          <div className="prose prose-sm max-w-none space-y-4 text-zinc-700">
            <p className="whitespace-pre-wrap text-base leading-7 text-zinc-700">
              {product.description || 'No description available.'}
            </p>
          </div>

          <div className="mt-8 border-t-2 border-zinc-900 pt-6">
            <Button variant="primary" className="mr-3" onClick={handleAddToCart} disabled={submitting || Number(product.stock) <= 0}>
              {submitting ? 'Working...' : 'Add to Cart'}
            </Button>
            <Button to="/products">Back to Products</Button>
            {actionMessage && <p className="mt-4 text-sm text-emerald-700">{actionMessage}</p>}
            {actionError && <p className="mt-4 text-sm text-red-700">{actionError}</p>}
          </div>
        </div>
      </section>
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold text-zinc-900">Reviews</h2>
          {reviews.length === 0 && <p className="mt-4 text-sm text-zinc-600">No reviews yet.</p>}
          <div className="mt-5 space-y-4">
            {reviews.map((review) => {
              const ownerId = review.user?._id || review.user;
              const canManage = user?.role === 'Admin' || ownerId === user?.id;

              return (
                <article key={review._id} className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4">
                  <p className="font-semibold text-zinc-900">{review.rating}/5</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{review.comment}</p>
                  <p className="mt-2 text-xs text-zinc-500">{review.user?.name || review.user?.email || 'Reviewer'}</p>
                  {canManage && (
                    <div className="mt-3 flex gap-2">
                      <Button type="button" onClick={() => startEditReview(review)} disabled={submitting}>Edit</Button>
                      <Button type="button" onClick={() => handleDeleteReview(review._id)} disabled={submitting}>Delete</Button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          {isAuthenticated ? (
            <form className="mt-6 space-y-4 border-t-2 border-zinc-900 pt-5" onSubmit={handleReviewSubmit}>
              <select className="w-32 rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm" value={reviewForm.rating} onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
              </select>
              <textarea className="block w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm" rows="4" value={reviewForm.comment} onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Write your review" required />
              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={submitting}>{editingReviewId ? 'Update Review' : 'Post Review'}</Button>
                {editingReviewId && <Button type="button" onClick={resetReviewForm}>Cancel</Button>}
              </div>
            </form>
          ) : (
            <p className="mt-6 text-sm text-zinc-600">Log in to write a review.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductPage;
