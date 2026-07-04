// 订单状态映射
export const ORDER_STATUS: Record<number, string> = {
  0: '待支付',
  1: '已支付',
  2: '处理中',
  3: '已完成',
  4: '已取消',
  5: '已退款',
  6: '部分退款',
}

// 商品状态映射
export const GOODS_STATUS: Record<number, string> = {
  0: '下架',
  1: '上架',
  2: '售罄',
}

// 角色定义
export const USER_ROLES: Record<string, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  supplier: '供应商',
  customer: '客户',
}
