import { apiClient } from '@sup/shared'
import type { PaginatedResponse } from '@sup/shared'

export interface ApiApp {
  id: number
  appName: string
  appKey: string
  tenantId: number
  tenantName: string
  rateLimit: number
  dailyQuota: number
  status: number
  createdAt: number
}

export interface ApiUsage {
  appId: number
  date: string
  requestCount: number
  errorCount: number
  avgLatencyMs: number
}

export async function getApiApps(params?: Record<string, any>): Promise<PaginatedResponse<ApiApp>> {
  return apiClient.get('/admin/api-apps', { params }) as unknown as PaginatedResponse<ApiApp>
}

export async function updateRateLimit(appId: number, data: { rateLimit: number; dailyQuota: number }): Promise<void> {
  return apiClient.patch(`/admin/api-apps/${appId}/rate-limit`, data) as unknown as Promise<void>
}

export async function getApiUsage(appId: number, params?: { startDate?: string; endDate?: string }): Promise<ApiUsage[]> {
  return apiClient.get(`/admin/api-apps/${appId}/usage`, { params }) as unknown as ApiUsage[]
}
