<template>
  <div class="page-container">
    <h2>待审批商品</h2>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="serialNumber" label="编号" width="140" />
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="price" label="售价" width="120">
          <template #default="{ row }">¥{{ formatDecimal(row.price) }}</template>
        </el-table-column>
        <el-table-column prop="costPrice" label="成本价" width="120">
          <template #default="{ row }">¥{{ formatDecimal(row.costPrice) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="90" />
        <el-table-column prop="createdAt" label="提交时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" link @click="handleApprove(row)">通过</el-button>
            <el-button type="danger" size="small" link @click="handleReject(row)">拒绝</el-button>
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
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable, formatDateTime, formatDecimal } from '@sup/shared'
import type { Goods } from '@sup/shared'
import { approveGoods, rejectGoods } from '../../api/goods'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<Goods>('/admin/goods/pending')

async function handleApprove(row: Goods) {
  try {
    await ElMessageBox.confirm(`确定通过商品 "${row.name}" 的审批吗？`, '确认审批', {
      type: 'warning',
    })
    await approveGoods(row.id)
    ElMessage.success('审批通过')
    fetchData()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '操作失败')
    }
  }
}

async function handleReject(row: Goods) {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝审批', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '请输入拒绝原因',
    })
    await rejectGoods(row.id, reason)
    ElMessage.success('已拒绝')
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
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
