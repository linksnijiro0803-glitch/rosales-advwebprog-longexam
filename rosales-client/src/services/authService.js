import apiClient from "./apiClient";

export const register = ({ name, email, password }) =>
  apiClient.post("/user/register", { name, email, password });

export const login = ({ email, password }) =>
  apiClient.post("/user/login", { email, password });
