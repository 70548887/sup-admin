import { apiClient } from '@sup/shared'
import type { PaginatedResponse } from '@sup/shared'

export interface ReconciliationTask {
  id: number
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  totalRecords: number
  matchedRecords: number
  errorRecords: number
  startedAt: number
  completedAt: number
  createdAt: number
}

export interface ReconciliationError {
  id: number
  taskId: number
  orderId: number
  orderSn: string
  errorType: string
  description: string
  status: 'pending' | 'resolved' | 'ignored'
  resolvedAt: number
}

export async function runReconciliation(data: { type: string; startDate: string; endDate: string }): Promise<{ taskId: number }> {
  return apiClient.post('/admin/reconciliation/run', data) as unknown as { taskId: number }
}

export async function getReconciliationTasks(params?: Record<string, any>): Promise<PaginatedResponse<ReconciliationTask>> {
  return apiClient.get('/admin/reconciliation/tasks', { params }) as unknown as PaginatedResponse<ReconciliationTask>
}

export async function getReconciliationTaskDetail(taskId: number): Promise<ReconciliationTask & { errors: ReconciliationError[] }> {
  return apiClient.get(`/admin/reconciliation/tasks/${taskId}`) as unknown as ReconciliationTask & { errors: ReconciliationError[] }
}

export async function resolveReconciliationError(errorId: number, data: { action: 'resolve' | 'ignore'; remark?: string }): Promise<void> {
  return apiClient.patch(`/admin/reconciliation/errors/${errorId}`, data) as unknown as Promise<void>
}
