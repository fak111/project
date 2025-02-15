/* reportFormatter.js */

/**
 * 通用报告格式化工具
 * @typedef {Object} FormatConfig
 * @property {Object} variableMap - 变量映射表
 * @property {Object} sectionFormatters - 自定义部分格式化函数
 * @property {Object} templates - 自定义模板
 */

/**
 * 格式化报告内容
 * @param {Object|string} content - 原始报告数据，格式为：
 * {
 *   report: {
 *     关键词分析: {
 *       价值观: string[],
 *       才能: string[],
 *       理想: string[]
 *     },
 *     职业方向建议: string[],
 *     推荐职业: {
 *       职位名称: string,
 *       匹配理由: string[]
 *     }
 *   }
 * }
 * @returns {string} 格式化后的报告内容
 */
export function formatReportContent(content) {
    try {
        const reportData = typeof content === 'string' ? JSON.parse(content) : content;
        const report = reportData?.report;

        if (!report) {
            throw new Error('无效的报告数据格式');
        }

        const {
            关键词分析: keywords = {},
            职业方向建议: careers = [],
            推荐职业: recommendation = {}
        } = report;

        // 格式化关键词分析部分
        const formatKeywords = (keywordObj) => {
            const sections = Object.entries(keywordObj).map(([category, words]) => {
                const wordsList = words.map(word => `    • ${word}`).join('\n');
                return `【${category}分析】\n${wordsList}`;
            });
            return sections.join('\n\n');
        };

        // 格式化职业方向建议
        const formatCareers = (careerList) => {
            if (careerList.length === 0) return '';
            return careerList
                .map((career, index) => `    ${index + 1}. ${career}`)
                .join('\n');
        };

        // 格式化推荐职业部分
        const formatRecommendation = (rec) => {
            const { 职位名称 = '', 匹配理由 = [] } = rec;
            const reasons = 匹配理由.map(reason => `    • ${reason}`).join('\n');
            return `★ 最佳匹配职位：${职位名称}\n\n匹配依据：\n${reasons}`;
        };

        // 分隔线
        const divider = '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        // 标题部分
        const title = '\n                    职业发展分析报告';

        // 各个部分
        const section1 = `一、核心特质分析\n\n${formatKeywords(keywords)}`;
        const section2 = `二、职业发展方向\n\n${formatCareers(careers)}`;
        const section3 = `三、最佳职业推荐\n\n${formatRecommendation(recommendation)}`;
        const ending = '                       报告完成';

        // 组装最终报告
        return `${divider}${section1}${divider}${section2}${divider}${section3}${divider}${ending}\n`;
    } catch (error) {
        console.error('格式化报告内容时出错:', error);
        return '报告生成失败，请重试';
    }
}
