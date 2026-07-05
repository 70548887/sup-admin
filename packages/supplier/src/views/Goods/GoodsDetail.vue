<template>
  <div class="goods-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">返回</el-button>
          <span>商品详情</span>
          <div class="header-actions" v-if="goods">
            <el-button type="primary" @click="handleEdit">编辑</el-button>
            <el-button
              v-if="!goods.is_close"
              type="danger"
              :loading="statusLoading"
              @click="handleToggleClose(true)"
            >下架</el-button>
            <el-button
              v-else
              type="success"
              :loading="statusLoading"
              @click="handleToggleClose(false)"
            >上架</el-button>
          </div>
        </div>
      </template>

      <el-descriptions v-if="goods" :column="2" border>
        <!-- 基本信息 -->
        <el-descriptions-item label="商品ID">{{ goods.id }}</el-descriptions-item>
        <el-descriptions-item label="商品编号">{{ goods.serial_number }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ goods.name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="goods.status === 1 ? 'success' : goods.status === 2 ? 'warning' : 'info'">
            {{ GOODS_STATUS[goods.status] || '未知' }}
          </el-tag>
        </el-descriptions-item>

        <!-- 价格 -->
        <el-descriptions-item label="售价">¥{{ formatDecimal(goods.price) }}</el-descriptions-item>
        <el-descriptions-item label="是否关闭下单">
          <el-tag :type="goods.is_close ? 'danger' : 'success'">
            {{ goods.is_close ? '已关闭' : '开放中' }}
          </el-tag>
        </el-descriptions-item>

        <!-- 库存 -->
        <el-descriptions-item label="库存">{{ goods.stock }}</el-descriptions-item>
        <el-descriptions-item label="允许重复下单">
          <el-tag :type="goods.is_repeat ? 'success' : 'info'">
            {{ goods.is_repeat ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>

        <!-- 购买参数配置 -->
        <el-descriptions-item label="最小购买量">{{ goods.buy_min }}</el-descriptions-item>
        <el-descriptions-item label="最大购买量">{{ goods.buy_max }}</el-descriptions-item>
        <el-descriptions-item label="购买基数">{{ goods.buy_base }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ goods.description || '暂无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 购买参数列表 -->
      <div v-if="goods?.buy_params?.length" class="params-section">
        <h4>购买参数</h4>
        <el-table :data="goods.buy_params" border>
          <el-table-column prop="label" label="参数名称" min-width="120" />
          <el-table-column prop="key" label="参数键" width="140" />
          <el-table-column label="是否必填" width="100">
            <template #default="{ row }">
              <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                {{ row.required ? '必填' : '选填' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="placeholder" label="提示语" min-width="150" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { GOODS_STATUS, formatDecimal } from '@sup/shared'
import { getGoodsShow, editGoods, type SupplierGoods } from '@/api/goods'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const statusLoading = ref(false)
const goods = ref<SupplierGoods | null>(null)

async function fetchData() {
  const sn = route.params.id as string
  if (!sn) return

  loading.value = true
  try {
    goods.value = await getGoodsShow(sn)
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品详情失败')
  } finally {
    loading.value = false
  }
}

function handleEdit() {
  const sn = route.params.id as string
  router.push(`/goods/edit/${sn}`)
}

async function handleToggleClose(isClose: boolean) {
  if (!goods.value) return
  const action = isClose ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确定要${action}商品 "${goods.value.name}" 吗？`, '确认操作', {
      type: 'warning',
    })
    statusLoading.value = true
    await editGoods({
      goods_sn: goods.value.serial_number,
      is_close: isClose,
    })
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '操作失败')
    }
  } finally {
    statusLoading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.params-section {
  margin-top: 20px;
}
.params-section h4 {
  margin-bottom: 12px;
  color: #303133;
}
</style>
