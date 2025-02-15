// API 地址配置
const API_BASE_URLS = {
  production: 'http://124.70.213.60:3001',  // 生产环境地址
  development: 'http://124.70.213.60:3001'  // 开发环境地址
}

// 获取当前环境的 API 地址
export const getApiBaseUrl = () => {
  const env = import.meta.env.MODE
  return API_BASE_URLS[env] || API_BASE_URLS.development
}

// 导出 API 地址
export const API_URL = API_BASE_URLS.development


// config.js

export const config = {
  apiKey: "sk-ca70f64c96304d699da69df4ad0d8c5f", // 替换为你的 API Key
  baseURL: "https://api.deepseek.com", // Base URL
};
