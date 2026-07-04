<template>
  <div class="page-container">
    <h2>审计日志</h2>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" @submit.prevent="onSearch">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="搜索用户名" clearable />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.action" placeholder="全部" clearable>
            <el-option v-for="(label, key) in AUDIT_ACTIONS" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="X"
          />
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
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column prop="action" label="操作类型" width="110">
          <template #default="{ row }">
            <el-tag size="small">{{ AUDIT_ACTIONS[row.action] || row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resource" label="资源" width="120" />
        <el-table-column prop="resourceId" label="资源ID" width="90" />
        <el-table-column prop="detail" label="详情" min-width="250" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="createdAt" label="操作时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
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
import { useTable, formatDateTime } from '@sup/shared'
import { AUDIT_ACTIONS } from '../../api/audit'
import type { AuditLog } from '../../api/audit'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange, handleSearch, handleReset } = useTable<AuditLog>('/admin/audit')

const searchForm = reactive({
  username: '',
  action: '',
  dateRange: null as [string, string] | null,
})

function onSearch() {
  const params: Record<string, any> = {}
  if (searchForm.username) params.username = searchForm.username
  if (searchForm.action) params.action = searchForm.action
  if (searchForm.dateRange) {
    params.startTime = searchForm.dateRange[0]
    params.endTime = searchForm.dateRange[1]
  }
  handleSearch(params)
}

function onReset() {
  searchForm.username = ''
  searchForm.action = ''
  searchForm.dateRange = null
  handleReset()
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
</style>
