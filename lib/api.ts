// API Client för backend-koppling
// Hanterar alla API-anrop med autentisering och felhantering

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: data?.message || `API error: ${response.status}`,
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

// === PRODUKTER ===
export interface Product {
  id: string;
  name: string;
  currentPrice: number;
  suggestedPrice?: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  source: string;
  createdAt: string;
}

export async function getProducts(): Promise<ApiResponse<Product[]>> {
  return apiRequest<Product[]>('/products');
}

export async function updateProductPrice(
  productId: string,
  price: number
): Promise<ApiResponse<Product>> {
  return apiRequest<Product>(`/products/${productId}/price`, {
    method: 'PATCH',
    body: JSON.stringify({ price }),
  });
}

export async function approvePrice(productId: string): Promise<ApiResponse<Product>> {
  return apiRequest<Product>(`/products/${productId}/approve`, {
    method: 'POST',
  });
}

// === ANVÄNDARE & ADMIN ===
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  credits: number;
  createdAt: string;
}

export async function getUsers(): Promise<ApiResponse<User[]>> {
  return apiRequest<User[]>('/admin/users');
}

export async function updateUserRole(
  userId: string,
  role: 'admin' | 'user'
): Promise<ApiResponse<User>> {
  return apiRequest<User>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

// === AKTIVITETSLOGG ===
export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export async function getActivityLog(
  filter?: string
): Promise<ApiResponse<ActivityLogEntry[]>> {
  const params = filter ? `?filter=${encodeURIComponent(filter)}` : '';
  return apiRequest<ActivityLogEntry[]>(`/activity${params}`);
}

// === ANALYTICS ===
export interface AnalyticsData {
  visitors: number;
  conversions: number;
  revenueImpact: number;
  topProducts: Array<{
    name: string;
    priceChange: number;
    impact: string;
  }>;
}

export async function getAnalytics(
  period: 'day' | 'week' | 'month' = 'week'
): Promise<ApiResponse<AnalyticsData>> {
  return apiRequest<AnalyticsData>(`/analytics?period=${period}`);
}

// === INTEGRATIONER ===
export interface Integration {
  id: string;
  platform: string;
  status: 'connected' | 'disconnected';
  lastSync?: string;
}

export async function getIntegrations(): Promise<ApiResponse<Integration[]>> {
  return apiRequest<Integration[]>('/integrations');
}

export async function connectIntegration(
  platform: string,
  credentials: Record<string, string>
): Promise<ApiResponse<Integration>> {
  return apiRequest<Integration>('/integrations/connect', {
    method: 'POST',
    body: JSON.stringify({ platform, credentials }),
  });
}

export async function disconnectIntegration(
  integrationId: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/integrations/${integrationId}`, {
    method: 'DELETE',
  });
}

export async function syncIntegration(
  integrationId: string
): Promise<ApiResponse<{ productsImported: number }>> {
  return apiRequest<{ productsImported: number }>(
    `/integrations/${integrationId}/sync`,
    { method: 'POST' }
  );
}

// === API-NYCKLAR ===
export interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
}

export async function getApiKeys(): Promise<ApiResponse<ApiKey[]>> {
  return apiRequest<ApiKey[]>('/api-keys');
}

export async function createApiKey(name: string): Promise<ApiResponse<ApiKey>> {
  return apiRequest<ApiKey>('/api-keys', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function revokeApiKey(keyId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api-keys/${keyId}`, {
    method: 'DELETE',
  });
}

// === STRIPE / BETALNINGAR ===
export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export async function createCheckoutSession(
  plan: string,
  credits: number
): Promise<ApiResponse<CheckoutSession>> {
  return apiRequest<CheckoutSession>('/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan, credits }),
  });
}

export async function getBillingHistory(): Promise<
  ApiResponse<Array<{ id: string; amount: number; date: string; status: string }>>
> {
  return apiRequest('/billing/history');
}

// === AI PRISSÄTTNING ===
export interface PriceSuggestion {
  productId: string;
  currentPrice: number;
  suggestedPrice: number;
  confidence: number;
  reasoning: string;
}

export async function generatePriceSuggestion(
  productId: string
): Promise<ApiResponse<PriceSuggestion>> {
  return apiRequest<PriceSuggestion>('/ai/price-suggestion', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}

export async function bulkGeneratePrices(
  productIds: string[]
): Promise<ApiResponse<PriceSuggestion[]>> {
  return apiRequest<PriceSuggestion[]>('/ai/bulk-price-suggestions', {
    method: 'POST',
    body: JSON.stringify({ productIds }),
  });
}
