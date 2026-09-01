import { buildApiUrl } from "../config/api";

export class ApiError extends Error {
  constructor(message, { status = null, statusText = "", payload = null, url = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.payload = payload;
    this.url = url;
  }
}

const getErrorMessage = (payload, fallback) => {
  if (payload?.message) {
    return payload.message;
  }

  if (payload?.errors?.length) {
    return payload.errors.map((error) => error.message).join(", ");
  }

  return fallback;
};

const parseResponseBody = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const isJsonBody = (body) =>
  body !== undefined &&
  body !== null &&
  !(body instanceof FormData) &&
  !(body instanceof URLSearchParams) &&
  !(body instanceof Blob);

const createRequestOptions = (method, body, options) => {
  const { token, headers: customHeaders = {}, ...fetchOptions } = options;
  const headers = new Headers(customHeaders);
  const hasJsonBody = isJsonBody(body);

  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return {
    method,
    headers,
    ...(body !== undefined && {
      body: hasJsonBody && typeof body !== "string" ? JSON.stringify(body) : body,
    }),
    ...fetchOptions,
  };
};

const request = async (path, { method = "GET", body, ...options } = {}) => {
  const url = buildApiUrl(path);

  try {
    const response = await fetch(url, createRequestOptions(method, body, options));
    const payload = await parseResponseBody(response);

    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(payload, response.statusText || "Request failed."),
        {
          status: response.status,
          statusText: response.statusText,
          payload,
          url,
        }
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Unable to connect to the server.", {
      status: null,
      statusText: "Network Error",
      payload: null,
      url,
    });
  }
};

const apiClient = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options = {}) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options = {}) => request(path, { ...options, method: "DELETE" }),
};

export default apiClient;
