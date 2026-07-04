/**
 * Unix时间戳转UTC+8日期时间字符串
 */
export function formatDateTime(timestamp: number): string {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  const offset = 8 * 60 // UTC+8
  const utc8 = new Date(date.getTime() + offset * 60 * 1000)
  const year = utc8.getUTCFullYear()
  const month = String(utc8.getUTCMonth() + 1).padStart(2, '0')
  const day = String(utc8.getUTCDate()).padStart(2, '0')
  const hours = String(utc8.getUTCHours()).padStart(2, '0')
  const minutes = String(utc8.getUTCMinutes()).padStart(2, '0')
  const seconds = String(utc8.getUTCSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 金额格式化（保留2位小数）
 */
export function formatDecimal(amount: string | number): string {
  if (amount === null || amount === undefined || amount === '') return '0.00'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0.00'
  return num.toFixed(2)
}

/**
 * 状态码转文字
 */
export function formatStatus(status: number, map: Record<number, string>): string {
  return map[status] || '未知'
}
