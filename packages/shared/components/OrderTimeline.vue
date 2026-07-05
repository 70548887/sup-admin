<template>
  <div class="order-timeline">
    <el-timeline v-if="statusChanges.length > 0">
      <el-timeline-item
        v-for="(item, index) in statusChanges"
        :key="index"
        :timestamp="formatDateTime(item.timestamp)"
        :type="getStatusType(item.status)"
        placement="top"
      >
        <el-card shadow="hover" class="timeline-card">
          <div class="timeline-header">
            <el-tag :type="getStatusType(item.status)" size="small">
              {{ getStatusLabel(item.status) }}
            </el-tag>
            <span class="timeline-operator">操作人：{{ item.operator || '-' }}</span>
          </div>
          <div v-if="item.note" class="timeline-note">
            备注：{{ item.note }}
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-else description="暂无状态变更记录" />
  </div>
</template>

<script setup lang="ts">
import { ORDER_STATUS } from '../constants'
import { formatDateTime } from '../utils/format'

/** 状态变更记录 */
interface StatusChange {
  status: number
  timestamp: number
  operator: string
  note: string
}

defineProps<{
  /** 状态变更历史列表 */
  statusChanges: StatusChange[]
}>()

/**
 * 根据状态码获取时间线节点类型
 * - success（绿色）：已完成等成功状态
 * - primary（蓝色）：处理中等进行中状态
 * - danger（红色）：已取消、已退款等异常状态
 * - info（灰色）：待支付等默认状态
 */
function getStatusType(status: number): '' | 'success' | 'warning' | 'info' | 'danger' | 'primary' {
  const map: Record<number, '' | 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    0: 'info',       // 待支付
    1: 'primary',    // 已支付
    2: 'primary',    // 处理中
    3: 'success',    // 已完成
    4: 'danger',     // 已取消
    5: 'danger',     // 已退款
    6: 'danger',     // 部分退款
  }
  return map[status] ?? 'info'
}

/** 获取状态显示名称 */
function getStatusLabel(status: number): string {
  return ORDER_STATUS[status] || `状态${status}`
}
</script>

<style scoped>
.order-timeline {
  padding: 8px 0;
}
.timeline-card {
  margin-bottom: 0;
}
.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.timeline-operator {
  font-size: 13px;
  color: #606266;
}
.timeline-note {
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}
</style>
