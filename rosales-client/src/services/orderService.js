import apiClient from "./apiClient";

export const getOrders = (token) => apiClient.get("/order", { token });

export const getOrderById = (id, token) => apiClient.get(`/order/${id}`, { token });

export const createOrder = (payload, token) => apiClient.post("/order", payload, { token });

export const updateOrder = (id, payload, token) => apiClient.put(`/order/${id}`, payload, { token });

export const deleteOrder = (id, token) => apiClient.delete(`/order/${id}`, { token });
