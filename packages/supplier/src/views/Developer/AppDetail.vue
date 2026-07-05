<template>
  <div class="app-detail">
    <div v-loading="loading">
      <!-- 顶部信息 -->
      <PageHeader :title="detail.name || '应用详情'">
        <template #actions>
          <el-tag :type="detail.status === 'active' ? 'success' : 'info'" style="margin-right: 12px">
            {{ detail.status === 'active' ? '已启用' : '已禁用' }}
          </el-tag>
          <el-button @click="editDialogVisible = true">编辑</el-button>
          <el-button type="danger" @click="handleDelete">删除</el-button>
        </template>
      </PageHeader>

      <!-- Tabs -->
      <el-tabs v-model="activeTab">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="1" border style="max-width: 600px">
            <el-descriptions-item label="应用名称">{{ detail.name }}</el-descriptions-item>
            <el-descriptions-item label="AppId">
              <code>{{ detail.app_id }}</code>
              <CopyButton v-if="detail.app_id" :value="detail.app_id" style="margin-left: 8px" />
            </el-descriptions-item>
            <el-descriptions-item label="环境">
              <el-tag :type="detail.environment === 'production' ? 'danger' : 'warning'" size="small">
                {{ detail.environment === 'production' ? '生产' : '沙盒' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detail.created_at }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{ detail.description || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 密钥管理 -->
        <el-tab-pane label="密钥管理" name="secret">
          <div style="max-width: 600px">
            <CredentialRow label="AppId" :value="detail.app_id || ''" />
            <div class="secret-row">
              <span class="secret-row__label">AppSecret</span>
              <span class="secret-row__value">已隐藏</span>
              <el-button type="warning" size="small" @click="handleRotate">轮换密钥</el-button>
            </div>

            <!-- 轮换后展示新密钥 -->
            <div v-if="showNewSecret" style="margin-top: 20px">
              <SecretReveal :app-id="detail.app_id" :app-secret="newSecret" @done="showNewSecret = false" />
            </div>
          </div>
        </el-tab-pane>

        <!-- 调用统计 -->
        <el-tab-pane label="调用统计" name="stats">
          <el-row :gutter="16" style="max-width: 600px">
            <el-col :span="8">
              <el-statistic title="今日调用次数" :value="detail.today_calls ?? 0" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="本月调用次数" :value="detail.month_calls ?? 0" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="最后调用时间">
                <template #default>
                  <span style="font-size: 14px">{{ detail.last_used_at || '暂无' }}</span>
                </template>
              </el-statistic>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑应用" width="460px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="应用名称">
          <el-input v-model="editForm.name" maxlength="50" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { supplierClient } from '@/api/client'
import { PageHeader, CopyButton, CredentialRow, SecretReveal } from '@sup/shared'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const activeTab = ref('info')

const detail = ref<any>({})
const showNewSecret = ref(false)
const newSecret = ref('')

const editDialogVisible = ref(false)
const saving = ref(false)
const editForm = reactive({ name: '', description: '' })

async function fetchDetail() {
  const appId = route.query.app_id as string
  if (!appId) {
    ElMessage.error('缺少应用ID')
    router.push('/developer')
    return
  }
  loading.value = true
  try {
    const res: any = await supplierClient.get('/openapi/supplier/App/Detail', {
      params: { app_id: appId },
    })
    detail.value = res
    editForm.name = res.name
    editForm.description = res.description || ''
  } catch (e: any) {
    ElMessage.error(e.message || '获取详情失败')
  } finally {
    loading.value = false
  }
}

async function handleRotate() {
  try {
    await ElMessageBox.confirm('轮换后旧密钥将立即失效，确认轮换？', '轮换密钥', { type: 'warning' })
    const res: any = await supplierClient.post('/openapi/supplier/App/RotateSecret', {
      app_id: detail.value.app_id,
    })
    newSecret.value = res.app_secret
    showNewSecret.value = true
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

async function handleSave() {
  saving.value = true
  try {
    await supplierClient.post('/openapi/supplier/App/Update', {
      app_id: detail.value.app_id,
      name: editForm.name,
      description: editForm.description,
    })
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    fetchDetail()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm(`确认删除应用「${detail.value.name}」？此操作不可恢复。`, '删除应用', {
      type: 'warning',
    })
    await supplierClient.post('/openapi/supplier/App/Delete', { app_id: detail.value.app_id })
    ElMessage.success('已删除')
    router.push('/developer')
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '删除失败')
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.app-detail {
  padding: 4px;
}
.secret-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}
.secret-row__label {
  min-width: 80px;
  color: #606266;
  font-weight: 500;
}
.secret-row__value {
  flex: 1;
  color: #909399;
  font-style: italic;
}
</style>
