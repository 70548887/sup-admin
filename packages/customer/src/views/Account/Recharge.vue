<template>
  <div class="recharge-page">
    <el-row :gutter="16">
      <!-- 充值表单 -->
      <el-col :xs="24" :md="14">
        <el-card>
          <template #header>
            <span>账户充值</span>
          </template>

          <div class="balance-info">
            <span class="balance-label">当前余额</span>
            <span class="balance-amount">¥{{ account ? formatDecimal(account.balance) : '0.00' }}</span>
          </div>

          <RechargeForm
            :wallet-balance="account?.balance"
            upload-action="/api/upload"
            @submit="handleSubmit"
          />
        </el-card>
      </el-col>

      <!-- 充值说明 -->
      <el-col :xs="24" :md="10">
        <el-card>
          <template #header>
            <span>充值说明</span>
          </template>
          <el-timeline>
            <el-timeline-item type="primary">填写充值金额与支付方式</el-timeline-item>
            <el-timeline-item type="primary">上传转账凭证（如银行转账、支付宝、微信截图）</el-timeline-item>
            <el-timeline-item type="success">等待管理员审核通过，余额自动到账</el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 充值记录 -->
    <el-card class="records-card" v-loading="loading">
      <template #header>
        <span>充值记录</span>
      </template>

      <el-table :data="records" stripe border>
        <el-table-column prop="createdAt" label="申请时间" width="170" align="center">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="充值金额" width="120" align="right">
          <template #default="{ row }">¥{{ formatDecimal(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="120" align="center">
          <template #default="{ row }">{{ paymentMethodText(row.paymentMethod) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      </el-table>

      <el-empty v-if="!loading && records.length === 0" description="暂无充值记录" />

      <el-pagination
        class="pagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchRecords"
        @current-change="fetchRecords"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { RechargeForm, formatDateTime, formatDecimal } from '@sup/shared'
import { getAccountShow, type CustomerAccount } from '@/api/account'
import {
  createRecharge,
  getRechargeList,
  type RechargeRecord,
  type CreateRechargeData,
} from '@/api/recharge'

const account = ref<CustomerAccount | null>(null)
const records = ref<RechargeRecord[]>([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const RECHARGE_STATUS_TEXT: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
}

function statusText(status: number): string {
  return RECHARGE_STATUS_TEXT[status] || '未知'
}

function statusType(status: number): '' | 'success' | 'warning' | 'info' | 'danger' | 'primary' {
  const map: Record<number, '' | 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    0: 'warning',
    1: 'success',
    2: 'danger',
  }
  return map[status] ?? 'info'
}

function paymentMethodText(method: string): string {
  const map: Record<string, string> = {
    bank_transfer: '银行转账',
    alipay: '支付宝',
    wechat: '微信',
  }
  return map[method] || method
}

async function fetchAccount() {
  try {
    account.value = await getAccountShow()
  } catch (error: any) {
    ElMessage.error(error.message || '获取账户余额失败')
  }
}

async function fetchRecords() {
  loading.value = true
  try {
    const res = await getRechargeList({ page: pagination.page, size: pagination.size })
    records.value = res.list || []
    pagination.total = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '获取充值记录失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit(data: CreateRechargeData) {
  try {
    await createRecharge(data)
    ElMessage.success('充值申请已提交，等待审核')
    await fetchRecords()
    await fetchAccount()
  } catch (error: any) {
    ElMessage.error(error.message || '提交充值申请失败')
  }
}

onMounted(() => {
  fetchAccount()
  fetchRecords()
})
</script>

<style scoped>
.recharge-page {
  padding: 0;
}
.balance-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}
.balance-label {
  font-size: 14px;
  color: #606266;
}
.balance-amount {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}
.records-card {
  margin-top: 16px;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
