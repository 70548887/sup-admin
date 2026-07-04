<template>
  <div class="account-page">
    <el-card v-loading="loading">
      <template #header>
        <span>我的账户</span>
      </template>

      <el-descriptions v-if="account" :column="2" border>
        <el-descriptions-item label="用户名">{{ account.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ account.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ account.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机">{{ account.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="余额">
          <span class="balance">¥{{ account.balance }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="account.status === 1 ? 'success' : 'danger'">
            {{ account.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="App ID">{{ account.appId }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatTime(account.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAccountShow, type CustomerAccount } from '@/api/account'

const loading = ref(false)
const account = ref<CustomerAccount | null>(null)

function formatTime(ts: number): string {
  if (!ts) return '-'
  return new Date(ts * 1000).toLocaleString('zh-CN')
}

async function fetchData() {
  loading.value = true
  try {
    account.value = await getAccountShow()
  } catch (error: any) {
    ElMessage.error(error.message || '获取账户信息失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.balance {
  font-size: 20px;
  font-weight: bold;
  color: #67c23a;
}
</style>
