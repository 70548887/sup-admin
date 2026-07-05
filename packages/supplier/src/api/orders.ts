import { supplierClient } from './client'

/** 供货商端订单状态映射（与 sup-platform 后端状态保持一致） */
export const SUPPLIER_ORDER_STATUS: Record<number, string> = {
  1: '已支付',
  2: '待处理',
  3: '处理中',
  4: '补单中',
  5: '退单中',
  6: '已完成',
  7: '已退单',
  8: '已退款',
  9: '有异常',
}

/** 筛选栏常用的状态选项（value 为后端真实状态码） */
export const SUPPLIER_ORDER_STATUS_FILTER = [
  { label: '全部', value: undefined as number | undefined },
  { label: '已支付', value: 1 },
  { label: '处理中', value: 3 },
  { label: '已完成', value: 6 },
  { label: '已退款', value: 8 },
]

/** 共享组件 OrderTimeline 使用的状态映射（将后端状态近似转换为共享状态） */
export function mapSupplierStatusToShared(status: number): number {
  const map: Record<number, number> = {
    1: 1, // 已支付
    2: 0, // 待处理 -> 待支付
    3: 2, // 处理中
    4: 2, // 补单中 -> 处理中
    5: 4, // 退单中 -> 已取消
    6: 3, // 已完成
    7: 4, // 已退单 -> 已取消
    8: 5, // 已退款
    9: 4, // 有异常 -> 已取消
  }
  return map[status] ?? status
}

/** 卡密项 */
export interface OrderCardItem {
  content: string
  password?: string
}

/** 状态变更记录 */
export interface OrderStatusChangeItem {
  status: number
  timestamp: number
  operator: string
  note: string
}

export interface SupplierOrder {
  orderSn: string
  goodsSn: string
  goodsName: string
  customerSn: string
  customerName: string
  buyNumber: number
  unitPrice: string
  amount: string
  refundAmount: string
  status: number
  buyParams: Record<string, string>
  remark: string
  callbackStartNum: number
  callbackCurrentNum: number
  paidAt: number
  createdAt: number
  updatedAt: number
}

export interface SupplierOrderDetail extends SupplierOrder {
  statusChanges?: OrderStatusChangeItem[]
  cards?: OrderCardItem[]
}

export interface OrderPagingParams {
  page: number
  size: number
  orderSn?: string
  customerName?: string
  status?: number
  startTime?: number
  endTime?: number
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
  return supplierClient.post('/openapi/supplier/Order/Paging', {
    page: params.page,
    pageSize: params.size,
    order_sn: params.orderSn,
    status: params.status,
  }) as any
}

/**
 * 订单详情
 */
export async function getOrderShow(orderSn: string): Promise<SupplierOrderDetail> {
  return supplierClient.post('/openapi/supplier/Order/Show', { order_sn: orderSn }) as any
}

/**
 * 将共享状态转换为后端状态
 */
function mapSharedStatusToSupplier(status: number): number {
  const map: Record<number, number> = {
    1: 1, // 已支付
    2: 3, // 处理中
    3: 6, // 已完成
    5: 8, // 已退款
  }
  return map[status] ?? status
}

/**
 * 订单状态处理（确认/发货/完成/退款）
 */
export async function orderStatusHandle(data: {
  orderSn: string
  status: number
  remark?: string
}): Promise<void> {
  return supplierClient.post('/openapi/supplier/Order/StatusHandle', {
    order_sn: data.orderSn,
    status: mapSharedStatusToSupplier(data.status),
  }) as any
}

/**
 * 订单进度调度处理
 */
export async function orderScheduleHandle(data: {
  orderSn: string
  callbackStartNum: number
  callbackCurrentNum: number
}): Promise<void> {
  return supplierClient.post('/openapi/supplier/Order/ScheduleHandle', {
    order_sn: data.orderSn,
    callback_start_num: data.callbackStartNum,
    callback_current_num: data.callbackCurrentNum,
  }) as any
}
