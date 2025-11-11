import { apiPatchJson } from "../services/api"

export async function apiGet<T = any>(url: string,params?: any): Promise<T> {
  const res = await fetch(url,{
      
  })
  if (!res.ok) throw new Error(`GET ${url} failed`)
  return res.json()
}

export async function apiPost<T = any>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok || data.success === false) throw new Error(data.message)
  return data
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

// Add these functions to your api.ts file
// Order related API functions
export async function apiGetOrders<T>(params?: any): Promise<{ data: { orders: T[] }, results: number }> {
  return apiGet('/api/v1/orders',params);
}

export async function apiGetOrder<T>(id: string): Promise<{ data: T }> {
  return apiGet(`/api/v1/orders/${id}`);
}

export async function apiUpdateOrderStatus<T>(id: string, status: string): Promise<{ data: T }> {
  return apiPatchJson(`/api/v1/orders/${id}/status`, { status });
}
