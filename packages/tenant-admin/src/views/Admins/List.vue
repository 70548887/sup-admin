<template>
  <div class="page-container">
    <h2>管理员列表</h2>
    <el-card shadow="never" class="search-card">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="showAdd = true">添加管理员</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag>{{ roleLabels[row.role] || row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" link @click="handleDelete(row.id)">移除</el-button>
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

    <!-- 添加管理员对话框 -->
    <el-dialog v-model="showAdd" title="添加管理员" width="450px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="addForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="addForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="addForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="addForm.role" placeholder="请选择角色">
            <el-option value="boss" label="老板" />
            <el-option value="finance" label="财务" />
            <el-option value="ops" label="运营" />
            <el-option value="support" label="客服" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="handleAdd" :loading="adding">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable, formatDateTime } from '@sup/shared'
import { createTenantAdmin, deleteTenantAdmin } from '../../api/admins'
import type { TenantAdmin } from '../../api/admins'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<TenantAdmin>('/tenant-admin/admins')

const roleLabels: Record<string, string> = { boss: '老板', finance: '财务', ops: '运营', support: '客服' }
const showAdd = ref(false)
const adding = ref(false)
const addForm = reactive({ username: '', email: '', password: '', role: '' })

async function handleAdd() {
  if (!addForm.username || !addForm.password || !addForm.role) {
    ElMessage.warning('请填写完整信息')
    return
  }
  adding.value = true
  try {
    await createTenantAdmin(addForm)
    ElMessage.success('添加成功')
    showAdd.value = false
    Object.assign(addForm, { username: '', email: '', password: '', role: '' })
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    adding.value = false
  }
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确认移除该管理员？', '提示', { type: 'warning' })
  await deleteTenantAdmin(id)
  ElMessage.success('已移除')
  fetchData()
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-container { padding: 20px; }
.search-card { margin-top: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
