import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { getMyCart, saveCartItems } from "../services/cartService";
import { createOrder } from "../services/orderService";
import { formatCurrency, getId, getProductName } from "../utils/formatters";

const inputClasses = "mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [cart, setCart] = useState(null);
  const [formData, setFormData] = useState({
    receiverName: user?.name || "",
    contactNumber: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    postalCode: "",
    paymentMethod: "cash-on-delivery",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  useEffect(() => {
    const loadCart = async () => {
      try {
        setCart(await getMyCart(token));
      } catch (apiError) {
        setError(apiError.message || "Unable to load cart.");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createOrder({
        user: user.id,
        items: items.map((item) => ({
          product: getId(item.product),
          productName: getProductName(item.product),
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
        shippingAddress: {
          receiverName: formData.receiverName.trim(),
          contactNumber: formData.contactNumber.trim(),
          street: formData.street.trim(),
          barangay: formData.barangay.trim(),
          city: formData.city.trim(),
          province: formData.province.trim(),
          postalCode: formData.postalCode.trim(),
        },
        paymentMethod: formData.paymentMethod,
        totalAmount: total,
      }, token);

      if (cart) {
        await saveCartItems({ token, userId: user.id, cart, items: [] });
      }

      navigate("/orders", { replace: true, state: { message: "Order created successfully." } });
    } catch (apiError) {
      setError(apiError.message || "Unable to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900">Checkout</h1>
        <p className="mt-3 text-sm text-zinc-600">No payment gateway is used; orders store the selected payment method.</p>
      </section>
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {loading && <p className="text-sm text-zinc-600">Loading checkout...</p>}
        {!loading && items.length === 0 && <p className="text-sm text-zinc-600">Your cart is empty.</p>}
        {!loading && items.length > 0 && (
          <form className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" onSubmit={handleSubmit}>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={getId(item.product)} className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4 text-sm">
                  <p className="font-semibold text-zinc-900">{getProductName(item.product)}</p>
                  <p className="mt-1 text-zinc-600">{item.quantity} x {formatCurrency(item.price)}</p>
                </div>
              ))}
              <p className="text-xl font-bold text-zinc-900">Total: {formatCurrency(total)}</p>
            </div>
            <div className="space-y-4">
              {["receiverName", "contactNumber", "street", "barangay", "city", "province", "postalCode"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium capitalize text-zinc-700" htmlFor={field}>{field.replace(/([A-Z])/g, " $1")}</label>
                  <input id={field} name={field} value={formData[field]} onChange={handleChange} className={inputClasses} required />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-zinc-700" htmlFor="paymentMethod">Payment Method</label>
                <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className={inputClasses}>
                  <option value="cash-on-delivery">Cash on Delivery</option>
                  <option value="gcash">GCash</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>
              </div>
              {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "Placing..." : "Place Order"}</Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default CheckoutPage;
