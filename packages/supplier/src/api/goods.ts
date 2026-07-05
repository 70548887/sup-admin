import { supplierClient } from './client'

/** 商品列表项（分页返回的精简结构） */
export interface SupplierGoodsListItem {
  id: number
  serial_number: string
  name: string
  price: string
  stock: number
  status: number
}

/** 购买参数 */
export interface BuyParam {
  key: string
  label: string
  required: boolean
  placeholder: string
  type?: string
}

/** 商品详情（完整结构） */
export interface SupplierGoods {
  id: number
  serial_number: string
  name: string
  price: string
  stock: number
  status: number
  buy_min: number
  buy_max: number
  buy_base: number
  is_close: boolean
  is_repeat: boolean
  buy_params: BuyParam[]
  image_urls: string[]
  description: string
}

/** 分页查询参数 */
export interface GoodsPagingParams {
  page: number
  pageSize: number
  name?: string
  serial_number?: string
  status?: number
}

/** 分页结果 */
export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 商品编辑参数 */
export interface GoodsEditParams {
  goods_sn: string
  price?: string
  buy_min?: number
  buy_max?: number
  is_close?: boolean
  is_repeat?: boolean
}

/**
 * 商品分页列表
 * POST /openapi/supplier/Goods/Paging
 */
export async function getGoodsPaging(params: GoodsPagingParams): Promise<PaginatedResult<SupplierGoodsListItem>> {
  return supplierClient.post('/openapi/supplier/Goods/Paging', params) as any
}

/**
 * 商品详情
 * POST /openapi/supplier/Goods/Show
 */
export async function getGoodsShow(goodsSn: string): Promise<SupplierGoods> {
  return supplierClient.post('/openapi/supplier/Goods/Show', { goods_sn: goodsSn }) as any
}

/**
 * 编辑商品信息
 * POST /openapi/supplier/Goods/Edit
 */
export async function editGoods(data: GoodsEditParams): Promise<void> {
  return supplierClient.post('/openapi/supplier/Goods/Edit', data) as any
}

/**
 * 编辑商品价格
 * POST /openapi/supplier/Goods/EditPrice
 */
export async function editGoodsPrice(data: {
  goods_sn: string
  price: string
}): Promise<void> {
  return supplierClient.post('/openapi/supplier/Goods/EditPrice', data) as any
}

/**
 * 创建商品
 * POST /openapi/supplier/Goods/Create
 * 注意：后端待实现，前端预留接口
 */
export async function createGoods(data: {
  name: string
  price: string
  stock: number
  status: number
  description?: string
  buy_params?: BuyParam[]
}): Promise<void> {
  return supplierClient.post('/openapi/supplier/Goods/Create', data) as any
}
