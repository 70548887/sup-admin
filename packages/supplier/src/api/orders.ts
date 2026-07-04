import { supplierClient } from './client'

export interface SupplierOrder {
  id: number
  orderSn: string
  goodsId: number
  goodsName: string
  customerId: number
  customerName: string
  buyNumber: number
  unitPrice: string
  amount: string
  status: number
  buyParams: Record<string, any>
  remark: string
  createdAt: number
  updatedAt: number
}

export interface OrderPagingParams {
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
 * 订单分页列表
 */
export async function getOrderPaging(params: OrderPagingParams): Promise<PaginatedResult<SupplierOrder>> {
  return supplierClient.post('/openapi/supplier/Order/Paging', params) as any
}

/**
 * 订单详情
 */
export async function getOrderShow(id: number): Promise<SupplierOrder> {
  return supplierClient.post('/openapi/supplier/Order/Show', { id }) as any
}

/**
 * 订单状态处理（确认/发货/完成）
 */
export async function orderStatusHandle(data: {
  id: number
  status: number
  remark?: string
}): Promise<void> {
  return supplierClient.post('/openapi/supplier/Order/StatusHandle', data) as any
}

/**
 * 订单调度处理
 */
export async function orderScheduleHandle(data: {
  id: number
  action: string
}): Promise<void> {
  return supplierClient.post('/openapi/supplier/Order/ScheduleHandle', data) as any
}
