<template>
  <div class="secret-reveal">
    <el-alert type="warning" :closable="false" show-icon>
      <template #title>⚠️ 重要提示：以下密钥仅显示一次，请立即保存</template>
    </el-alert>
    <div class="secret-reveal__credentials">
      <CredentialRow label="AppId" :value="appId" />
      <CredentialRow label="AppSecret" :value="appSecret" />
    </div>
    <el-checkbox v-model="confirmed" class="secret-reveal__confirm">
      我已妥善保管以上凭证
    </el-checkbox>
    <el-button type="primary" :disabled="!confirmed" @click="$emit('done')">
      完成，返回列表
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CredentialRow from './CredentialRow.vue'

defineProps<{
  appId: string
  appSecret: string
}>()

defineEmits<{
  (e: 'done'): void
}>()

const confirmed = ref(false)
</script>

<style scoped>
.secret-reveal {
  max-width: 600px;
}
.secret-reveal__credentials {
  margin: 20px 0;
}
.secret-reveal__confirm {
  margin: 16px 0;
}
</style>
