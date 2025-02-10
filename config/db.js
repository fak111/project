const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('questionnaire_db', 'root', 'ljld4cs9', {
    host: 'lfmq-mysql.ns-okcso68c.svc',
    port: 3306,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    retry: {
        max: 3,  // 最大重试次数
        timeout: 3000  // 超时时间
    },
    dialectOptions: {
        connectTimeout: 60000
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL connected successfully');
        // 同步所有模型
        await sequelize.sync();
        console.log('All models were synchronized successfully');
    } catch (error) {
        console.error('MySQL connection error:', error);
        // 不要立即退出，给出重试机会
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = { sequelize, connectDB };
