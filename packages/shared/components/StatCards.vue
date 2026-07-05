<template>
  <el-row :gutter="16" class="stat-cards">
    <el-col :span="Math.floor(24 / stats.length)" v-for="stat in stats" :key="stat.label">
      <el-card shadow="hover" class="stat-card-item">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value">{{ stat.value }}</div>
        <div v-if="stat.suffix" class="stat-suffix">{{ stat.suffix }}</div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
defineProps<{
  stats: Array<{ label: string; value: string | number; suffix?: string }>
}>()
</script>

<style scoped>
.stat-cards {
  margin-bottom: 20px;
}
.stat-card-item {
  text-align: center;
}
.stat-card-item :deep(.el-card__body) {
  padding: 20px;
}
.stat-label {
  color: #909399;
  font-size: 13px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-top: 8px;
}
.stat-suffix {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
}
</style>
