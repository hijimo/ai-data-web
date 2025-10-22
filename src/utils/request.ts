import { message } from 'antd'
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import cookies from 'js-cookie'
import { logError, parseError } from '@/utils/errorHandler'
import type { ResponseData } from '@/types'

export const TOKEN_KEY = 'token'
console.log('import.meta.env.VITE_API_BASE_URL', import.meta.env)
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // baseURL: '/api/v1/',
  timeout: 10000,
})

// 不需要显示错误提示的 URL 列表
const noNotifyList: string[] = []

/**
 * 统一的错误处理函数
 */
const errorHandler = (error: AxiosError | Error, context?: string): void => {
  const errorInfo = parseError(error)
  logError(error, context)

  // 检查是否需要显示错误提示
  const shouldNotify = !noNotifyList.some((url) =>
    (error as AxiosError).config?.url?.includes(url),
  )

  if (!shouldNotify) {
    return
  }

  // 根据错误类型显示不同的提示
  switch (errorInfo.type) {
    case 'network':
      message.error({
        content: '网络连接失败，请检查网络连接',
        duration: 4,
      })
      break
    case 'api':
      if (errorInfo.code === 401 || errorInfo.code === 403) {
        message.error({
          content: '登录已过期，请重新登录',
          duration: 3,
        })
      } else {
        message.error({
          content: errorInfo.message || '服务器响应异常',
          duration: 4,
        })
      }
      break
    default:
      message.error({
        content: errorInfo.message || '请求失败，请稍后重试',
        duration: 4,
      })
      break
  }
}

request.interceptors.request.use((config) => {
  const authorization = localStorage.getItem(TOKEN_KEY)

  // Authorization: cookies.get('Authorization')!,
  //       'droplet-device-id': cookies.get('droplet-device-id')!,
  // const authorization = cookies.get('Authorization');
  const deviceId = cookies.get('droplet-device-id')

  if (authorization) {
    config.headers.Authorization = authorization
  }
  if (deviceId) {
    config.headers['droplet-device-id'] = deviceId
  }

  return config
})

request.interceptors.response.use(
  (res) => {
    const {
      message: messageStr,
      code,
      result,
    } = (res.data as unknown as ResponseData) || {}
    if (code !== 0) {
      // 创建业务错误
      const error = new Error(messageStr || '业务处理失败')
      ;(error as any).code = code
      ;(error as any).result = result

      errorHandler(error, `API 业务错误: ${res.config?.url}`)
      throw error
    }
    return res.data
  },
  (axiosError: AxiosError) => {
    // 处理 HTTP 错误
    errorHandler(axiosError, `HTTP 请求错误: ${axiosError.config?.url}`)
    throw axiosError
  },
)

/**
 * 将分页参数转换为后端需要的格式
 * @param params 包含 pageNo, pageSize 和其他参数的对象
 * @returns 转换后的参数对象
 */
export const transformPaginationParams = <T extends Record<string, unknown>>(
  params: T & { pageNo: number; pageSize: number },
): Omit<T, 'pageNo' | 'pageSize'> & {
  search_info: {
    page_info: {
      page: number
      page_size: number
    }
  }
} => {
  const { pageNo, pageSize, ...otherParams } = params

  return {
    ...otherParams,
    search_info: {
      page_info: {
        page: pageNo,
        page_size: pageSize,
      },
    },
  }
}

// 自定义 request 函数，返回正确的类型
const customRequest = async <T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await request(url, config)
  return response as T
}

export default customRequest
