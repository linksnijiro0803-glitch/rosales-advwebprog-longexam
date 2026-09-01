import apiClient from "./apiClient";

export const getSuppliers = () => apiClient.get("/supplier");

export const getSupplierById = (id) => apiClient.get(`/supplier/${id}`);

export const createSupplier = (payload, token) => apiClient.post("/supplier", payload, { token });

export const updateSupplier = (id, payload, token) => apiClient.put(`/supplier/${id}`, payload, { token });

export const deleteSupplier = (id, token) => apiClient.delete(`/supplier/${id}`, { token });
