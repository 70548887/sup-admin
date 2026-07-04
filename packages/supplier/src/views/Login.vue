<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>供货商登录</h2>
          <p>请输入您的 API 凭证</p>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" @submit.prevent="handleLogin">
        <el-form-item label="App ID" prop="appId">
          <el-input v-model="form.appId" placeholder="请输入 App ID" />
        </el-form-item>
        <el-form-item label="App Secret" prop="appSecret">
          <el-input v-model="form.appSecret" type="password" show-password placeholder="请输入 App Secret" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { saveCredentials } from '@/api/legacyAuth'
import { supplierClient } from '@/api/client'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  appId: '',
  appSecret: '',
})

const rules: FormRules = {
  appId: [{ required: true, message: '请输入 App ID', trigger: 'blur' }],
  appSecret: [{ required: true, message: '请输入 App Secret', trigger: 'blur' }],
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // 保存凭证
    saveCredentials(form.appId, form.appSecret)

    // 验证凭证是否有效（尝试请求商品列表）
    await supplierClient.post('/openapi/supplier/Goods/Paging', { page: 1, size: 1 })

    ElMessage.success('登录成功')
    router.push('/')
  } catch (error: any) {
    ElMessage.error(error.message || '认证失败，请检查凭证')
    // 清除无效凭证
    import('@/api/legacyAuth').then(m => m.clearCredentials())
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.card-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
</style>
