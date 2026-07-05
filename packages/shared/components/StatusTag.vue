<template>
  <el-tag :type="tagType" :size="size">{{ statusText }}</el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** 状态值（数字或字符串） */
  status: number | string
  /** 状态映射表 { 值: 文本 } */
  statusMap?: Record<string | number, string>
  /** 颜色映射表 { 值: el-tag type } */
  typeMap?: Record<string | number, string>
  /** 标签尺寸 */
  size?: 'large' | 'default' | 'small'
}>(), {
  statusMap: () => ({}),
  typeMap: () => ({}),
  size: 'default',
})

const statusText = computed(() => {
  return props.statusMap[props.status] || String(props.status)
})

const tagType = computed(() => {
  return (props.typeMap[props.status] || 'info') as '' | 'success' | 'warning' | 'info' | 'danger'
})
</script>
