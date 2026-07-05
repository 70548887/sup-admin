<template>
  <div class="settlement-page">
    <h2>结算管理</h2>

    <!-- 顶部统计 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>待确认金额</template>
          <div class="stat-value pending">¥{{ formatAmount(summary.pendingAmount) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>已确认金额</template>
          <div class="stat-value confirmed">¥{{ formatAmount(summary.confirmedAmount) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>已打款总额</template>
          <div class="stat-value paid">¥{{ formatAmount(summary.paidAmount) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选栏 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 140px;">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已打款" value="paid" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 结算列表（使用共享组件） -->
      <SettlementTable
        :settlements="settlementList"
        :loading="loading"
        @view="handleView"
        @confirm="handleConfirm"
        @pay="handlePay"
      />

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SettlementTable } from '@sup/shared'
import { supplierClient } from '@/api/client'

/** 结算记录接口 */
interface SettlementRecord {
  id: number
  settlementNo: string
  supplierName: string
  period?: string
  periodStart?: string
  periodEnd?: string
  totalAmount: string | number
  commission: string | number
  netAmount: string | number
  status: number | string
}

/** 顶部汇总 */
const summary = ref({
  pendingAmount: '0.00',
  confirmedAmount: '0.00',
  paidAmount: '0.00',
})

/** 筛选 */
const filterForm = reactive({
  status: undefined as string | undefined,
  dateRange: null as [string, string] | null,
})

/** 列表数据 */
const settlementList = ref<SettlementRecord[]>([])
const loading = ref(false)

/** 分页 */
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

/** 金额格式化 */
function formatAmount(amount: string | number): string {
  if (amount === null || amount === undefined || amount === '') return '0.00'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** 获取结算列表 */
async function fetchList() {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.size,
    }
    if (filterForm.status) params.status = filterForm.status
    if (filterForm.dateRange) {
      params.startDate = filterForm.dateRange[0]
      params.endDate = filterForm.dateRange[1]
    }
    const data: any = await supplierClient.post('/openapi/supplier/Settlement/Paging', params)
    settlementList.value = data?.list || []
    pagination.total = data?.total || 0
  } catch (e: any) {
    console.error('加载结算列表失败:', e.message)
    settlementList.value = []
  } finally {
    loading.value = false
  }
}

/** 获取汇总 */
async function fetchSummary() {
  try {
    const data: any = await supplierClient.post('/openapi/supplier/Settlement/Summary', {})
    if (data) {
      summary.value = {
        pendingAmount: data.pendingAmount || '0.00',
        confirmedAmount: data.confirmedAmount || '0.00',
        paidAmount: data.paidAmount || '0.00',
      }
    }
  } catch (e: any) {
    console.error('加载结算汇总失败:', e.message)
  }
}

function handleSearch() {
  pagination.page = 1
  fetchList()
}

function handleReset() {
  filterForm.status = undefined
  filterForm.dateRange = null
  pagination.page = 1
  fetchList()
}

function handleView(id: number) {
  // 结算详情可扩展
  ElMessage.info(`查看结算单 #${id}`)
}

async function handleConfirm(id: number) {
  try {
    await ElMessageBox.confirm('确定确认该结算单吗？', '确认结算', { type: 'warning' })
    await supplierClient.post('/openapi/supplier/Settlement/Confirm', { id })
    ElMessage.success('确认成功')
    fetchList()
    fetchSummary()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

async function handlePay(id: number) {
  try {
    await ElMessageBox.confirm('确定执行打款操作吗？', '确认打款', { type: 'warning' })
    await supplierClient.post('/openapi/supplier/Settlement/Pay', { id })
    ElMessage.success('打款成功')
    fetchList()
    fetchSummary()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

onMounted(() => {
  fetchList()
  fetchSummary()
})
</script>

<style scoped>
.settlement-page {
  padding: 20px;
}

.stat-row {
  margin-top: 16px;
}

.stat-card .stat-value {
  font-size: 26px;
  font-weight: bold;
  text-align: center;
  margin: 12px 0;
}

.stat-value.pending {
  color: #e6a23c;
}

.stat-value.confirmed {
  color: #409eff;
}

.stat-value.paid {
  color: #67c23a;
}

.filter-form {
  margin-bottom: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
