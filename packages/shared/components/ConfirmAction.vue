<template>
  <el-popconfirm :title="confirmText" @confirm="$emit('confirm')">
    <template #reference>
      <el-button :type="type" :size="size" :icon="icon">{{ label }}</el-button>
    </template>
  </el-popconfirm>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(defineProps<{
  /** 确认弹窗文字 */
  confirmText?: string
  /** 按钮文字 */
  label?: string
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''
  /** 按钮尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 按钮图标 */
  icon?: string | Component
}>(), {
  confirmText: '确定执行此操作？',
  label: '确认',
  type: 'primary',
  size: 'default',
})

defineEmits<{
  (e: 'confirm'): void
}>()
</script>
