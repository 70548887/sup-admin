import { apiClient } from '@sup/shared'
import type { PaginatedResponse } from '@sup/shared'

export interface CustomerGroup {
  id: number
  name: string
  description: string
  memberCount: number
  createdAt: number
}

export interface GroupMember {
  id: number
  customerId: number
  customerName: string
  email: string
  joinedAt: number
}

export async function getCustomerGroups(params?: Record<string, any>): Promise<PaginatedResponse<CustomerGroup>> {
  return apiClient.get('/admin/customer-groups', { params }) as unknown as PaginatedResponse<CustomerGroup>
}

export async function createCustomerGroup(data: { name: string; description: string }): Promise<void> {
  return apiClient.post('/admin/customer-groups', data) as unknown as Promise<void>
}

export async function getGroupMembers(groupId: number, params?: Record<string, any>): Promise<PaginatedResponse<GroupMember>> {
  return apiClient.get(`/admin/customer-groups/${groupId}/members`, { params }) as unknown as PaginatedResponse<GroupMember>
}

export async function addGroupMembers(groupId: number, customerIds: number[]): Promise<void> {
  return apiClient.post(`/admin/customer-groups/${groupId}/members`, { customerIds }) as unknown as Promise<void>
}

export async function removeGroupMember(groupId: number, customerId: number): Promise<void> {
  return apiClient.delete(`/admin/customer-groups/${groupId}/members/${customerId}`) as unknown as Promise<void>
}
