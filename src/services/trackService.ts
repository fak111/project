import axios from 'axios';
import { EventName, EventParams, createTrackSDK } from '../utils/trackSDK';
import { API_URL } from '../config/api';

// 控制台样式配置
const consoleStyles = {
    event: 'color: #4f46e5; font-weight: bold; font-size: 14px;',
    params: 'color: #10b981; font-size: 12px;',
    time: 'color: #6b7280; font-size: 12px;',
    error: 'color: #ef4444; font-weight: bold; font-size: 14px;'
};

// 获取用户信息
const getUserInfo = () => {
    return {
        browser: navigator.userAgent,
        os: navigator.platform,
        uid: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : 'anonymous',
        timestamp: Date.now()
    };
};

// 发送埋点数据到服务器的函数
const sendTrackData = async (eventName: EventName, params: EventParams) => {
    try {
        // 打印事件信息
        console.group('%c🔍 Track Event', 'background: #f8fafc; color: #1e293b; font-size: 16px; padding: 4px 8px; border-radius: 4px;');
        console.log('%c事件名称: %s', consoleStyles.event, eventName);
        console.log('%c事件参数:', consoleStyles.params, params);
        console.log('%c发送时间: %s', consoleStyles.time, new Date().toLocaleString());
        console.groupEnd();

        // 构造请求数据
        const trackData = {
            event_name: eventName,
            project_id: 'life_qa_frontend',
            timestamp: Date.now(),
            user_info: getUserInfo(),
            ...params  // 其他参数作为额外参数传递
        };

        console.log('准备发送埋点数据:', trackData); // 调试日志

        // 发送到服务器
        const response = await axios.post(`${API_URL}/track`, trackData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // 打印发送结果
        if (response.status === 200) {
            console.log('%c✅ 埋点发送成功', 'color: #10b981; font-weight: bold;', response.data);
        }
    } catch (error) {
        // 打印错误信息
        console.group('%c❌ Track Error', 'background: #fef2f2; color: #991b1b; font-size: 16px; padding: 4px 8px; border-radius: 4px;');
        console.log('%c事件名称: %s', consoleStyles.error, eventName);
        console.log('%c事件参数:', consoleStyles.error, params);
        console.error('错误信息:', error);
        console.groupEnd();
    }
};

// 创建埋点SDK实例
export const trackSDK = createTrackSDK(sendTrackData);

// 初始化SDK
trackSDK.init({
    project_id: 'life_qa_frontend',
    upload_percent: 100
});

// 打印初始化成功信息
console.log('%c🚀 Track SDK 初始化成功', 'background: #4f46e5; color: white; font-size: 14px; padding: 4px 8px; border-radius: 4px;');
