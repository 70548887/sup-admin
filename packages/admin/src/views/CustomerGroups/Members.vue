<template>
  <div class="page-container">
    <h2>分组成员管理</h2>
    <el-card shadow="never" class="search-card">
      <el-form :inline="true">
        <el-form-item>
          <el-button @click="$router.back()">返回分组列表</el-button>
          <el-button type="primary" @click="showAdd = true">添加成员</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px;">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="customerId" label="客户ID" width="90" />
        <el-table-column prop="customerName" label="客户名称" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="joinedAt" label="加入时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.joinedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" link @click="handleRemove(row.customerId)">移除</el-button>
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

    <!-- 添加成员对话框 -->
    <el-dialog v-model="showAdd" title="添加成员" width="400px">
      <el-form label-width="80px">
        <el-form-item label="客户ID">
          <el-input v-model="addIds" placeholder="多个用逗号分隔，如: 1,2,3" />
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable, formatDateTime } from '@sup/shared'
import { addGroupMembers, removeGroupMember } from '../../api/customerGroups'
import type { GroupMember } from '../../api/customerGroups'

const route = useRoute()
const groupId = Number(route.params.id)

const { tableData, loading, pagination, fetchData, handlePageChange, handleSizeChange } = useTable<GroupMember>(`/admin/customer-groups/${groupId}/members`)

const showAdd = ref(false)
const adding = ref(false)
const addIds = ref('')

async function handleAdd() {
  const ids = addIds.value.split(',').map(s => Number(s.trim())).filter(n => n > 0)
  if (ids.length === 0) { ElMessage.warning('请输入有效的客户ID'); return }
  adding.value = true
  try {
    await addGroupMembers(groupId, ids)
    ElMessage.success('添加成功')
    showAdd.value = false
    addIds.value = ''
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    adding.value = false
  }
}

async function handleRemove(customerId: number) {
  await ElMessageBox.confirm('确认移除该成员？', '提示', { type: 'warning' })
  await removeGroupMember(groupId, customerId)
  ElMessage.success('移除成功')
  fetchData()
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-container { padding: 20px; }
.search-card { margin-top: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
