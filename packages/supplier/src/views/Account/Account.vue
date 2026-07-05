<template>
  <div class="account-page">
    <h2>账户信息</h2>

    <el-row :gutter="20">
      <!-- 基本信息 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>基本信息</template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ profile.username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag>{{ profile.role || '供货商' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ profile.createdAt || '-' }}</el-descriptions-item>
          </el-descriptions>
          <div style="margin-top: 16px;">
            <el-button type="primary" @click="showChangePassword = true">修改密码</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 钱包余额 -->
      <el-col :span="12">
        <el-card shadow="hover" class="wallet-card">
          <template #header>钱包余额</template>
          <div class="wallet-balance">¥{{ formatDecimal(wallet.balance) }}</div>
          <div class="wallet-sub">可用余额</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- API凭证管理 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>API 凭证管理</template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="AppId">
          <div class="credential-row">
            <code>{{ appId }}</code>
            <el-button type="primary" link @click="copyText(appId)">复制</el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="AppSecret">
          <div class="credential-row">
            <code>{{ secretVisible ? appSecret : maskedSecret }}</code>
            <el-button type="primary" link @click="secretVisible = !secretVisible">
              {{ secretVisible ? '隐藏' : '显示' }}
            </el-button>
            <el-button type="primary" link @click="copyText(appSecret)">复制</el-button>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 签名说明 -->
      <el-collapse style="margin-top: 16px;">
        <el-collapse-item title="签名算法说明" name="sign">
          <div class="sign-doc">
            <p>所有 API 请求需携带以下请求头：</p>
            <ul>
              <li><code>X-App-Id</code>：您的 AppId</li>
              <li><code>X-App-Timestamp</code>：当前 Unix 时间戳（秒）</li>
              <li><code>X-App-Token</code>：签名值</li>
            </ul>
            <p><strong>签名算法：</strong></p>
            <pre>HMAC-SHA256(AppSecret, AppId + AppSecret + RequestURI + Timestamp)</pre>
            <p>其中 <code>RequestURI</code> 为请求路径（不含域名），<code>Timestamp</code> 为秒级时间戳。</p>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showChangePassword" title="修改密码" width="420px" destroy-on-close>
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="旧密码">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePassword = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDecimal } from '@sup/shared'
import { getAppId } from '@/api/legacyAuth'
import { supplierClient } from '@/api/client'

/** 基本信息 */
const profile = ref({
  username: '',
  role: '供货商',
  createdAt: '',
})

/** 钱包 */
const wallet = ref({ balance: '0.00' })

/** API凭证 */
const appId = ref('')
const appSecret = ref('')
const secretVisible = ref(false)

const maskedSecret = computed(() => {
  const s = appSecret.value
  if (!s || s.length < 8) return '****'
  return s.substring(0, 4) + '****' + s.substring(s.length - 4)
})

/** 修改密码 */
const showChangePassword = ref(false)
const passwordLoading = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

/** 复制文本 */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

/** 修改密码 */
async function handleChangePassword() {
  const { oldPassword, newPassword, confirmPassword } = passwordForm.value
  if (!oldPassword || !newPassword) {
    ElMessage.warning('请填写完整')
    return
  }
  if (newPassword !== confirmPassword) {
    ElMessage.error('两次密码不一致')
    return
  }
  passwordLoading.value = true
  try {
    await supplierClient.post('/openapi/supplier/ChangePassword', {
      old_password: oldPassword,
      new_password: newPassword,
    })
    ElMessage.success('密码修改成功')
    showChangePassword.value = false
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (e: any) {
    ElMessage.error(e.message || '修改失败')
  } finally {
    passwordLoading.value = false
  }
}

onMounted(async () => {
  appId.value = getAppId()
  // AppSecret 不在前端明文存储，从接口获取脱敏版本
  try {
    const data: any = await supplierClient.post('/openapi/supplier/Profile', {})
    if (data) {
      profile.value.username = data.username || data.app_id || appId.value
      profile.value.createdAt = data.created_at || '-'
      appSecret.value = data.app_secret || ''
      wallet.value.balance = data.balance || '0.00'
    }
  } catch (e: any) {
    console.error('加载账户信息失败:', e.message)
  }
})
</script>

<style scoped>
.account-page {
  padding: 20px;
}

.wallet-card .wallet-balance {
  font-size: 36px;
  font-weight: bold;
  color: #67c23a;
  text-align: center;
  margin: 16px 0 8px;
}

.wallet-card .wallet-sub {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.credential-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.credential-row code {
  font-family: monospace;
  font-size: 14px;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.sign-doc {
  line-height: 1.8;
  color: #606266;
}

.sign-doc pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  overflow-x: auto;
}

.sign-doc code {
  background: #f0f2f5;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 13px;
}
</style>
