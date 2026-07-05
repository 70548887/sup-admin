<template>
  <div class="credential-row">
    <span class="credential-row__label">{{ label }}</span>
    <code class="credential-row__value">{{ masked ? maskValue(value) : value }}</code>
    <CopyButton :value="value" />
  </div>
</template>

<script setup lang="ts">
import CopyButton from './CopyButton.vue'

defineProps<{
  label: string
  value: string
  masked?: boolean
}>()

function maskValue(val: string): string {
  if (val.length <= 12) return val
  return val.slice(0, 8) + '****' + val.slice(-4)
}
</script>

<style scoped>
.credential-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}
.credential-row__label {
  min-width: 80px;
  color: #606266;
  font-weight: 500;
}
.credential-row__value {
  flex: 1;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  word-break: break-all;
}
</style>
