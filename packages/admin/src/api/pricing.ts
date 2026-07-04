import { apiClient } from '@sup/shared'
import type { PaginatedResponse } from '@sup/shared'

export interface PricingRule {
  id: number
  name: string
  type: string
  customerGroupId: number
  customerGroupName: string
  adjustType: 'percentage' | 'fixed'
  adjustValue: number
  priority: number
  status: number
  createdAt: number
  updatedAt: number
}

export interface PricingRuleForm {
  name: string
  type: string
  customerGroupId?: number
  adjustType: 'percentage' | 'fixed'
  adjustValue: number
  priority: number
  status: number
}

export interface PricePreview {
  originalPrice: number
  finalPrice: number
  appliedRules: { ruleId: number; ruleName: string; adjustment: number }[]
}

export async function getPricingRules(params: Record<string, any>): Promise<PaginatedResponse<PricingRule>> {
  return apiClient.get('/admin/pricing/rules', { params }) as unknown as PaginatedResponse<PricingRule>
}

export async function createPricingRule(data: PricingRuleForm): Promise<void> {
  return apiClient.post('/admin/pricing/rules', data) as unknown as Promise<void>
}

export async function updatePricingRule(id: number, data: PricingRuleForm): Promise<void> {
  return apiClient.put(`/admin/pricing/rules/${id}`, data) as unknown as Promise<void>
}

export async function deletePricingRule(id: number): Promise<void> {
  return apiClient.delete(`/admin/pricing/rules/${id}`) as unknown as Promise<void>
}

export async function calcPricePreview(data: { goodsId: number; customerId?: number }): Promise<PricePreview> {
  return apiClient.post('/admin/pricing/calc-preview', data) as unknown as PricePreview
}
