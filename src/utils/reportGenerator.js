import axios from 'axios';
import { generateReportPrompt } from './reportPrompt';

/**
 * 通过调用GPT接口生成AI报告
 * @param {Object} questionnaireData - 问卷数据
 * @returns {Promise<string>} 生成的报告内容
 */
export async function fetchReport(questionnaireData) {
    const prompt = generateReportPrompt(questionnaireData);
    try {
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            messages: [
                {
                    role: "system",
                    content: "你是一个专业的职业规划分析师。请严格按照用户提供的JSON格式返回内容，不要添加任何额外的markdown标记或说明。确保返回的是一个有效的JSON对象。"
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "deepseek-chat",
            temperature: 0.7,
            max_tokens: 2000
        }, {
            headers: {
                'Authorization': `Bearer sk-f99e474cae5440618f7bf5259af08c62`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].message.content;

        // 尝试清理和解析返回的内容
        let cleanContent = content;
        // 移除可能的markdown标记
        if (cleanContent.includes('```json')) {
            cleanContent = cleanContent.replace(/```json\n|\n```/g, '');
        }

        // 验证JSON格式
        try {
            JSON.parse(cleanContent);
            return cleanContent;
        } catch (parseError) {
            console.error('JSON解析错误:', parseError);
            throw new Error('AI返回的内容格式不正确');
        }
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}
