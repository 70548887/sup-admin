import { customerClient } from './client'

export interface Category {
  id: number
  name: string
  parentId: number
  sort: number
  children?: Category[]
}

export interface CustomerGoods {
  id: number
  name: string
  serialNumber: string
  categoryId: number
  categoryName: string
  price: string
  stock: number
  status: number
  description: string
  buyParams: BuyParam[]
  salesCount: number
}

export interface BuyParam {
  name: string
  key: string
  type: string
  required: boolean
  placeholder?: string
  options?: string[]
}

export interface GoodsListParams {
  page: number
  size: number
  categoryId?: number
  name?: string
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

/**
 * 获取商品分类列表
 */
export async function getCategoryList(): Promise<Category[]> {
  return customerClient.get('/openapi/customer/Goods/CategoryList') as any
}

/**
 * 商品列表
 */
export async function getGoodsList(params: GoodsListParams): Promise<PaginatedResult<CustomerGoods>> {
  return customerClient.post('/openapi/customer/Goods/List', params) as any
}

/**
 * 商品详情
 */
export async function getGoodsShow(id: number): Promise<CustomerGoods> {
  return customerClient.post('/openapi/customer/Goods/Show', { id }) as any
}

/**
 * 购买商品
 */
export async function buyGoods(data: {
  goodsId: number
  buyNumber: number
  buyParams?: Record<string, any>
}): Promise<{ orderId: number; orderSn: string }> {
  return customerClient.post('/openapi/customer/Goods/Buy', data) as any
}
