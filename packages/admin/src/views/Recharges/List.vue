<template>
  <div class="page-container">
    <h2>充值审核</h2>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" @submit.prevent="onSearch">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="搜索用户名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option v-for="(label, key) in RECHARGE_STATUS" :key="key" :label="label" :value="Number(key)" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户" width="130" />
        <el-table-column prop="amount" label="充值金额" width="120">
          <template #default="{ row }">¥{{ formatDecimal(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="120" />
        <el-table-column prop="proof" label="凭证" min-width="200">
          <template #default="{ row }">
            <el-link v-if="row.proof" type="primary" :href="row.proof" target="_blank">查看凭证</el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'warning'">
              {{ RECHARGE_STATUS[row.status] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 0">
              <el-button type="success" size="small" link @click="handleApprove(row)">通过</el-button>
              <el-button type="danger" size="small" link @click="handleReject(row)">拒绝</el-button>
            </template>
            <span v-else class="text-muted">已处理</span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable, formatDateTime, formatDecimal } from '@sup/shared'
import { approveRecharge, rejectRecharge, RECHARGE_STATUS } from '../../api/recharges'
import type { Recharge } from '../../api/recharges'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange, handleSearch, handleReset } = useTable<Recharge>('/admin/recharges')

const searchForm = reactive({
  username: '',
  status: undefined as number | undefined,
})

function onSearch() {
  const params: Record<string, any> = {}
  if (searchForm.username) params.username = searchForm.username
  if (searchForm.status !== undefined && searchForm.status !== null) params.status = searchForm.status
  handleSearch(params)
}

function onReset() {
  searchForm.username = ''
  searchForm.status = undefined
  handleReset()
}

async function handleApprove(row: Recharge) {
  try {
    await ElMessageBox.confirm(
      `确定通过此充值申请吗？\n用户: ${row.username}\n金额: ¥${row.amount}`,
      '确认审批',
      { type: 'warning' }
    )
    await approveRecharge(row.id)
    ElMessage.success('充值已通过')
    fetchData()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '操作失败')
    }
  }
}

async function handleReject(row: Recharge) {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝充值', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '请输入拒绝原因',
    })
    await rejectRecharge(row.id, reason)
    ElMessage.success('已拒绝充值')
    fetchData()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '操作失败')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.search-card {
  margin-top: 16px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.text-muted {
  color: #909399;
  font-size: 13px;
}
</style>
