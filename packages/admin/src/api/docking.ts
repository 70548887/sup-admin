import { apiClient } from '@sup/shared'
import type { PaginatedResponse } from '@sup/shared'

export interface DockingTask {
  id: number
  taskType: string
  supplierId: number
  supplierName: string
  orderId: number
  orderSn: string
  errorMessage: string
  retryCount: number
  status: 'failed' | 'retrying' | 'resolved'
  failedAt: number
  lastRetryAt: number
}

export interface DockingStats {
  totalFailed: number
  todayFailed: number
  resolvedToday: number
  avgRetryCount: number
}

export async function getFailedDockingTasks(params?: Record<string, any>): Promise<PaginatedResponse<DockingTask>> {
  return apiClient.get('/admin/docking-tasks/failed', { params }) as unknown as PaginatedResponse<DockingTask>
}

export async function retryDockingTask(taskId: number): Promise<void> {
  return apiClient.post(`/admin/docking-tasks/${taskId}/retry`) as unknown as Promise<void>
}

export async function getDockingStats(): Promise<DockingStats> {
  return apiClient.get('/admin/docking-tasks/stats') as unknown as DockingStats
}
