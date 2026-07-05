import { customerClient } from './client'

export interface CapitalFlow {
  id: number
  /** 1: 收入, 2: 支出 */
  type: number
  amount: string
  balance: string
  remark: string
  createdAt: number
}

export interface CapitalFlowListParams {
  page: number
  size: number
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

/**
 * 资金流水列表
 */
export async function getCapitalFlowList(params: CapitalFlowListParams): Promise<PaginatedResult<CapitalFlow>> {
  return customerClient.post('/openapi/customer/CapitalFlow/Paging', params) as any
}
