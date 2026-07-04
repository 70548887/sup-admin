import { customerClient } from './client'

export interface CustomerOrder {
  id: number
  orderSn: string
  goodsId: number
  goodsName: string
  buyNumber: number
  unitPrice: string
  amount: string
  status: number
  buyParams: Record<string, any>
  remark: string
  createdAt: number
  updatedAt: number
}

export interface OrderListParams {
  page: number
  size: number
  orderSn?: string
  status?: number
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

/**
 * 订单列表
 */
export async function getOrderList(params: OrderListParams): Promise<PaginatedResult<CustomerOrder>> {
  return customerClient.post('/openapi/customer/Order/Paging', params) as any
}

/**
 * 订单详情
 */
export async function getOrderShow(id: number): Promise<CustomerOrder> {
  return customerClient.post('/openapi/customer/Order/Show', { id }) as any
}

/**
 * 订单状态处理
 */
export async function orderStatusHandle(data: {
  id: number
  status: number
  remark?: string
}): Promise<void> {
  return customerClient.post('/openapi/customer/Order/StatusHandle', data) as any
}
