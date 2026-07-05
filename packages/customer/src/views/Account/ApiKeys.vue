<template>
  <div class="api-keys-page">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>API 密钥管理</span>
          <el-button type="primary" :loading="regenerating" @click="handleRegenerate">
            重新生成密钥
          </el-button>
        </div>
      </template>

      <el-alert
        title="请妥善保管 App Secret，不要泄露给他人。重新生成后，旧密钥将立即失效。"
        type="warning"
        :closable="false"
        style="margin-bottom: 16px;"
      />

      <el-descriptions :column="1" border>
        <el-descriptions-item label="App ID">
          <div class="credential-row">
            <span class="credential-text">{{ account?.appId || '-' }}</span>
            <el-button type="primary" size="small" link :disabled="!account?.appId" @click="copyText(account!.appId)">
              复制
            </el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="App Secret">
          <div class="credential-row">
            <span class="credential-text secret-text">{{ displaySecret }}</span>
            <el-button type="primary" size="small" link @click="toggleSecret">
              {{ secretMasked ? '显示' : '隐藏' }}
            </el-button>
            <el-button type="primary" size="small" link :disabled="!appSecret" @click="copyText(appSecret)">
              复制
            </el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ account?.createdAt ? formatDateTime(account.createdAt) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 签名说明 -->
    <el-card class="signature-card">
      <template #header>
        <span>签名说明</span>
      </template>

      <el-collapse v-model="activeCollapse">
        <el-collapse-item title="签名算法" name="algorithm">
          <p>所有 OpenAPI 请求均需在请求头中携带以下签名信息：</p>
          <ul>
            <li><code>X-App-Id</code>：App ID</li>
            <li><code>X-App-Timestamp</code>：当前 Unix 时间戳（秒）</li>
            <li><code>X-App-Token</code>：签名 Token</li>
          </ul>
          <p>签名 Token 生成规则：</p>
          <pre class="code-block">Token = HMAC-SHA256(AppSecret, AppId + AppSecret + RequestURI + Timestamp)</pre>
          <p>其中 <code>RequestURI</code> 为请求路径（例如 <code>/openapi/customer/Order/Paging</code>）。</p>
        </el-collapse-item>
        <el-collapse-item title="请求示例" name="example">
          <pre class="code-block">
const appId = 'your_app_id'
const appSecret = 'your_app_secret'
const requestURI = '/openapi/customer/Order/Paging'
const timestamp = Math.floor(Date.now() / 1000).toString()
const payload = appId + appSecret + requestURI + timestamp
const token = CryptoJS.HmacSHA256(payload, appSecret).toString(CryptoJS.enc.Hex)

headers: {
  'X-App-Id': appId,
  'X-App-Timestamp': timestamp,
  'X-App-Token': token,
}
          </pre>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime } from '@sup/shared'
import { getAccountShow, regenerateAppSecret, type CustomerAccount } from '@/api/account'
import { getAppId, getAppSecret, saveCredentials } from '@/api/legacyAuth'

const loading = ref(false)
const regenerating = ref(false)
const account = ref<CustomerAccount | null>(null)
const appSecret = ref('')
const secretMasked = ref(true)
const activeCollapse = ref(['algorithm'])

const displaySecret = computed(() => {
  if (!appSecret.value) return '-'
  return secretMasked.value ? '••••••••••••••••' : appSecret.value
})

async function fetchData() {
  loading.value = true
  try {
    account.value = await getAccountShow()
    appSecret.value = getAppSecret()
  } catch (error: any) {
    ElMessage.error(error.message || '获取账户信息失败')
  } finally {
    loading.value = false
  }
}

function toggleSecret() {
  if (!appSecret.value) return
  secretMasked.value = !secretMasked.value
}

async function copyText(text: string) {
  if (!text) {
    ElMessage.warning('内容为空，无法复制')
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

async function handleRegenerate() {
  try {
    await ElMessageBox.confirm(
      '重新生成后旧密钥将立即失效，是否继续？',
      '确认重新生成',
      { type: 'warning' }
    )
  } catch {
    return
  }

  regenerating.value = true
  try {
    const res = await regenerateAppSecret()
    saveCredentials(res.appId, res.appSecret)
    account.value = await getAccountShow()
    appSecret.value = res.appSecret
    secretMasked.value = true
    ElMessage.success('密钥已重新生成')
  } catch (error: any) {
    ElMessage.error(error.message || '重新生成密钥失败')
  } finally {
    regenerating.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.api-keys-page {
  padding: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.credential-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.credential-text {
  font-family: 'Courier New', Courier, monospace;
  flex: 1;
  word-break: break-all;
}
.secret-text {
  letter-spacing: 1px;
}
.signature-card {
  margin-top: 16px;
}
.code-block {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
ul {
  padding-left: 20px;
  line-height: 1.8;
}
code {
  padding: 2px 6px;
  background: #f5f7fa;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}
</style>
