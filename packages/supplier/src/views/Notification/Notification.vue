<template>
  <div class="notification-page">
    <h2>通知设置</h2>

    <el-row :gutter="20">
      <!-- Webhook 配置 -->
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>Webhook 配置</template>
          <el-form :model="webhookForm" label-width="100px" label-position="top">
            <el-form-item label="通知 URL">
              <el-input
                v-model="webhookForm.url"
                placeholder="https://your-domain.com/webhook"
                clearable
              >
                <template #prepend>https://</template>
              </el-input>
            </el-form-item>

            <el-form-item label="通知事件">
              <el-checkbox-group v-model="webhookForm.events">
                <el-checkbox label="order.created">订单创建</el-checkbox>
                <el-checkbox label="order.completed">订单完成</el-checkbox>
                <el-checkbox label="order.refund">退款通知</el-checkbox>
                <el-checkbox label="stock.alert">库存告警</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="签名密钥">
              <div class="sign-key-row">
                <code>{{ signKeyVisible ? webhookForm.signKey : maskedSignKey }}</code>
                <el-button type="primary" link @click="signKeyVisible = !signKeyVisible">
                  {{ signKeyVisible ? '隐藏' : '显示' }}
                </el-button>
                <el-button type="primary" link @click="copyText(webhookForm.signKey)">复制</el-button>
              </div>
              <div class="form-tip">Webhook 请求将携带此密钥用于验签，请妥善保管。</div>
            </el-form-item>

            <el-form-item>
              <el-space>
                <el-button type="primary" :loading="saving" @click="handleSave">保存配置</el-button>
                <el-button :loading="testing" @click="handleTest">测试发送</el-button>
              </el-space>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 通知记录 -->
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近投递记录</span>
              <el-button type="primary" link @click="fetchLogs">刷新</el-button>
            </div>
          </template>
          <el-table :data="notifyLogs" v-loading="logsLoading" stripe size="small" style="width: 100%;">
            <el-table-column label="时间" width="160">
              <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column prop="event" label="事件" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ eventLabelMap[row.event] || row.event }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                  {{ row.success ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="statusCode" label="响应码" width="80" align="center" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDateTime } from '@sup/shared'
import { supplierClient } from '@/api/client'

/** 事件标签映射 */
const eventLabelMap: Record<string, string> = {
  'order.created': '订单创建',
  'order.completed': '订单完成',
  'order.refund': '退款通知',
  'stock.alert': '库存告警',
}

/** Webhook 配置表单 */
const webhookForm = reactive({
  url: '',
  events: [] as string[],
  signKey: '',
})
const signKeyVisible = ref(false)
const saving = ref(false)
const testing = ref(false)

const maskedSignKey = computed(() => {
  const key = webhookForm.signKey
  if (!key || key.length < 8) return '****'
  return key.substring(0, 4) + '****' + key.substring(key.length - 4)
})

/** 通知记录 */
interface NotifyLog {
  id: number
  event: string
  success: boolean
  statusCode: number
  createdAt: number
}

const notifyLogs = ref<NotifyLog[]>([])
const logsLoading = ref(false)

/** 复制文本 */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

/** 加载 Webhook 配置 */
async function fetchConfig() {
  try {
    const data: any = await supplierClient.post('/openapi/supplier/Webhook/Config', {})
    if (data) {
      webhookForm.url = data.url || ''
      webhookForm.events = data.events || []
      webhookForm.signKey = data.signKey || data.sign_key || ''
    }
  } catch (e: any) {
    console.error('加载 Webhook 配置失败:', e.message)
  }
}

/** 加载通知记录 */
async function fetchLogs() {
  logsLoading.value = true
  try {
    const data: any = await supplierClient.post('/openapi/supplier/Webhook/Logs', { limit: 20 })
    notifyLogs.value = data?.list || data || []
  } catch (e: any) {
    console.error('加载通知记录失败:', e.message)
    notifyLogs.value = []
  } finally {
    logsLoading.value = false
  }
}

/** 保存配置 */
async function handleSave() {
  if (!webhookForm.url) {
    ElMessage.warning('请填写通知 URL')
    return
  }
  saving.value = true
  try {
    await supplierClient.post('/openapi/supplier/Webhook/Save', {
      url: webhookForm.url,
      events: webhookForm.events,
    })
    ElMessage.success('保存成功')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

/** 测试发送 */
async function handleTest() {
  if (!webhookForm.url) {
    ElMessage.warning('请先填写通知 URL')
    return
  }
  testing.value = true
  try {
    await supplierClient.post('/openapi/supplier/Webhook/Test', {
      url: webhookForm.url,
    })
    ElMessage.success('测试通知已发送，请检查目标服务器日志')
    // 刷新记录
    setTimeout(fetchLogs, 1000)
  } catch (e: any) {
    ElMessage.error(e.message || '测试发送失败')
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  fetchConfig()
  fetchLogs()
})
</script>

<style scoped>
.notification-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sign-key-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sign-key-row code {
  font-family: monospace;
  font-size: 14px;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
