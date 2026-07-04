<template>
  <div class="page-container">
    <h2>客户分组</h2>
    <el-card shadow="never" class="search-card">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="showCreate = true">新建分组</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="分组名称" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="memberCount" label="成员数" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="$router.push(`/customer-groups/${row.id}/members`)">成员</el-button>
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

    <!-- 新建分组对话框 -->
    <el-dialog v-model="showCreate" title="新建分组" width="450px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="createForm.name" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="creating">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable, formatDateTime } from '@sup/shared'
import { createCustomerGroup } from '../../api/customerGroups'
import type { CustomerGroup } from '../../api/customerGroups'

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<CustomerGroup>('/admin/customer-groups')

const showCreate = ref(false)
const creating = ref(false)
const createForm = reactive({ name: '', description: '' })

async function handleCreate() {
  if (!createForm.name) { ElMessage.warning('请输入分组名称'); return }
  creating.value = true
  try {
    await createCustomerGroup(createForm)
    ElMessage.success('创建成功')
    showCreate.value = false
    createForm.name = ''
    createForm.description = ''
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    creating.value = false
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-container { padding: 20px; }
.search-card { margin-top: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
