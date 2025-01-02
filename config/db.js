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
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
