import HmacSHA256 from 'crypto-js/hmac-sha256'
import Hex from 'crypto-js/enc-hex'

const STORAGE_KEY_APP_ID = 'customer_app_id'
const STORAGE_KEY_APP_SECRET = 'customer_app_secret'

/**
 * 保存凭证到 localStorage
 */
export function saveCredentials(appId: string, appSecret: string) {
  localStorage.setItem(STORAGE_KEY_APP_ID, appId)
  localStorage.setItem(STORAGE_KEY_APP_SECRET, appSecret)
}

/**
 * 清除凭证
 */
export function clearCredentials() {
  localStorage.removeItem(STORAGE_KEY_APP_ID)
  localStorage.removeItem(STORAGE_KEY_APP_SECRET)
}

/**
 * 检查是否已登录
 */
export function hasCredentials(): boolean {
  return !!(localStorage.getItem(STORAGE_KEY_APP_ID) && localStorage.getItem(STORAGE_KEY_APP_SECRET))
}

/**
 * 获取已保存的 AppId
 */
export function getAppId(): string {
  return localStorage.getItem(STORAGE_KEY_APP_ID) || ''
}

/**
 * 生成 Legacy 签名请求头
 * 签名算法: HMAC-SHA256(AppSecret, AppId + AppSecret + RequestURI + Timestamp)
 */
export function createLegacyHeaders(requestURI: string): Record<string, string> {
  const appId = localStorage.getItem(STORAGE_KEY_APP_ID) || ''
  const appSecret = localStorage.getItem(STORAGE_KEY_APP_SECRET) || ''

  if (!appId || !appSecret) {
    return {}
  }

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const payload = appId + appSecret + requestURI + timestamp
  const token = HmacSHA256(payload, appSecret).toString(Hex)

  return {
    'X-App-Id': appId,
    'X-App-Timestamp': timestamp,
    'X-App-Token': token,
  }
}
