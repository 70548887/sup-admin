import { apiClient } from '@sup/shared'
import type { PaginatedResponse } from '@sup/shared'

export interface BillingPlan {
  id: number
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  maxOrders: number
  maxGoods: number
  status: number
  createdAt: number
}

export interface Subscription {
  id: number
  tenantId: number
  tenantName: string
  planId: number
  planName: string
  status: 'active' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
  createdAt: number
}

export interface Invoice {
  id: number
  tenantId: number
  tenantName: string
  amount: number
  status: 'pending' | 'paid' | 'overdue'
  periodStart: string
  periodEnd: string
  paidAt: number
  createdAt: number
}

export async function getBillingPlans(params?: Record<string, any>): Promise<PaginatedResponse<BillingPlan>> {
  return apiClient.get('/admin/billing/plans', { params }) as unknown as PaginatedResponse<BillingPlan>
}

export async function createBillingPlan(data: Partial<BillingPlan>): Promise<void> {
  return apiClient.post('/admin/billing/plans', data) as unknown as Promise<void>
}

export async function getSubscriptions(params?: Record<string, any>): Promise<PaginatedResponse<Subscription>> {
  return apiClient.get('/admin/billing/subscriptions', { params }) as unknown as PaginatedResponse<Subscription>
}

export async function getInvoices(params?: Record<string, any>): Promise<PaginatedResponse<Invoice>> {
  return apiClient.get('/admin/billing/invoices', { params }) as unknown as PaginatedResponse<Invoice>
}

export async function markInvoicePaid(invoiceId: number): Promise<void> {
  return apiClient.post(`/admin/billing/invoices/${invoiceId}/mark-paid`) as unknown as Promise<void>
}

export async function generateInvoices(data: { tenantId?: number; period: string }): Promise<{ count: number }> {
  return apiClient.post('/admin/billing/invoices/generate', data) as unknown as { count: number }
}
