import { ref } from 'vue'
import { apiClient } from '@sup/shared'
import type { Order } from '@sup/shared'
import type { OrderDetail, OrderFilter } from '../types'

export function useOrders() {
  const orders = ref<Order[]>([])
  const orderDetail = ref<OrderDetail | null>(null)
  const loading = ref(false)
  const total = ref(0)

  async function fetchOrders(params?: OrderFilter) {
    loading.value = true
    try {
      const res = await apiClient.get('/admin/orders', { params }) as any
      orders.value = res?.list || []
      total.value = res?.total || 0
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderDetail(id: number) {
    loading.value = true
    try {
      orderDetail.value = await apiClient.get(`/admin/orders/${id}`) as unknown as OrderDetail
    } finally {
      loading.value = false
    }
  }

  async function updateOrderStatus(id: number, status: number) {
    await apiClient.post(`/admin/orders/${id}/status`, { status })
  }

  return {
    orders,
    orderDetail,
    loading,
    total,
    fetchOrders,
    fetchOrderDetail,
    updateOrderStatus,
  }
}
