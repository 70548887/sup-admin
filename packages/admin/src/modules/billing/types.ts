export interface BillingPlan {
  id: number
  name: string
  description: string
  price: string
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
  amount: string
  status: 'pending' | 'paid' | 'overdue'
  periodStart: string
  periodEnd: string
  paidAt: number
  createdAt: number
}

export interface QuotaUsage {
  planName: string
  ordersUsed: number
  ordersLimit: number
  goodsUsed: number
  goodsLimit: number
}
