import axios from 'axios';

const API_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const isAdmin = localStorage.getItem('userType') === 'admin';
        const reissueEndpoint = isAdmin ? '/api/admin/auth/reissue' : '/api/auth/reissue';
        
        const response = await axios.post(`${API_BASE_URL}${reissueEndpoint}`, {}, {
          withCredentials: true,
        });

        const newAccessToken = response.headers['authorization']?.replace('Bearer ', '') 
          || response.data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  signup: (data: { email: string; password: string; nickname: string; phone: string }) =>
    api.post('/api/auth/signup', data),
  logout: () => api.post('/api/auth/logout'),
  reissue: () => api.post('/api/auth/reissue'),
};

// Admin Auth API
export const adminAuthApi = {
  login: (email: string, password: string) =>
    api.post('/api/admin/auth/login', { email, password }),
  signup: (data: { email: string; password: string; nickname: string; phone: string; adminRole: string }) =>
    api.post('/api/admin/auth/signup', data),
  logout: () => api.post('/api/admin/auth/logout'),
  reissue: () => api.post('/api/admin/auth/reissue'),
};

// User API
export const userApi = {
  getMe: () => api.get('/api/users/me'),
  updateMe: (data: { nickname?: string; phone?: string }) =>
    api.patch('/api/users/me', data),
  deleteMe: () => api.delete('/api/users/me'),
};

// Products API
export const productsApi = {
  getAll: (params?: { brandId?: string; page?: number; size?: number }) =>
    api.get('/api/products', { params }),
  getById: (id: string) => api.get(`/api/products/${id}`),
  getOptions: (productId: string) => api.get(`/api/products/${productId}/options`),
};

// Brands API
export const brandsApi = {
  getAll: () => api.get('/api/brands'),
};

// Selling Bids API
export const sellingBidsApi = {
  create: (data: { productOptionId: string; price: number }) =>
    api.post('/api/bids/selling', data),
  getMine: (params?: { page?: number; size?: number }) =>
    api.get('/api/bids/selling/me', { params }),
};

// Orders API
export const ordersApi = {
  create: (data: { sellingBidId: string; address: string; addressDetail: string; zipCode: string; receiverName: string; receiverPhone: string }) =>
    api.post('/api/orders', data),
  getMine: (params?: { page?: number; size?: number }) =>
    api.get('/api/orders', { params }),
  getById: (id: string) => api.get(`/api/orders/${id}`),
  registerTracking: (orderId: string, trackingNumber: string) =>
    api.patch(`/api/orders/${orderId}/tracking`, { trackingNumber }),
};

// Reviews API
export const reviewsApi = {
  getByProduct: (productId: string, params?: { page?: number; size?: number }) =>
    api.get('/api/reviews', { params: { productId, ...params } }),
  create: (data: { orderId: string; rating: number; content: string }) =>
    api.post('/api/reviews', data),
  update: (reviewId: string, data: { rating: number; content: string }) =>
    api.patch(`/api/reviews/${reviewId}`, data),
  delete: (reviewId: string) => api.delete(`/api/reviews/${reviewId}`),
};

// Wishlist API
export const wishlistApi = {
  getAll: () => api.get('/api/v1/wishlist'),
  add: (productId: string) => api.post('/api/v1/wishlist', { productId }),
  remove: (productId: string) => api.delete(`/api/v1/wishlist/${productId}`),
};

// Admin APIs
export const adminBrandsApi = {
  getAll: () => api.get('/api/admin/brands'),
  create: (data: { name: string; logoUrl: string }) =>
    api.post('/api/admin/brands', data),
  update: (brandId: string, data: { name: string; logoUrl: string }) =>
    api.patch(`/api/admin/brands/${brandId}`, data),
  delete: (brandId: string) => api.delete(`/api/admin/brands/${brandId}`),
};

export const adminProductsApi = {
  getAll: (params?: { brandId?: string; page?: number; size?: number }) =>
    api.get('/api/admin/products', { params }),
  create: (data: { brandId: string; name: string; modelNumber: string; category: string; imageUrl: string }) =>
    api.post('/api/admin/products', data),
  update: (productId: string, data: Partial<{ name: string; modelNumber: string; category: string; imageUrl: string }>) =>
    api.patch(`/api/admin/products/${productId}`, data),
  delete: (productId: string) => api.delete(`/api/admin/products/${productId}`),
  createOption: (productId: string, data: { option: string }) =>
    api.post(`/api/admin/products/${productId}/options`, data),
  deleteOption: (productId: string, optionId: string) =>
    api.delete(`/api/admin/products/${productId}/options/${optionId}`),
};

export const adminStaffApi = {
  getMe: () => api.get('/api/admin/staff/me'),
  getAll: (params?: { page: number; size: number }) =>
    api.get('/api/admin/staff', { params }),
  getManagers: (params?: { page: number; size: number }) =>
    api.get('/api/admin/staff/managers', { params }),
  getInspectors: (params?: { page: number; size: number }) =>
    api.get('/api/admin/staff/inspectors', { params }),
  create: (data: { email: string; password: string; nickname: string; phone: string; adminRole: string }) =>
    api.post('/api/admin/auth/signup', data),
  update: (staffId: string, data: { nickname: string; phone: string }) =>
    api.patch(`/api/admin/staff/${staffId}`, data),
  updateMe: (data: { nickname: string; phone: string }) =>
    api.patch('/api/admin/staff/me', data),
  delete: (staffId: string) => api.delete(`/api/admin/staff/${staffId}`),
};

export const adminOrdersApi = {
  getAll: (params?: { status?: string; page?: number; size?: number }) =>
    api.get('/api/admin/orders', { params }),
  getById: (orderId: string) => api.get(`/api/admin/orders/${orderId}`),
  updateStatus: (orderId: string, status: string) =>
    api.patch(`/api/orders/${orderId}/status`, { status }),
};

export const adminUsersApi = {
  getAll: (params?: { page?: number; size?: number }) =>
    api.get('/api/admin/users', { params }),
  getById: (userId: string) => api.get(`/api/admin/users/${userId}`),
  update: (userId: number, data: { nickname: string; phone: string }) =>
    api.patch(`/api/admin/users/${userId}`, data),
  delete: (userId: number) => api.delete(`/api/admin/users/${userId}`),
};

export const productRequestsApi = {
  create: (data: { name: string; brandName: string }) => api.post('/api/products/requests', data),
};

export const adminProductRequestsApi = {
  getAll: (params?: { page?: number; size?: number }) =>
    api.get('/api/admin/product-requests', { params }),
  updateStatus: (id: string, status: 'APPROVED' | 'REJECTED') =>
    api.patch(`/api/admin/product-requests/${id}/status`, { status }),
};
