// API 地址配置
const API_BASE_URLS = {
    production: 'https://vpyqxaztqgkr.sealoshzh.site',
    development: 'https://vpyqxaztqgkr.sealoshzh.site'
}

// 获取当前环境的 API 地址
export const getApiBaseUrl = () => {
    return API_BASE_URLS.production
}

// 导出 API 地址
export const API_URL = getApiBaseUrl()
