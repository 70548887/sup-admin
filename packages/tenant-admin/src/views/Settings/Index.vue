<template>
  <div class="page-container">
    <h2>租户设置</h2>

    <el-tabs v-model="activeTab" style="margin-top: 16px;">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="info">
        <el-card shadow="never">
          <el-form
            ref="infoFormRef"
            :model="infoForm"
            :rules="infoRules"
            label-width="120px"
            style="max-width: 600px;"
          >
            <el-form-item label="租户名称" prop="name">
              <el-input v-model="infoForm.name" placeholder="请输入租户名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="联系人" prop="contactName">
              <el-input v-model="infoForm.contactName" placeholder="请输入联系人" />
            </el-form-item>
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="infoForm.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="联系邮箱" prop="contactEmail">
              <el-input v-model="infoForm.contactEmail" placeholder="请输入联系邮箱" />
            </el-form-item>
            <el-form-item label="Logo">
              <el-upload
                class="logo-uploader"
                :show-file-list="false"
                action="#"
                :auto-upload="false"
                @change="handleLogoChange"
              >
                <el-image
                  v-if="infoForm.logoUrl"
                  :src="infoForm.logoUrl"
                  style="width: 100px; height: 100px;"
                  fit="contain"
                />
                <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveInfo" :loading="saving">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 功能开关 -->
      <el-tab-pane label="功能开关" name="features">
        <el-card shadow="never">
          <el-table :data="features" border stripe>
            <el-table-column prop="label" label="功能名称" min-width="200" />
            <el-table-column prop="description" label="说明" min-width="300" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-switch
                  v-model="row.enabled"
                  @change="handleFeatureToggle(row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- API配额 -->
      <el-tab-pane label="API配额" name="quota">
        <el-card shadow="never">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="日请求限额">{{ quota.dailyLimit }} 次/天</el-descriptions-item>
            <el-descriptions-item label="今日已使用">{{ quota.dailyUsed }} 次</el-descriptions-item>
            <el-descriptions-item label="月请求限额">{{ quota.monthlyLimit }} 次/月</el-descriptions-item>
            <el-descriptions-item label="本月已使用">{{ quota.monthlyUsed }} 次</el-descriptions-item>
            <el-descriptions-item label="并发限制">{{ quota.concurrency }} 并发</el-descriptions-item>
            <el-descriptions-item label="套餐等级">{{ quota.planName || '-' }}</el-descriptions-item>
          </el-descriptions>

          <div style="margin-top: 20px;">
            <h4>使用趋势（近7天）</h4>
            <el-progress
              v-for="day in quota.recentDays"
              :key="day.date"
              :text-inside="true"
              :stroke-width="20"
              :percentage="Math.min(Math.round((day.count / quota.dailyLimit) * 100), 100)"
              :color="day.count > quota.dailyLimit * 0.8 ? '#f56c6c' : '#409eff'"
              style="margin-bottom: 8px;"
            >
              <span>{{ day.date }}: {{ day.count }}</span>
            </el-progress>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { apiClient } from '@sup/shared'

const activeTab = ref('info')
const saving = ref(false)
const infoFormRef = ref<FormInstance>()

// 基本信息
const infoForm = reactive({
  name: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  logoUrl: '',
})

const infoRules: FormRules = {
  name: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
  contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactEmail: [{ type: 'email', message: '请输入有效邮箱', trigger: 'blur' }],
}

// 功能开关
const features = ref<{ key: string; label: string; description: string; enabled: boolean }[]>([])

// API配额
const quota = reactive({
  dailyLimit: 0,
  dailyUsed: 0,
  monthlyLimit: 0,
  monthlyUsed: 0,
  concurrency: 0,
  planName: '',
  recentDays: [] as { date: string; count: number }[],
})

function handleLogoChange(file: UploadFile) {
  if (file.raw) {
    infoForm.logoUrl = URL.createObjectURL(file.raw)
  }
}

async function fetchSettings() {
  try {
    const data = await apiClient.get('/tenant/settings') as any
    Object.assign(infoForm, {
      name: data.name || '',
      contactName: data.contactName || '',
      contactPhone: data.contactPhone || '',
      contactEmail: data.contactEmail || '',
      logoUrl: data.logoUrl || '',
    })
  } catch (e: any) {
    ElMessage.error(e.message || '获取设置失败')
  }
}

async function fetchFeatures() {
  try {
    const data = await apiClient.get('/tenant/features') as any
    features.value = data || []
  } catch (_) { /* ignore */ }
}

async function fetchQuota() {
  try {
    const data = await apiClient.get('/tenant/quota') as any
    Object.assign(quota, data)
  } catch (_) { /* ignore */ }
}

async function handleSaveInfo() {
  const valid = await infoFormRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    await apiClient.put('/tenant/settings', {
      name: infoForm.name,
      contactName: infoForm.contactName,
      contactPhone: infoForm.contactPhone,
      contactEmail: infoForm.contactEmail,
      logoUrl: infoForm.logoUrl,
    })
    ElMessage.success('保存成功')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleFeatureToggle(row: { key: string; enabled: boolean }) {
  try {
    await apiClient.put(`/tenant/features/${row.key}`, { enabled: row.enabled })
    ElMessage.success('更新成功')
  } catch (e: any) {
    row.enabled = !row.enabled
    ElMessage.error(e.message || '更新失败')
  }
}

onMounted(() => {
  fetchSettings()
  fetchFeatures()
  fetchQuota()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.logo-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.logo-uploader:hover {
  border-color: #409eff;
}
.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>
