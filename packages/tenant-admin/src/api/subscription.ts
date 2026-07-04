import { apiClient } from '@sup/shared'

export interface SubscriptionInfo {
  planName: string
  status: 'active' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
  maxOrders: number
  maxGoods: number
}

export interface UsageInfo {
  ordersUsed: number
  ordersLimit: number
  goodsUsed: number
  goodsLimit: number
  storageUsedMB: number
  storageLimitMB: number
}

export interface UpgradePlan {
  id: number
  name: string
  price: number
  billingCycle: string
  features: string[]
}

export async function getSubscription(): Promise<SubscriptionInfo> {
  return apiClient.get('/tenant-admin/subscription') as unknown as SubscriptionInfo
}

export async function getUsage(): Promise<UsageInfo> {
  return apiClient.get('/tenant-admin/usage') as unknown as UsageInfo
}

export async function upgradeSubscription(planId: number): Promise<void> {
  return apiClient.post('/tenant-admin/subscription/upgrade', { planId }) as unknown as Promise<void>
}

export async function getAvailablePlans(): Promise<UpgradePlan[]> {
  return apiClient.get('/tenant-admin/subscription/plans') as unknown as UpgradePlan[]
}
