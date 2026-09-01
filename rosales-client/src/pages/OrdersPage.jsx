import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getOrders } from "../services/orderService";
import { formatCurrency, getProductName } from "../utils/formatters";

const OrdersPage = () => {
  const { token } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await getOrders(token);
        setOrders(Array.isArray(response?.data) ? response.data : []);
      } catch (apiError) {
        setError(apiError.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token]);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900">Orders</h1>
        {location.state?.message && <p className="mt-3 text-sm text-emerald-700">{location.state.message}</p>}
      </section>
      <section className="space-y-4 border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {loading && <p className="text-sm text-zinc-600">Loading orders...</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {!loading && !error && orders.length === 0 && <p className="text-sm text-zinc-600">No orders yet.</p>}
        {orders.map((order) => (
          <article key={order._id} className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="font-semibold text-zinc-900">Order {order._id}</h2>
              <p className="text-sm text-zinc-600">{order.orderStatus} | {order.paymentStatus}</p>
            </div>
            <div className="mt-3 space-y-1 text-sm text-zinc-600">
              {order.items?.map((item) => (
                <p key={`${order._id}-${item.productName}`}>{item.quantity} x {item.productName || getProductName(item.product)}</p>
              ))}
            </div>
            <p className="mt-3 font-bold text-zinc-900">{formatCurrency(order.totalAmount)}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default OrdersPage;
