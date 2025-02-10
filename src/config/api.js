// API 地址配置
const API_BASE_URLS = {
    production: 'https://rayqahnrrwmp.sealoshzh.site',
    development: 'https://rayqahnrrwmp.sealoshzh.site'
}

// 获取当前环境的 API 地址
export const getApiBaseUrl = () => {
    return API_BASE_URLS.production
}

// 导出 API 地址
export const API_URL = getApiBaseUrl()


// config.js

export const config = {
  apiKey: "sk-ca70f64c96304d699da69df4ad0d8c5f", // 替换为你的 API Key
  baseURL: "https://api.deepseek.com", // Base URL
};
