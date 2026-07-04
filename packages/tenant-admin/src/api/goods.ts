import { apiClient } from '@sup/shared'
import type { PaginatedResponse, Goods } from '@sup/shared'

export async function getTenantGoods(params: Record<string, any>): Promise<PaginatedResponse<Goods>> {
  return apiClient.get('/tenant-admin/goods', { params }) as unknown as PaginatedResponse<Goods>
}

export async function updateGoodsStatus(id: number, status: number): Promise<void> {
  return apiClient.patch(`/tenant-admin/goods/${id}/status`, { status }) as unknown as Promise<void>
}
