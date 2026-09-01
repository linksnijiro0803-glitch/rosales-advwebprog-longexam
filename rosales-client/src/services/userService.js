import apiClient from "./apiClient";

export const getUsers = (token) => apiClient.get("/user", { token });

export const createUser = (payload, token) => apiClient.post("/user", payload, { token });

export const updateUser = (id, payload, token) => apiClient.put(`/user/${id}`, payload, { token });

export const deleteUser = (id, token) => apiClient.delete(`/user/${id}`, { token });
