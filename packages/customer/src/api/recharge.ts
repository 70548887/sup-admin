import { customerClient } from './client'

export interface RechargeRecord {
  id: number
  amount: string
  paymentMethod: string
  proof: string
  status: number
  remark: string
  createdAt: number
  updatedAt: number
}

export interface RechargeListParams {
  page: number
  size: number
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

export interface CreateRechargeData {
  amount: number
  paymentMethod: string
  remark: string
  proof: string
}

export interface CreateRechargeResult {
  id: number
}

/**
 * 提交充值申请
 */
export async function createRecharge(data: CreateRechargeData): Promise<CreateRechargeResult> {
  return customerClient.post('/openapi/customer/Recharge/Create', data) as any
}

/**
 * 充值记录列表
 */
export async function getRechargeList(params: RechargeListParams): Promise<PaginatedResult<RechargeRecord>> {
  return customerClient.post('/openapi/customer/Recharge/Paging', params) as any
}
