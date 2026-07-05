<template>
  <div class="page-container">
    <h2>系统设置</h2>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-tabs v-model="activeTab">
        <!-- 基础配置 -->
        <el-tab-pane label="基础配置" name="basic">
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            label-width="120px"
            style="max-width: 600px;"
          >
            <el-form-item label="站点名称" prop="siteName">
              <el-input v-model="basicForm.siteName" placeholder="请输入站点名称" />
            </el-form-item>
            <el-form-item label="站点描述">
              <el-input v-model="basicForm.siteDesc" type="textarea" :rows="3" placeholder="请输入站点描述" />
            </el-form-item>
            <el-form-item label="Logo URL">
              <el-input v-model="basicForm.logoUrl" placeholder="请输入Logo图片地址" />
            </el-form-item>
            <el-form-item label="维护模式">
              <el-switch
                v-model="basicForm.maintenanceMode"
                active-text="开启"
                inactive-text="关闭"
              />
              <span style="margin-left: 8px; color: #E6A23C; font-size: 12px;">
                开启后前台用户将无法访问
              </span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSave('basic')">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form
            ref="securityFormRef"
            :model="securityForm"
            label-width="140px"
            style="max-width: 600px;"
          >
            <el-form-item label="API限流(次/分钟)">
              <el-input-number v-model="securityForm.rateLimitPerMin" :min="1" :max="10000" :step="10" />
            </el-form-item>
            <el-form-item label="IP黑名单">
              <el-input
                v-model="securityForm.ipBlacklist"
                type="textarea"
                :rows="5"
                placeholder="每行一个IP地址"
              />
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-input-number v-model="securityForm.loginFailLock" :min="0" :max="20" />
              <span style="margin-left: 8px; color: #909399; font-size: 12px;">次后锁定，0为不锁定</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSave('security')">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notify">
          <el-form
            ref="notifyFormRef"
            :model="notifyForm"
            label-width="120px"
            style="max-width: 600px;"
          >
            <el-form-item label="通知邮箱">
              <el-input v-model="notifyForm.notifyEmail" placeholder="系统通知接收邮箱" />
            </el-form-item>
            <el-form-item label="SMTP服务器">
              <el-input v-model="notifyForm.smtpHost" placeholder="如 smtp.qq.com" />
            </el-form-item>
            <el-form-item label="SMTP端口">
              <el-input-number v-model="notifyForm.smtpPort" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="SMTP用户名">
              <el-input v-model="notifyForm.smtpUser" placeholder="请输入SMTP用户名" />
            </el-form-item>
            <el-form-item label="SMTP密码">
              <el-input v-model="notifyForm.smtpPass" type="password" placeholder="请输入SMTP密码" show-password />
            </el-form-item>
            <el-form-item label="Webhook URL">
              <el-input v-model="notifyForm.webhookUrl" placeholder="接收通知的Webhook地址" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSave('notify')">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { apiClient } from '@sup/shared'

const activeTab = ref('basic')
const saving = ref(false)

const basicForm = reactive({
  siteName: '',
  siteDesc: '',
  logoUrl: '',
  maintenanceMode: false,
})

const securityForm = reactive({
  rateLimitPerMin: 60,
  ipBlacklist: '',
  loginFailLock: 5,
})

const notifyForm = reactive({
  notifyEmail: '',
  smtpHost: '',
  smtpPort: 465,
  smtpUser: '',
  smtpPass: '',
  webhookUrl: '',
})

async function fetchSettings() {
  try {
    const data = await apiClient.get('/admin/settings') as any
    if (data.basic) Object.assign(basicForm, data.basic)
    if (data.security) Object.assign(securityForm, data.security)
    if (data.notify) Object.assign(notifyForm, data.notify)
  } catch (e: any) {
    ElMessage.error(e.message || '获取设置失败')
  }
}

async function handleSave(section: string) {
  saving.value = true
  try {
    const payload: Record<string, any> = {}
    if (section === 'basic') payload.basic = { ...basicForm }
    if (section === 'security') payload.security = { ...securityForm }
    if (section === 'notify') payload.notify = { ...notifyForm }

    await apiClient.put('/admin/settings', payload)
    ElMessage.success('保存成功')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
