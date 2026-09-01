import { withQuery } from "../config/api";
import apiClient from "./apiClient";

export const getProducts = (params = {}) => apiClient.get(withQuery("/product", params));

export const getProductById = (id) => apiClient.get(`/product/${id}`);

export const createProduct = (payload, token) => apiClient.post("/product", payload, { token });

export const updateProduct = (id, payload, token) => apiClient.put(`/product/${id}`, payload, { token });

export const deleteProduct = (id, token) => apiClient.delete(`/product/${id}`, { token });
