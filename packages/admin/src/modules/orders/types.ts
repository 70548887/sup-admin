import type { Order } from '@sup/shared'

export interface OrderDetail extends Order {
  customerName: string
  supplierName: string
  paymentMethod: string
  paidAt: number
  completedAt: number
  remark: string
}

export interface OrderFilter {
  orderSn?: string
  status?: number
  customerId?: number
  supplierId?: number
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}
