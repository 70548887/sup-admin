import { apiClient } from '@sup/shared'
import type { PaginatedResponse } from '@sup/shared'

export interface TenantAdmin {
  id: number
  username: string
  email: string
  role: 'boss' | 'finance' | 'ops' | 'support'
  status: number
  createdAt: number
}

export async function getTenantAdmins(params?: Record<string, any>): Promise<PaginatedResponse<TenantAdmin>> {
  return apiClient.get('/tenant-admin/admins', { params }) as unknown as PaginatedResponse<TenantAdmin>
}

export async function createTenantAdmin(data: { username: string; email: string; password: string; role: string }): Promise<void> {
  return apiClient.post('/tenant-admin/admins', data) as unknown as Promise<void>
}

export async function deleteTenantAdmin(id: number): Promise<void> {
  return apiClient.delete(`/tenant-admin/admins/${id}`) as unknown as Promise<void>
}
