// API 地址配置
const API_BASE_URLS = {
  production: 'http://localhost:3001',  // 如果需要的话，这里可以改回生产环境的地址
  development: '/api'  // 开发环境使用代理
}

// 获取当前环境的 API 地址
export const getApiBaseUrl = () => {
  const env = import.meta.env.MODE
  return API_BASE_URLS[env] || API_BASE_URLS.development
}

// 导出 API 地址
export const API_URL = getApiBaseUrl()


// config.js

export const config = {
  apiKey: "sk-ca70f64c96304d699da69df4ad0d8c5f", // 替换为你的 API Key
  baseURL: "https://api.deepseek.com", // Base URL
};
