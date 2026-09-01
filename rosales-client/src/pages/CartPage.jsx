import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { getMyCart, saveCartItems } from "../services/cartService";
import { formatCurrency, getId, getProductName } from "../utils/formatters";

const CartPage = () => {
  const { token, user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const items = cart?.items || [];

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCart(await getMyCart(token));
    } catch (apiError) {
      setError(apiError.message || "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const saveItems = async (nextItems) => {
    setSaving(true);
    setError("");
    try {
      const response = await saveCartItems({ token, userId: user.id, cart, items: nextItems });
      setCart(response.data);
    } catch (apiError) {
      setError(apiError.message || "Unable to update cart.");
    } finally {
      setSaving(false);
    }
  };

  const updateQuantity = (item, quantity) => {
    const nextQuantity = Math.max(Number(quantity) || 1, 1);
    saveItems(items.map((current) => getId(current.product) === getId(item.product) ? { ...current, quantity: nextQuantity } : current));
  };

  const removeItem = (item) => {
    if (confirm("Remove this item from your cart?")) {
      saveItems(items.filter((current) => getId(current.product) !== getId(item.product)));
    }
  };

  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900">Cart</h1>
        <p className="mt-3 text-sm text-zinc-600">Review your saved items before checkout.</p>
      </section>
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {loading && <p className="text-sm text-zinc-600">Loading cart...</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {!loading && items.length === 0 && <p className="text-sm text-zinc-600">Your cart is empty.</p>}
        <div className="space-y-4">
          {items.map((item) => (
            <article key={getId(item.product)} className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4">
              <h2 className="text-lg font-semibold text-zinc-900">{getProductName(item.product)}</h2>
              <p className="mt-1 text-sm text-zinc-600">{formatCurrency(item.price)}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input className="w-24 rounded-xl border border-zinc-300 px-3 py-2 text-sm" type="number" min="1" value={item.quantity} disabled={saving} onChange={(event) => updateQuantity(item, event.target.value)} />
                <Button type="button" disabled={saving} onClick={() => removeItem(item)}>Remove</Button>
              </div>
            </article>
          ))}
        </div>
        {items.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t-2 border-zinc-900 pt-5">
            <p className="text-xl font-bold text-zinc-900">Total: {formatCurrency(total)}</p>
            <Button to="/checkout" variant="primary">Checkout</Button>
          </div>
        )}
        <Link className="mt-5 inline-block text-sm font-semibold text-zinc-700" to="/products">Continue shopping</Link>
      </section>
    </div>
  );
};

export default CartPage;
