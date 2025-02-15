// API 地址配置
const API_BASE_URLS = {
  production: '/api',  // 生产环境使用相对路径
  development: '/api'  // 开发环境使用相对路径
}

// 获取当前环境的 API 地址
export const getApiBaseUrl = () => {
  const env = import.meta.env.MODE
  return API_BASE_URLS[env] || API_BASE_URLS.development
}

// 导出 API 地址
export const API_URL = API_BASE_URLS.development

// API 请求配置
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
}

// config.js

export const config = {
  apiKey: "sk-ca70f64c96304d699da69df4ad0d8c5f", // 替换为你的 API Key
  baseURL: "https://api.deepseek.com", // Base URL
};
