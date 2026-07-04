import { customerClient } from './client'

export interface CustomerAccount {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  balance: string
  status: number
  appId: string
  createdAt: number
}

/**
 * 获取账户信息
 */
export async function getAccountShow(): Promise<CustomerAccount> {
  return customerClient.get('/openapi/customer/CustomerAccount/Show') as any
}
