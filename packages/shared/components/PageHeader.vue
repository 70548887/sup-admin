<template>
  <div class="page-header">
    <div>
      <h2 class="page-header__title">{{ title }}</h2>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-header__title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}
.page-header__subtitle {
  margin: 4px 0 0;
  color: #909399;
  font-size: 13px;
}
.page-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
