<template>
  <div class="account-page">
    <el-row :gutter="16">
      <!-- 账户信息 -->
      <el-col :xs="24" :md="16">
        <el-card v-loading="loading">
          <template #header>
            <span>账户信息</span>
          </template>

          <el-descriptions v-if="account" :column="2" border>
            <el-descriptions-item label="用户名">{{ account.username }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag type="info" size="small">{{ roleText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="昵称">{{ account.nickname || '-' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ account.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机">{{ account.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="account.status === 1 ? 'success' : 'danger'" size="small">
                {{ account.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间" :span="2">
              {{ formatDateTime(account.createdAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 钱包余额与快捷入口 -->
      <el-col :xs="24" :md="8">
        <el-card v-loading="loading" class="balance-card">
          <div class="balance-label">钱包余额</div>
          <div class="balance-amount">¥{{ account ? formatDecimal(account.balance) : '0.00' }}</div>
          <div class="balance-actions">
            <el-button type="primary" @click="$router.push('/account/recharge')">
              <el-icon><Wallet /></el-icon>
              充值
            </el-button>
            <el-button @click="$router.push('/account/api-keys')">
              <el-icon><Key /></el-icon>
              API密钥
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近交易记录 -->
    <el-card class="flow-card" v-loading="flowLoading">
      <template #header>
        <div class="card-header">
          <span>最近交易记录</span>
          <el-button type="primary" size="small" link @click="$router.push('/account/recharge')">
            查看更多
          </el-button>
        </div>
      </template>

      <el-table :data="flowList" stripe border>
        <el-table-column prop="createdAt" label="时间" width="170" align="center">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'success' : 'danger'" size="small">
              {{ row.type === 1 ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            <span :class="row.type === 1 ? 'income' : 'expense'">
              {{ row.type === 1 ? '+' : '-' }}¥{{ formatDecimal(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="120" align="right">
          <template #default="{ row }">¥{{ formatDecimal(row.balance) }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      </el-table>

      <el-empty v-if="!flowLoading && flowList.length === 0" description="暂无交易记录" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Wallet, Key } from '@element-plus/icons-vue'
import { formatDateTime, formatDecimal, USER_ROLES } from '@sup/shared'
import { getAccountShow, type CustomerAccount } from '@/api/account'
import { getCapitalFlowList, type CapitalFlow } from '@/api/wallet'

const loading = ref(false)
const flowLoading = ref(false)
const account = ref<CustomerAccount | null>(null)
const flowList = ref<CapitalFlow[]>([])

const roleText = computed(() => {
  return USER_ROLES.customer || '客户'
})

async function fetchAccount() {
  loading.value = true
  try {
    account.value = await getAccountShow()
  } catch (error: any) {
    ElMessage.error(error.message || '获取账户信息失败')
  } finally {
    loading.value = false
  }
}

async function fetchFlows() {
  flowLoading.value = true
  try {
    const res = await getCapitalFlowList({ page: 1, size: 5 })
    flowList.value = res.list || []
  } catch (error: any) {
    ElMessage.error(error.message || '获取交易记录失败')
  } finally {
    flowLoading.value = false
  }
}

onMounted(() => {
  fetchAccount()
  fetchFlows()
})
</script>

<style scoped>
.account-page {
  padding: 0;
}
.balance-card {
  background: linear-gradient(135deg, #409eff 0%, #1677ff 100%);
  color: #fff;
}
.balance-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}
.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}
.balance-amount {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
}
.balance-actions {
  display: flex;
  gap: 12px;
}
.balance-actions .el-button {
  flex: 1;
}
.flow-card {
  margin-top: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.income {
  color: #67c23a;
  font-weight: 600;
}
.expense {
  color: #f56c6c;
  font-weight: 600;
}
</style>
