<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">欢迎来到 SUP 商城</h2>
      <p class="login-subtitle">发现精选商品，享受最优价格</p>
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-width="0"
        size="large"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名/邮箱"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住账户</el-checkbox>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            立即登录
          </el-button>
        </el-form-item>
        <div class="login-footer">
          <span class="footer-text">没有账户? <router-link to="/register" class="footer-link">立即注册</router-link></span>
          <span class="footer-text">遇到问题? <a href="javascript:void(0)" class="footer-link">联系客服</a></span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const rememberMe = ref(false)

onMounted(() => {
  // 清理旧版Legacy认证残留数据
  localStorage.removeItem('supplier_app_id')
  localStorage.removeItem('supplier_app_secret')
  localStorage.removeItem('customer_app_id')
  localStorage.removeItem('customer_app_secret')
})

const loginForm = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名/邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  const form = formRef.value
  if (!form) return

  await form.validate(async (valid: boolean) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await axios.post('/auth/login', {
        username: loginForm.username,
        password: loginForm.password,
        role: 'customer',
      })
      const { token } = res.data.data
      localStorage.setItem('customer_token', token)
      ElMessage.success('登录成功')
      router.push('/')
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || '登录失败'
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 8px;
  color: #303133;
  font-size: 24px;
}

.login-subtitle {
  text-align: center;
  margin: 0 0 30px 0;
  color: #909399;
  font-size: 14px;
}

.login-options {
  display: flex;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-text {
  color: #909399;
  font-size: 14px;
}

.footer-link {
  color: #43cea2;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>
