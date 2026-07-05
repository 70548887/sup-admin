<template>
  <el-button :type="copied ? 'success' : 'default'" size="small" @click="handleCopy">
    {{ copied ? '✓ 已复制' : '复制' }}
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{ value: string }>()

const copied = ref(false)

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.value)
    ElMessage.success('已复制')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // fallback
    const textarea = document.createElement('textarea')
    textarea.value = props.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('已复制')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  }
}
</script>
