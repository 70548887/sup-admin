<template>
  <div class="page-container">
    <h2>API限流管理</h2>
    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="appName" label="应用名称" min-width="150" />
        <el-table-column prop="appKey" label="AppKey" min-width="180" />
        <el-table-column prop="tenantName" label="所属租户" width="140" />
        <el-table-column prop="rateLimit" label="频率限制(次/秒)" width="140" />
        <el-table-column prop="dailyQuota" label="日配额" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openEdit(row)">调整配额</el-button>
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

    <!-- 编辑配额对话框 -->
    <el-dialog v-model="showEdit" title="调整配额" width="400px">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="频率限制(次/秒)">
          <el-input-number v-model="editForm.rateLimit" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="日配额">
          <el-input-number v-model="editForm.dailyQuota" :min="100" :max="10000000" :step="1000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate" :loading="updating">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable } from '@sup/shared'
import { updateRateLimit } from '../../api/apiConfig'
import type { ApiApp } from '../../api/apiConfig'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<ApiApp>('/admin/api-apps')

const showEdit = ref(false)
const updating = ref(false)
const editAppId = ref(0)
const editForm = reactive({ rateLimit: 100, dailyQuota: 10000 })

function openEdit(row: ApiApp) {
  editAppId.value = row.id
  editForm.rateLimit = row.rateLimit
  editForm.dailyQuota = row.dailyQuota
  showEdit.value = true
}

async function handleUpdate() {
  updating.value = true
  try {
    await updateRateLimit(editAppId.value, editForm)
    ElMessage.success('更新成功')
    showEdit.value = false
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    updating.value = false
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-container { padding: 20px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
