import { ref } from 'vue'
import { apiClient } from '@sup/shared'
import type { BillingPlan, Subscription, Invoice, QuotaUsage } from '../types'

export function useBilling() {
  const plans = ref<BillingPlan[]>([])
  const subscriptions = ref<Subscription[]>([])
  const invoices = ref<Invoice[]>([])
  const quota = ref<QuotaUsage | null>(null)
  const loading = ref(false)
  const total = ref(0)

  async function fetchPlans(params?: Record<string, any>) {
    loading.value = true
    try {
      const res = await apiClient.get('/admin/billing/plans', { params }) as any
      plans.value = res?.list || []
      total.value = res?.total || 0
    } finally {
      loading.value = false
    }
  }

  async function fetchSubscriptions(params?: Record<string, any>) {
    loading.value = true
    try {
      const res = await apiClient.get('/admin/billing/subscriptions', { params }) as any
      subscriptions.value = res?.list || []
      total.value = res?.total || 0
    } finally {
      loading.value = false
    }
  }

  async function fetchInvoices(params?: Record<string, any>) {
    loading.value = true
    try {
      const res = await apiClient.get('/admin/billing/invoices', { params }) as any
      invoices.value = res?.list || []
      total.value = res?.total || 0
    } finally {
      loading.value = false
    }
  }

  async function markInvoicePaid(invoiceId: number) {
    await apiClient.post(`/admin/billing/invoices/${invoiceId}/mark-paid`)
  }

  async function createPlan(data: Partial<BillingPlan>) {
    await apiClient.post('/admin/billing/plans', data)
  }

  return {
    plans,
    subscriptions,
    invoices,
    quota,
    loading,
    total,
    fetchPlans,
    fetchSubscriptions,
    fetchInvoices,
    markInvoicePaid,
    createPlan,
  }
}
