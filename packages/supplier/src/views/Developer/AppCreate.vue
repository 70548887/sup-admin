<template>
  <div class="app-create">
    <PageHeader title="新建应用" subtitle="创建一个新的API应用以获取访问凭证" />

    <!-- 创建成功后显示密钥 -->
    <template v-if="created">
      <SecretReveal :app-id="createdAppId" :app-secret="createdSecret" @done="$router.push('/developer')" />
    </template>

    <!-- 创建表单 -->
    <el-card v-else shadow="never">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 520px"
      >
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入应用名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="应用描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="选填，简要描述应用用途"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="环境" prop="environment">
          <el-radio-group v-model="form.environment">
            <el-radio value="production">生产环境</el-radio>
            <el-radio value="sandbox">沙盒环境</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">创建应用</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { supplierClient } from '@/api/client'
import { PageHeader, SecretReveal } from '@sup/shared'

const formRef = ref<FormInstance>()
const submitting = ref(false)
const created = ref(false)
const createdAppId = ref('')
const createdSecret = ref('')

const form = reactive({
  name: '',
  description: '',
  environment: 'production',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  environment: [{ required: true, message: '请选择环境', trigger: 'change' }],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res: any = await supplierClient.post('/openapi/supplier/App/Create', {
      name: form.name,
      description: form.description,
      environment: form.environment,
    })
    createdAppId.value = res.app_id
    createdSecret.value = res.app_secret
    created.value = true
  } catch (e: any) {
    ElMessage.error(e.message || '创建失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.app-create {
  padding: 4px;
}
</style>
