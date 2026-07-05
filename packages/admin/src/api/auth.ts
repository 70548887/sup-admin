import { apiClient } from '@sup/shared'

export interface LoginResponse {
  token: string
}

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  return apiClient.post('/auth/login', { username, password, role: 'admin' }) as unknown as LoginResponse
}
