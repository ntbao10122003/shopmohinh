// API Configuration
export const API_BASE = (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE}/api/v1/products`,
  POSTS: `${API_BASE}/api/v1/posts`,
  GALLERY: `${API_BASE}/api/v1/gallery`,
  CART: `${API_BASE}/api/v1/cart`,
};
