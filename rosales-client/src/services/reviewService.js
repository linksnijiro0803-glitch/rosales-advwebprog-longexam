import apiClient from "./apiClient";

export const getReviews = () => apiClient.get("/review");

export const getReviewById = (id) => apiClient.get(`/review/${id}`);

export const createReview = (payload, token) => apiClient.post("/review", payload, { token });

export const updateReview = (id, payload, token) => apiClient.put(`/review/${id}`, payload, { token });

export const deleteReview = (id, token) => apiClient.delete(`/review/${id}`, { token });
