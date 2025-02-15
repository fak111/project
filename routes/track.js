import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// 处理埋点数据
router.post('/', async (req, res) => {
    const { event_name, project_id, timestamp, user_info, ...extraParams } = req.body;

    try {
        // 创建事件记录
        const [result] = await query(
            `INSERT INTO track_events (event_name, project_id, timestamp, user_id, browser, os)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                event_name,
                project_id || 'life_qa_frontend',
                timestamp,
                user_info?.uid,
                user_info?.browser || req.headers['user-agent'],
                user_info?.os || req.headers['sec-ch-ua-platform'] || 'unknown'
            ]
        );

        const eventId = result.insertId;

        // 处理额外参数
        const detailPromises = Object.entries(extraParams)
            .filter(([key, value]) => value !== undefined && !['event_name', 'project_id', 'timestamp', 'user_info'].includes(key))
            .map(([key, value]) => {
                return query(
                    `INSERT INTO track_event_details (event_id, param_key, param_value)
                     VALUES (?, ?, ?)`,
                    [eventId, key, JSON.stringify(value)]
                );
            });

        // 处理性能指标
        if (event_name === 'performance_metrics') {
            await query(
                `INSERT INTO performance_metrics (event_id, fp, fcp)
                 VALUES (?, ?, ?)`,
                [eventId, extraParams.fp, extraParams.fcp]
            );
        }

        // 处理错误日志
        if (event_name === 'error_event') {
            await query(
                `INSERT INTO error_logs (event_id, message, source, line_no, col_no, stack_trace)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    eventId,
                    extraParams.message || extraParams.reason,
                    extraParams.source,
                    extraParams.lineno,
                    extraParams.colno,
                    extraParams.stack
                ]
            );
        }

        // 处理登录失败事件
        if (event_name === 'login_failed' && extraParams.error) {
            await query(
                `INSERT INTO error_logs (event_id, message, source)
                 VALUES (?, ?, ?)`,
                [eventId, extraParams.error, 'login']
            );
        }

        // 处理注册失败事件
        if (event_name === 'register_failed' && extraParams.error) {
            await query(
                `INSERT INTO error_logs (event_id, message, source)
                 VALUES (?, ?, ?)`,
                [eventId, extraParams.error, 'register']
            );
        }

        // 处理问卷相关事件
        if (event_name === 'questionnaire_start') {
            await query(
                `INSERT INTO track_event_details (event_id, param_key, param_value)
                 VALUES (?, ?, ?)`,
                [eventId, 'start_time', JSON.stringify(Date.now())]
            );
        }

        if (event_name === 'questionnaire_save') {
            const answersCount = Object.keys(extraParams.answers || {}).length;
            await query(
                `INSERT INTO track_event_details (event_id, param_key, param_value)
                 VALUES (?, ?, ?)`,
                [eventId, 'answers_count', JSON.stringify(answersCount)]
            );
        }

        if (event_name === 'questionnaire_submit') {
            const totalQuestions = 10; // 假设总共10个问题
            const answeredQuestions = Object.keys(extraParams.answers || {}).length;
            const completionRate = (answeredQuestions / totalQuestions) * 100;

            await query(
                `INSERT INTO track_event_details (event_id, param_key, param_value)
                 VALUES (?, ?, ?)`,
                [eventId, 'completion_rate', JSON.stringify(completionRate)]
            );

            if (extraParams.startTime) {
                const duration = Date.now() - extraParams.startTime;
                await query(
                    `INSERT INTO track_event_details (event_id, param_key, param_value)
                     VALUES (?, ?, ?)`,
                    [eventId, 'duration', JSON.stringify(duration)]
                );
            }
        }

        // 等待所有详情记录创建完成
        await Promise.all(detailPromises);

        res.status(200).json({
            success: true,
            message: '埋点数据接收成功',
            data: {
                event_id: eventId
            }
        });
    } catch (error) {
        console.error('埋点数据处理错误:', error);
        res.status(500).json({
            success: false,
            message: '埋点数据处理失败',
            error: error.message
        });
    }
});

export default router;
