import { ref } from 'vue'
import { apiClient } from '../api/client'

export function useRequest<T>(url: string, options?: any) {
  const data = ref<T | null>(null) as { value: T | null }
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function execute(params?: any) {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.request({ url, ...options, params })
      data.value = res as any
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
