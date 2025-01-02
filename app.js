const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
const User = require('./models/user');
const Questionnaire = require('./models/questionnaire');

const app = express();

// 允许所有地址访问的 CORS 配置
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');  // 允许所有来源
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }

    next();
});

app.use(bodyParser.json());

// 添加详细的请求日志，帮助调试
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Origin:', req.headers.origin);
    console.log('Headers:', req.headers);
    next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 500,
        message: '服务器内部错误',
        data: null,
        error: {
            type: err.name,
            detail: err.message
        },
        timestamp: new Date().toISOString()
    });
});

// 连接数据库
connectDB();

// 注册接口
app.post('/register', async (req, res) => {
    const { username, password, phone } = req.body;

    try {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: "注册失败：用户名已存在",
                data: null,
                timestamp: new Date().toISOString()
            });
        }

        const user = await User.create({ username, password, phone });

        res.status(201).json({
            status: 201,
            message: "注册成功",
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    phone: user.phone,
                    createdAt: user.createdAt
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            status: 500,
            message: `注册失败：${error.message}`,
            data: null,
            error: {
                type: error.name,
                detail: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// 登录接口
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username, password } });
        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "登录失败：用户名或密码错误",
                data: null,
                timestamp: new Date().toISOString()
            });
        }

        res.status(200).json({
            status: 200,
            message: "登录成功",
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    phone: user.phone,
                    createdAt: user.createdAt
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            status: 500,
            message: `登录失败：${error.message}`,
            data: null,
            error: {
                type: error.name,
                detail: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// 获取问卷数据接口
app.get('/questionnaire/:userId', async (req, res) => {
    try {
        const answers = await Questionnaire.findAll({
            where: { userId: req.params.userId }
        });

        const formattedAnswers = answers.reduce((acc, curr) => {
            acc[curr.questionId] = curr.answer;
            return acc;
        }, {});

        res.status(200).json({
            status: 200,
            message: "获取成功",
            data: {
                answers: formattedAnswers
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('获取问卷错误:', error);
        res.status(500).json({
            status: 500,
            message: `获取失败：${error.message}`,
            data: null,
            error: {
                type: error.name,
                detail: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// 保存问卷数据接口
app.post('/questionnaire/save', async (req, res) => {
    const { userId, answers } = req.body;

    try {
        // 使用事务确保数据一致性
        await sequelize.transaction(async (t) => {
            for (const [questionId, answer] of Object.entries(answers)) {
                // 使用 upsert 来更新或插入记录
                // 如果记录存在就更新，不存在就创建
                await Questionnaire.upsert({
                    userId,
                    questionId,
                    answer,
                    updatedAt: new Date()
                }, {
                    transaction: t,
                    where: {
                        userId,
                        questionId
                    }
                });
            }
        });

        res.status(200).json({
            status: 200,
            message: "保存成功",
            data: { success: true },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('保存答案错误:', error);
        res.status(500).json({
            status: 500,
            message: `保存失败：${error.message}`,
            data: null,
            error: {
                type: error.name,
                detail: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Debug 接口
app.get('/debug/questionnaires', async (req, res) => {
    try {
        const questionnaires = await Questionnaire.findAll();
        res.json(questionnaires);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/debug/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 查询用户信息接口
app.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id },
            attributes: ['id', 'username', 'phone', 'createdAt'] // 排除密码字段
        });

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "查询失败：用户不存在",
                data: null,
                timestamp: new Date().toISOString()
            });
        }

        res.status(200).json({
            status: 200,
            message: "查询成功",
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    phone: user.phone,
                    createdAt: user.createdAt
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('查询用户错误:', error);
        res.status(500).json({
            status: 500,
            message: `查询失败：${error.message}`,
            data: null,
            error: {
                type: error.name,
                detail: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// 清空问卷数据接口（仅用于开发环境）
app.delete('/debug/questionnaires/clear', async (req, res) => {
    try {
        await Questionnaire.destroy({
            where: {},  // 空条件表示删除所有记录
            truncate: true  // 使用 truncate 可以更快地清空表
        });

        res.status(200).json({
            status: 200,
            message: "问卷数据已清空",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('清空数据错���:', error);
        res.status(500).json({
            status: 500,
            message: `清空失败：${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
});

// 启动服务器
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
