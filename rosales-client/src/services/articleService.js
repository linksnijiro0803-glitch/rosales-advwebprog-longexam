import apiClient from "./apiClient";

export const getArticles = () => apiClient.get("/articles");

export const getArticleBySlug = (slug) => apiClient.get(`/articles/${slug}`);

export const createArticle = (payload, token) => apiClient.post("/articles", payload, { token });

export const updateArticle = (id, payload, token) => apiClient.put(`/articles/${id}`, payload, { token });

export const deleteArticle = (id, token) => apiClient.delete(`/articles/${id}`, { token });
