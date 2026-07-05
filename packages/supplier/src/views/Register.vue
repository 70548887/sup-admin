<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="register-title">供货商入驻</h2>
      <p class="register-subtitle">创建您的供货商账户</p>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="0"
        size="large"
        @keyup.enter="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
            :prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item v-if="form.password" class="strength-item">
          <div class="password-strength">
            <span class="strength-label">密码强度：</span>
            <div class="strength-bar">
              <div
                class="strength-fill"
                :style="{ width: strengthPercent + '%', background: strengthColor }"
              />
            </div>
            <span class="strength-text" :style="{ color: strengthColor }">{{ strengthText }}</span>
          </div>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="register-button"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
        <div class="register-footer">
          <span class="footer-text">已有账户? <router-link to="/login" class="footer-link">立即登录</router-link></span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd) return 0
  if (pwd.length < 8 || /^\d+$/.test(pwd)) return 1 // 弱
  const hasUpper = /[A-Z]/.test(pwd)
  const hasLower = /[a-z]/.test(pwd)
  const hasDigit = /\d/.test(pwd)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
  if (pwd.length >= 12 && hasUpper && hasLower && hasDigit && hasSpecial) return 3 // 强
  if (pwd.length >= 8 && hasUpper && hasLower && hasDigit) return 2 // 中
  return 1 // 弱
})

const strengthText = computed(() => ['', '弱', '中', '强'][passwordStrength.value])
const strengthColor = computed(() => ['', '#f56c6c', '#e6a23c', '#67c23a'][passwordStrength.value])
const strengthPercent = computed(() => [0, 33, 66, 100][passwordStrength.value])

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 32, message: '用户名长度为3-32个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

async function handleRegister() {
  const formEl = formRef.value
  if (!formEl) return

  await formEl.validate(async (valid: boolean) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await axios.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        role: 'supplier',
      })
      const { token } = res.data.data
      localStorage.setItem('supplier_token', token)
      ElMessage.success('注册成功')
      router.push('/')
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || '注册失败'
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1677ff 0%, #0e6de8 100%);
}

.register-card {
  width: 450px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.register-title {
  text-align: center;
  margin-bottom: 8px;
  color: #303133;
  font-size: 24px;
}

.register-subtitle {
  text-align: center;
  margin: 0 0 30px 0;
  color: #909399;
  font-size: 14px;
}

.strength-item {
  margin-bottom: 12px;
}

.password-strength {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.strength-label {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background: #ebeef5;
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s, background 0.3s;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.register-button {
  width: 100%;
}

.register-footer {
  text-align: center;
  margin-top: 8px;
}

.footer-text {
  color: #909399;
  font-size: 14px;
}

.footer-link {
  color: #1677ff;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>
