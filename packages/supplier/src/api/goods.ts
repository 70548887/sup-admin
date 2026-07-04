import { supplierClient } from './client'

export interface SupplierGoods {
  id: number
  name: string
  serialNumber: string
  categoryId: number
  categoryName: string
  price: string
  costPrice: string
  stock: number
  status: number
  salesCount: number
  description: string
  buyParams: any[]
  createdAt: number
  updatedAt: number
}

export interface GoodsPagingParams {
  page: number
  size: number
  name?: string
  status?: number
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

/**
 * 商品分页列表
 */
export async function getGoodsPaging(params: GoodsPagingParams): Promise<PaginatedResult<SupplierGoods>> {
  return supplierClient.post('/openapi/supplier/Goods/Paging', params) as any
}

/**
 * 商品详情
 */
export async function getGoodsShow(id: number): Promise<SupplierGoods> {
  return supplierClient.post('/openapi/supplier/Goods/Show', { id }) as any
}

/**
 * 编辑商品信息
 */
export async function editGoods(data: {
  id: number
  name?: string
  description?: string
  status?: number
  stock?: number
}): Promise<void> {
  return supplierClient.post('/openapi/supplier/Goods/Edit', data) as any
}

/**
 * 编辑商品价格
 */
export async function editGoodsPrice(data: {
  id: number
  price: string
  costPrice?: string
}): Promise<void> {
  return supplierClient.post('/openapi/supplier/Goods/EditPrice', data) as any
}
