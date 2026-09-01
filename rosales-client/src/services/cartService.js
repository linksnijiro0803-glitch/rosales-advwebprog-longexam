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
  const totalAmount = items.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const payload = { user: userId, items, totalAmount };

  return cart?._id ? updateCart(cart._id, payload, token) : createCart(payload, token);
};
