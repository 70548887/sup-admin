import { apiClient } from '@sup/shared'
import type { User, PaginatedResponse } from '@sup/shared'

export interface CreateUserParams {
  username: string
  password: string
  nickname: string
  email: string
  phone: string
  role: string
}

export async function getUserList(params: Record<string, any>): Promise<PaginatedResponse<User>> {
  return apiClient.get('/admin/users', { params }) as unknown as PaginatedResponse<User>
}

export async function createUser(data: CreateUserParams): Promise<void> {
  return apiClient.post('/admin/users', data) as unknown as Promise<void>
}

export async function updateUserStatus(id: number, status: number): Promise<void> {
  return apiClient.patch(`/admin/users/${id}/status`, { status }) as unknown as Promise<void>
}
