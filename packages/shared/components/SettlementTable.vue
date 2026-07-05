<template>
  <el-table :data="settlements" v-loading="loading" border stripe style="width: 100%;">
    <el-table-column prop="settlementNo" label="结算单号" width="180" />
    <el-table-column prop="supplierName" label="供货商" min-width="150" />
    <el-table-column label="周期" width="220">
      <template #default="{ row }">
        <span v-if="row.periodStart || row.periodEnd">
          {{ row.periodStart || '-' }} ~ {{ row.periodEnd || '-' }}
        </span>
        <span v-else>{{ row.period || '-' }}</span>
      </template>
    </el-table-column>
    <el-table-column label="总金额" width="140" align="right">
      <template #default="{ row }">¥{{ formatAmount(row.totalAmount) }}</template>
    </el-table-column>
    <el-table-column label="佣金" width="120" align="right">
      <template #default="{ row }">¥{{ formatAmount(row.commission) }}</template>
    </el-table-column>
    <el-table-column label="净额" width="140" align="right">
      <template #default="{ row }">
        <span class="net-amount">¥{{ formatAmount(row.netAmount) }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态" width="100" align="center">
      <template #default="{ row }">
        <el-tag :type="getStatusTagType(row.status)">
          {{ getStatusLabel(row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="220" fixed="right" align="center">
      <template #default="{ row }">
        <el-button type="primary" size="small" link @click="emit('view', row.id)">详情</el-button>
        <el-button
          v-if="row.status === 'pending' || row.status === 0"
          type="warning"
          size="small"
          link
          @click="emit('confirm', row.id)"
        >确认</el-button>
        <el-button
          v-if="row.status === 'confirmed' || row.status === 1"
          type="success"
          size="small"
          link
          @click="emit('pay', row.id)"
        >打款</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
/** 结算单数据 */
interface Settlement {
  id: number
  settlementNo: string
  supplierName: string
  /** 周期（字符串格式，如 "2024-01" 或 "2024-01-01 ~ 2024-01-31"） */
  period?: string
  /** 周期开始日期 */
  periodStart?: string
  /** 周期结束日期 */
  periodEnd?: string
  totalAmount: string | number
  commission: string | number
  netAmount: string | number
  /** 状态：0/pending=待确认, 1/confirmed=已确认, 2/paid=已打款 */
  status: number | string
}

withDefaults(defineProps<{
  /** 结算列表数据 */
  settlements: Settlement[]
  /** 加载状态 */
  loading?: boolean
}>(), {
  loading: false,
})

const emit = defineEmits<{
  (e: 'confirm', id: number): void
  (e: 'pay', id: number): void
  (e: 'view', id: number): void
}>()

/**
 * 金额千分位格式化（保留2位小数）
 */
function formatAmount(amount: string | number): string {
  if (amount === null || amount === undefined || amount === '') return '0.00'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * 状态标签颜色映射
 * - 待确认 = warning（黄色）
 * - 已确认 = primary（蓝色）
 * - 已打款 = success（绿色）
 */
function getStatusTagType(status: number | string): '' | 'success' | 'warning' | 'info' | 'danger' {
  const statusStr = String(status)
  const map: Record<string, '' | 'success' | 'warning' | 'info' | 'danger'> = {
    '0': 'warning',
    'pending': 'warning',
    '1': '',
    'confirmed': '',
    '2': 'success',
    'paid': 'success',
  }
  return map[statusStr] ?? 'info'
}

/** 获取状态显示名称 */
function getStatusLabel(status: number | string): string {
  const statusStr = String(status)
  const map: Record<string, string> = {
    '0': '待确认',
    'pending': '待确认',
    '1': '已确认',
    'confirmed': '已确认',
    '2': '已打款',
    'paid': '已打款',
  }
  return map[statusStr] ?? '未知'
}
</script>

<style scoped>
.net-amount {
  font-weight: 600;
  color: #409eff;
}
</style>
