// FILE: app/composables/useApi.ts
// PURPOSE: Wrapper for backend API requests with error handling and auth headers.
// TODO:
//   - Add auth token to requests automatically
//   - Handle common error responses
//   - Provide typed fetch methods

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface ApiOptions<T = any> {
  method?: HttpMethod
  body?: T
  params?: Record<string, string | number | boolean>
  headers?: Record<string, string>
}

interface ApiError {
  statusCode: number
  message: string
  data?: any
}

export function useApi() {
  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  const baseUrl = '/api' // Nuxt server routes

  // ---------------------------------------------------------------------------
  // Methods
  // ---------------------------------------------------------------------------

  /**
   * Make an API request
   * TODO: Add authentication headers from useAuth
   */
  async function request<TResponse = any, TBody = any>(
    endpoint: string,
    options: ApiOptions<TBody> = {}
  ): Promise<TResponse> {
    const { method = 'GET', body, params, headers = {} } = options
    
    try {
      // TODO: Get auth token from useAuth
      // const { user } = useAuth()
      // if (user.value) {
      //   headers['Authorization'] = `Bearer ${token}`
      // }
      
      const response = await $fetch<TResponse>(`${baseUrl}${endpoint}`, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        params,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      })
      
      return response
      
    } catch (error: any) {
      // Handle fetch errors
      const apiError: ApiError = {
        statusCode: error.statusCode || 500,
        message: error.message || 'An error occurred',
        data: error.data,
      }
      
      // TODO: Handle 401 unauthorized (redirect to login)
      // if (apiError.statusCode === 401) {
      //   await useAuth().signOut()
      //   navigateTo('/login')
      // }
      
      throw apiError
    }
  }

  /**
   * GET request
   */
  function get<T = any>(endpoint: string, params?: Record<string, string | number | boolean>) {
    return request<T>(endpoint, { method: 'GET', params })
  }

  /**
   * POST request
   */
  function post<T = any, B = any>(endpoint: string, body?: B) {
    return request<T, B>(endpoint, { method: 'POST', body })
  }

  /**
   * PUT request
   */
  function put<T = any, B = any>(endpoint: string, body?: B) {
    return request<T, B>(endpoint, { method: 'PUT', body })
  }

  /**
   * DELETE request
   */
  function del<T = any>(endpoint: string) {
    return request<T>(endpoint, { method: 'DELETE' })
  }

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  return {
    request,
    get,
    post,
    put,
    delete: del,
  }
}
