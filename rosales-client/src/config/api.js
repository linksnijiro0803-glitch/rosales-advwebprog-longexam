const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

const normalizeBaseUrl = (url) => url.replace(/\/+$/, "");

const getApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof envBaseUrl === "string" && envBaseUrl.trim()) {
    return normalizeBaseUrl(envBaseUrl.trim());
  }

  return DEFAULT_API_BASE_URL;
};

export const API_BASE_URL = getApiBaseUrl();

export const buildApiUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
};

export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, item);
        }
      });

      return;
    }

    searchParams.set(key, value);
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
};

export const withQuery = (path, params) => `${path}${buildQueryString(params)}`;
