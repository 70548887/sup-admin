<template>
  <div class="page-container">
    <h2>编辑用户</h2>

    <el-card shadow="never" style="margin-top: 16px; max-width: 650px;">
      <el-form
        ref="formRef"
        v-loading="pageLoading"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option v-for="(label, key) in USER_ROLES" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        <el-form-item label="余额调整">
          <el-input-number v-model="form.balanceAdjust" :precision="2" :step="10" :min="-99999" :max="99999" />
          <span style="margin-left: 8px; color: #909399; font-size: 12px;">正数充值，负数扣减</span>
        </el-form-item>
        <el-form-item label="IP白名单">
          <el-input
            v-model="form.ipWhitelist"
            type="textarea"
            :rows="4"
            placeholder="每行一个IP地址，留空则不限制"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { apiClient, USER_ROLES } from '@sup/shared'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const pageLoading = ref(false)
const submitting = ref(false)

const userId = Number(route.params.id)

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  role: '',
  status: 1,
  balanceAdjust: 0,
  ipWhitelist: '',
})

const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

async function fetchUser() {
  pageLoading.value = true
  try {
    const data = await apiClient.get(`/admin/users/${userId}`) as any
    form.username = data.username || ''
    form.nickname = data.nickname || ''
    form.email = data.email || ''
    form.phone = data.phone || ''
    form.role = data.role || ''
    form.status = data.status ?? 1
    form.ipWhitelist = data.ipWhitelist || ''
  } catch (e: any) {
    ElMessage.error(e.message || '获取用户信息失败')
  } finally {
    pageLoading.value = false
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await apiClient.put(`/admin/users/${userId}`, {
      nickname: form.nickname,
      email: form.email,
      phone: form.phone,
      role: form.role,
      status: form.status,
      balanceAdjust: form.balanceAdjust,
      ipWhitelist: form.ipWhitelist,
    })
    ElMessage.success('保存成功')
    router.push('/users')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchUser()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
