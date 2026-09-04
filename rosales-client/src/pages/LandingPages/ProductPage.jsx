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
      <div className="page-shell page-section"><div className="state-panel" role="status">Loading product…</div></div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-shell page-section">
        <section className="panel mx-auto max-w-2xl p-8 text-center">
            <h1 className="text-3xl font-black text-slate-950">Product not found</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {error || 'Unable to load product.'}
            </p>
            <Button to="/products" className="mt-6">Back to Products</Button>
        </section>
      </div>
    );
  }

  const image = getProductImage(product);
  const supplierName = getSupplierName(product.supplier);

  const inStock = Number(product.stock) > 0 && product.status !== 'sold' && product.status !== 'inactive';

  return (
    <div className="page-shell page-section">
      <Button to="/products" className="mb-6">← Back to Products</Button>

      <section className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="panel sticky top-24 flex aspect-4/3 items-center justify-center overflow-hidden bg-slate-100">
            <img
              src={image || logo}
              alt={product.productName || 'Product'}
              className={image ? 'h-full w-full object-cover' : 'h-28 w-28 rounded-full bg-white object-contain p-2 shadow-sm'}
            />
        </div>

        <div>
          <p className="eyebrow">{getCategoryName(product.category)}</p>
          <h1 className="page-title mt-3">{product.productName}</h1>
          <p className="mt-5 text-3xl font-black text-blue-950">{currencyFormatter.format(Number(product.price) || 0)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>{inStock ? 'Available' : 'Unavailable'}</span>
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold capitalize text-amber-900">{product.condition || 'good'} condition</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">{product.stock ?? 0} in stock</span>
          </div>
          <div className="mt-7 border-y border-slate-200 py-6">
            <h2 className="font-extrabold text-slate-950">About this item</h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-600">{product.description || 'No description available.'}</p>
            {supplierName && <p className="mt-4 text-sm text-slate-500"><span className="font-bold text-slate-700">Supplier:</span> {supplierName}</p>}
          </div>
          <Button variant="primary" className="mt-6 w-full sm:w-auto" onClick={handleAddToCart} disabled={submitting || !inStock}>
            {submitting ? 'Working…' : inStock ? 'Add to Cart' : 'Unavailable'}
          </Button>
          {actionMessage && <p className="alert-success mt-4" role="status">{actionMessage}</p>}
          {actionError && <p className="alert-error mt-4" role="alert">{actionError}</p>}
        </div>
      </section>

      <section className="mt-14 border-t border-slate-200 pt-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-black text-slate-950">Reviews <span className="text-slate-400">({reviews.length})</span></h2>
          {reviews.length === 0 && <p className="state-panel mt-5">No reviews yet. Be the first to share your experience.</p>}
          <div className="mt-5 space-y-4">
            {reviews.map((review) => {
              const ownerId = review.user?._id || review.user;
              const canManage = user?.role === 'Admin' || ownerId === user?.id;

              return (
                <article key={review._id} className="panel p-5">
                  <p className="font-bold text-amber-700" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}<span className="text-slate-300">{'★'.repeat(5 - review.rating)}</span></p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">{review.user?.name || review.user?.email || 'Reviewer'}</p>
                  {canManage && (
                    <div className="mt-3 flex gap-2">
                      <Button type="button" onClick={() => startEditReview(review)} disabled={submitting}>Edit</Button>
                      <Button type="button" variant="danger" onClick={() => handleDeleteReview(review._id)} disabled={submitting}>Delete</Button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          {isAuthenticated ? (
            <form className="panel mt-8 space-y-4 p-5 sm:p-6" onSubmit={handleReviewSubmit}>
              <h3 className="text-lg font-extrabold text-slate-950">{editingReviewId ? 'Edit your review' : 'Write a review'}</h3>
              <label htmlFor="review-rating" className="block text-sm font-bold text-slate-700">Rating</label>
              <select id="review-rating" className="field !mt-0 w-full sm:w-40" value={reviewForm.rating} onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
              </select>
              <label htmlFor="review-comment" className="block text-sm font-bold text-slate-700">Comment</label>
              <textarea id="review-comment" className="field !mt-0 block" rows="4" value={reviewForm.comment} onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Share your experience" required />
              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={submitting}>{editingReviewId ? 'Update Review' : 'Post Review'}</Button>
                {editingReviewId && <Button type="button" onClick={resetReviewForm}>Cancel</Button>}
              </div>
            </form>
          ) : (
            <p className="mt-6 text-sm text-slate-600">Log in to write a review.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductPage;
