<template>
  <div class="app-list">
    <PageHeader title="开发者中心 - API应用管理">
      <template #actions>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索应用名称"
          clearable
          style="width: 200px; margin-right: 12px"
          @clear="fetchList"
          @keyup.enter="fetchList"
        />
        <el-button type="primary" @click="$router.push('/developer/create')">
          新建应用
        </el-button>
      </template>
    </PageHeader>

    <!-- 空状态 -->
    <el-empty v-if="!loading && list.length === 0" description="还没有创建API应用，开始创建你的第一个应用">
      <el-button type="primary" @click="$router.push('/developer/create')">新建应用</el-button>
    </el-empty>

    <!-- 列表 -->
    <el-table v-else v-loading="loading" :data="list" border stripe>
      <el-table-column label="应用名称" prop="name" min-width="140" />
      <el-table-column label="AppId" min-width="160">
        <template #default="{ row }">
          <code>{{ maskAppId(row.app_id) }}</code>
        </template>
      </el-table-column>
      <el-table-column label="环境" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.environment === 'production' ? 'danger' : 'warning'" size="small">
            {{ row.environment === 'production' ? '生产' : '沙盒' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="created_at" width="170" />
      <el-table-column label="最后调用" prop="last_used_at" width="170">
        <template #default="{ row }">
          {{ row.last_used_at || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push(`/developer/detail?app_id=${row.app_id}`)">
            详情
          </el-button>
          <el-button link type="warning" @click="handleRotate(row)">轮换密钥</el-button>
          <el-button link :type="row.status === 'active' ? 'info' : 'success'" @click="handleToggle(row)">
            {{ row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchList"
        @size-change="fetchList"
      />
    </div>

    <!-- 轮换密钥结果 -->
    <el-dialog v-model="rotateDialogVisible" title="新密钥" width="520px" :close-on-click-modal="false">
      <SecretReveal :app-id="rotatedAppId" :app-secret="rotatedSecret" @done="rotateDialogVisible = false" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { supplierClient } from '@/api/client'
import { PageHeader, SecretReveal } from '@sup/shared'

interface AppItem {
  app_id: string
  name: string
  environment: string
  status: string
  created_at: string
  last_used_at: string
}

const loading = ref(false)
const list = ref<AppItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const searchKeyword = ref('')

const rotateDialogVisible = ref(false)
const rotatedAppId = ref('')
const rotatedSecret = ref('')

function maskAppId(appId: string): string {
  if (!appId || appId.length <= 12) return appId
  return appId.slice(0, 8) + '...' + appId.slice(-4)
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await supplierClient.get('/openapi/supplier/App/List', {
      params: { page: page.value, size: size.value, keyword: searchKeyword.value },
    })
    list.value = res.list || []
    total.value = res.total || 0
  } catch (e: any) {
    ElMessage.error(e.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

async function handleRotate(row: AppItem) {
  try {
    await ElMessageBox.confirm('轮换后旧密钥将立即失效，确认轮换？', '轮换密钥', {
      type: 'warning',
    })
    const res: any = await supplierClient.post('/openapi/supplier/App/RotateSecret', {
      app_id: row.app_id,
    })
    rotatedAppId.value = row.app_id
    rotatedSecret.value = res.app_secret
    rotateDialogVisible.value = true
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

async function handleToggle(row: AppItem) {
  const action = row.status === 'active' ? 'Disable' : 'Enable'
  try {
    await supplierClient.post(`/openapi/supplier/App/${action}`, { app_id: row.app_id })
    ElMessage.success('操作成功')
    fetchList()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

async function handleDelete(row: AppItem) {
  try {
    await ElMessageBox.confirm(`确认删除应用「${row.name}」？此操作不可恢复。`, '删除应用', {
      type: 'warning',
    })
    await supplierClient.post('/openapi/supplier/App/Delete', { app_id: row.app_id })
    ElMessage.success('已删除')
    fetchList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.message || '删除失败')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.app-list {
  padding: 4px;
}
.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
