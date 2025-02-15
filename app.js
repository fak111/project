import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { query, pool, initDB } from './config/db.js';

const app = express();

// CORS 配置 - 允许所有源访问
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// 先使用 body-parser
app.use(bodyParser.json());

// 请求日志中间件
app.use((req, res, next) => {
    console.log('\n=== 新请求开始 ===');
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('=== 请求信息结束 ===\n');
    next();
});

// 注释掉埋点路由
// app.use('/track', trackRouter);

// 1.1 用户登录
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const users = await query(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({
                status: 401,
                message: "登录失败：用户名或密码错误"
            });
        }

        const user = users[0];
        res.status(200).json({
            status: 200,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    phone: user.phone,
                    createdAt: user.created_at
                }
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            status: 500,
            message: "登录失败：服务器错误"
        });
    }
});

// 1.2 用户注册
app.post('/register', async (req, res) => {
    const { username, password, phone } = req.body;
    try {
        // 检查用户名是否已存在
        const existingUsers = await query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "注册失败：用户名已存在"
            });
        }

        // 创建新用户
        await query(
            'INSERT INTO users (username, password, phone) VALUES (?, ?, ?)',
            [username, password, phone]
        );

        res.status(201).json({
            status: 201,
            message: "注册成功"
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            status: 500,
            message: "注册失败：服务器错误"
        });
    }
});

// 2.1 保存问卷答案
app.post('/questionnaire/save', async (req, res) => {
    console.log('收到保存问卷请求:', req.body);
    const { userId, answers, updatedAt } = req.body;

    // 验证请求数据
    if (!userId || !answers || !updatedAt) {
        console.error('缺少必要的请求参数:', { userId, answers, updatedAt });
        return res.status(400).json({
            status: 400,
            success: false,
            message: "保存失败：缺少必要的参数"
        });
    }

    try {
        // 将ISO格式的日期时间转换为MySQL格式
        const formattedDate = new Date(updatedAt).toISOString().slice(0, 19).replace('T', ' ');
        console.log('格式化后的日期:', formattedDate);

        // 使用事务保证数据一致性
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            console.log('开始保存答案...');
            for (const [questionId, answer] of Object.entries(answers)) {
                console.log('保存问题答案:', { questionId, answer });
                await connection.query(
                    `INSERT INTO questionnaires (user_id, question_id, answer, updated_at)
                     VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE answer = ?, updated_at = ?`,
                    [
                        userId,
                        questionId,
                        answer,
                        formattedDate,
                        answer,
                        formattedDate
                    ]
                );
            }

            await connection.commit();
            connection.release();
            console.log('保存成功');

            res.status(200).json({
                status: 200,
                success: true,
                message: "保存成功"
            });
        } catch (err) {
            console.error('事务执行错误:', err);
            await connection.rollback();
            connection.release();
            throw err;
        }
    } catch (error) {
        console.error('保存答案错误:', error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "保存失败：服务器错误",
            error: error.message
        });
    }
});

// 2.2 获取问卷答案
app.get('/questionnaire/:userId', async (req, res) => {
    try {
        const answers = await query(
            'SELECT question_id, answer FROM questionnaires WHERE user_id = ?',
            [req.params.userId]
        );

        const formattedAnswers = answers.reduce((acc, curr) => {
            acc[curr.question_id] = curr.answer;
            return acc;
        }, {});

        res.status(200).json({
            status: 200,
            data: {
                answers: formattedAnswers
            }
        });
    } catch (error) {
        console.error('获取答案错误:', error);
        res.status(500).json({
            status: 500,
            message: "获取失败：服务器错误"
        });
    }
});

// 3.1 提交好友回答
app.post('/friend-response', async (req, res) => {
    const { shareId, questionId, friendName, answers, createdAt } = req.body;
    try {
        // 这里需要实现好友回答的逻辑
        await query(
            `INSERT INTO friend_responses (share_id, question_id, friend_name, answers, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [shareId, questionId, friendName, JSON.stringify(answers), createdAt || new Date()]
        );

        res.status(200).json({
            status: 200,
            message: "提交成功"
        });
    } catch (error) {
        console.error('提交好友回答错误:', error);
        res.status(500).json({
            status: 500,
            message: "提交失败：服务器错误"
        });
    }
});

// 启动服务器
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

// 先初始化数据库，然后启动服务器
initDB().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`Server is running on ${HOST}:${PORT}`);
        console.log(`Backend URL: http://localhost:${PORT}`);
        console.log('CORS: Allowing all origins');
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
