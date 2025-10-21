/**
 * 错误处理工具函数
 * 提供统一的错误处理和用户友好的错误信息
 */

export interface ErrorInfo {
  message: string;
  type: 'network' | 'api' | 'auth' | 'microapp' | 'unknown';
  code?: string | number;
  details?: string;
}

/**
 * 解析错误信息，返回用户友好的错误描述
 */
export const parseError = (error: unknown): ErrorInfo => {
  // 网络错误
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: '网络连接失败，请检查网络连接后重试',
      type: 'network',
      details: error.message,
    };
  }

  // API 错误
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const apiError = error as { code: number; message: string };
    return {
      message: apiError.message || '服务器响应异常',
      type: 'api',
      code: apiError.code,
    };
  }

  // 认证错误
  if (error instanceof Error) {
    if (
      error.message.includes('token') ||
      error.message.includes('认证') ||
      error.message.includes('登录')
    ) {
      return {
        message: '身份验证失败，请重新登录',
        type: 'auth',
        details: error.message,
      };
    }

    // 微前端加载错误
    if (error.message.includes('微前端') || error.message.includes('子应用')) {
      return {
        message: '应用加载失败，请稍后重试',
        type: 'microapp',
        details: error.message,
      };
    }

    return {
      message: error.message,
      type: 'unknown',
    };
  }

  // 未知错误
  return {
    message: '发生未知错误，请稍后重试',
    type: 'unknown',
    details: String(error),
  };
};

/**
 * 记录错误日志
 */
export const logError = (error: unknown, context?: string) => {
  const errorInfo = parseError(error);
  const logMessage = `[${errorInfo.type.toUpperCase()}] ${context ? `${context}: ` : ''}${errorInfo.message}`;

  if (errorInfo.details) {
    console.error(logMessage, errorInfo.details);
  } else {
    console.error(logMessage);
  }

  // 在生产环境中，这里可以发送错误到监控服务
  if (process.env.NODE_ENV === 'production') {
    // TODO: 发送错误到监控服务
  }
};

/**
 * 检查是否为网络错误
 */
export const isNetworkError = (error: unknown): boolean => {
  return parseError(error).type === 'network';
};

/**
 * 检查是否为认证错误
 */
export const isAuthError = (error: unknown): boolean => {
  return parseError(error).type === 'auth';
};

/**
 * 获取重试建议
 */
export const getRetryAdvice = (errorInfo: ErrorInfo): string => {
  switch (errorInfo.type) {
    case 'network':
      return '请检查网络连接，然后点击重试';
    case 'api':
      return '服务暂时不可用，请稍后重试';
    case 'auth':
      return '请重新登录后再试';
    case 'microapp':
      return '应用加载失败，请刷新页面或稍后重试';
    default:
      return '请刷新页面或稍后重试';
  }
};
