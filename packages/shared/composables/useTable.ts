import { ref, reactive } from 'vue'
import { apiClient } from '../api/client'
import type { PaginatedResponse } from '../api/types'

export function useTable<T>(url: string) {
  const tableData = ref<T[]>([]) as { value: T[] }
  const loading = ref(false)
  const pagination = reactive({
    page: 1,
    size: 20,
    total: 0,
  })
  const searchParams = ref<Record<string, any>>({})

  async function fetchData() {
    loading.value = true
    try {
      const res = (await apiClient.get(url, {
        params: {
          page: pagination.page,
          size: pagination.size,
          ...searchParams.value,
        },
      })) as unknown as PaginatedResponse<T>
      tableData.value = res.list || []
      pagination.total = res.total || 0
    } catch (e: any) {
      console.error('fetchData error:', e.message)
    } finally {
      loading.value = false
    }
  }

  function handlePageChange(page: number) {
    pagination.page = page
    fetchData()
  }

  function handleSizeChange(size: number) {
    pagination.size = size
    pagination.page = 1
    fetchData()
  }

  function handleSearch(params: Record<string, any>) {
    searchParams.value = params
    pagination.page = 1
    fetchData()
  }

  function handleReset() {
    searchParams.value = {}
    pagination.page = 1
    fetchData()
  }

  return {
    tableData,
    loading,
    pagination,
    searchParams,
    fetchData,
    handlePageChange,
    handleSizeChange,
    handleSearch,
    handleReset,
  }
}
