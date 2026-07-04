import { apiClient } from '@sup/shared'
import type { PaginatedResponse } from '@sup/shared'

export interface AuditLog {
  id: number
  tenantId: number
  userId: number
  username: string
  action: string
  resource: string
  resourceId: number
  detail: string
  ip: string
  createdAt: number
}

export const AUDIT_ACTIONS: Record<string, string> = {
  login: '登录',
  logout: '登出',
  create: '创建',
  update: '更新',
  delete: '删除',
  approve: '审批通过',
  reject: '审批拒绝',
}

export async function getAuditList(params: Record<string, any>): Promise<PaginatedResponse<AuditLog>> {
  return apiClient.get('/admin/audit', { params }) as unknown as PaginatedResponse<AuditLog>
}
