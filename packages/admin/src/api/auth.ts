import { apiClient } from '@sup/shared'

export interface LoginResponse {
  token: string
}

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  return apiClient.post('/admin/login', { username, password }) as unknown as LoginResponse
}
