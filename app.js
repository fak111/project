const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
const User = require('./models/user');
const Questionnaire = require('./models/questionnaire');
const UserAdvice = require('./models/userAdvice');

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

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

app.use(bodyParser.json());

// 1.1 用户登录
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username, password } });
        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "登录失败：用户名或密码错误"
            });
        }

        res.status(200).json({
            status: 200,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    phone: user.phone,
                    createdAt: user.createdAt
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
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: "注册失败：用户名已存在"
            });
        }

        await User.create({ username, password, phone });
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
    const { userId, answers, updatedAt } = req.body;
    try {
        await sequelize.transaction(async (t) => {
            for (const [questionId, answer] of Object.entries(answers)) {
                await Questionnaire.upsert({
                    userId,
                    questionId,
                    answer,
                    updatedAt: updatedAt || new Date()
                }, { transaction: t });
            }
        });

        res.status(200).json({
            status: 200,
            message: "保存成功"
        });
    } catch (error) {
        console.error('保存答案错误:', error);
        res.status(500).json({
            status: 500,
            message: "保存失败：服务器错误"
        });
    }
});

// 2.2 获取问卷答案
app.get('/questionnaire/:userId', async (req, res) => {
    try {
        const answers = await Questionnaire.findAll({
            where: { userId: req.params.userId },
            raw: true
        });

        const formattedAnswers = answers.reduce((acc, curr) => {
            acc[curr.questionId] = curr.answer;
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

app.listen(PORT, HOST, () => {
    console.log(`Server is running on ${HOST}:${PORT}`);
    console.log(`Backend URL: http://localhost:${PORT}`);
    console.log('CORS: Allowing all origins');

    connectDB().then(() => {
        console.log('Database connected');
    }).catch(err => {
        console.error('Database connection error:', err);
    });
});
