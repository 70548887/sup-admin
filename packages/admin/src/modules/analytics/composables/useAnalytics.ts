import { ref } from 'vue'
import { apiClient } from '@sup/shared'
import type { DashboardStats, TrendPoint, HotGoodsItem } from '../types'

export function useAnalytics() {
  const dashboard = ref<DashboardStats | null>(null)
  const trend = ref<TrendPoint[]>([])
  const hotGoods = ref<HotGoodsItem[]>([])
  const loading = ref(false)

  async function fetchDashboard() {
    loading.value = true
    try {
      dashboard.value = await apiClient.get('/admin/analytics/dashboard') as unknown as DashboardStats
    } finally {
      loading.value = false
    }
  }

  async function fetchTrend(days = 7) {
    const res = await apiClient.get('/admin/analytics/trend', { params: { days } }) as unknown as TrendPoint[]
    trend.value = res || []
  }

  async function fetchHotGoods(limit = 10) {
    const res = await apiClient.get('/admin/analytics/hot-goods', { params: { limit } }) as unknown as HotGoodsItem[]
    hotGoods.value = res || []
  }

  return { dashboard, trend, hotGoods, loading, fetchDashboard, fetchTrend, fetchHotGoods }
}
