import apiClient from "./apiClient";

export const getCategories = () => apiClient.get("/category");

export const getCategoryById = (id) => apiClient.get(`/category/${id}`);

export const createCategory = (payload, token) => apiClient.post("/category", payload, { token });

export const updateCategory = (id, payload, token) => apiClient.put(`/category/${id}`, payload, { token });

export const deleteCategory = (id, token) => apiClient.delete(`/category/${id}`, { token });
