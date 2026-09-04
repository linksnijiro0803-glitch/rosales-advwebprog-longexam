import apiClient from "./apiClient";

export const getCarts = (token) => apiClient.get("/cart", { token });

export const getMyCart = async (token) => {
  const response = await getCarts(token);
  return Array.isArray(response?.data) ? response.data[0] || null : null;
};

export const createCart = (payload, token) => apiClient.post("/cart", payload, { token });

export const updateCart = (id, payload, token) => apiClient.put(`/cart/${id}`, payload, { token });

export const deleteCart = (id, token) => apiClient.delete(`/cart/${id}`, { token });

export const saveCartItems = async ({ token, userId, cart, items }) => {
  const normalizedItems = items.map((item) => ({
    product: item.product?._id || item.product,
    quantity: Number(item.quantity),
    price: Number(item.price),
  }));
  const totalAmount = normalizedItems.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const payload = { user: userId, items: normalizedItems, totalAmount };

  return cart?._id ? updateCart(cart._id, payload, token) : createCart(payload, token);
};
