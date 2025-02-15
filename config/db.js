import mysql from 'mysql2/promise';

// 数据库连接配置
export const dbConfig = {
    host: '124.70.213.60',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'lfmq',  // 改为新的数据库名
    connectTimeout: 60000,
    ssl: false,
    debug: ['ComQueryPacket', 'RowDataPacket'],
    trace: true,
    multipleStatements: true,
    supportBigNumbers: true,
    bigNumberStrings: true
};

// 创建数据库连接池
export const pool = mysql.createPool({
    ...dbConfig,
    database: 'mysql'  // 先连接到 mysql 数据库以创建新数据库
});

// 测试连接并创建必要的表
export const initDB = async () => {
    try {
        // 获取连接以验证配置
        const connection = await pool.getConnection();
        console.log('MySQL connected successfully');

        // 创建数据库
        await connection.query(`CREATE DATABASE IF NOT EXISTS lfmq`);
        console.log('Database created or already exists');

        // 切换到新数据库
        await connection.query(`USE lfmq`);
        console.log('Switched to lfmq database');

        // 创建用户表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_username (username)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Users table created');

        // 创建问卷答案表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS questionnaires (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                question_id VARCHAR(50) NOT NULL,
                answer TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uk_user_question (user_id, question_id),
                INDEX idx_user_id (user_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Questionnaires table created');

        // 创建好友回答表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS friend_responses (
                id INT PRIMARY KEY AUTO_INCREMENT,
                share_id VARCHAR(50) NOT NULL,
                question_id VARCHAR(50) NOT NULL,
                friend_name VARCHAR(50) NOT NULL,
                answers TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_share_id (share_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Friend responses table created');

        connection.release();
        console.log('All tables were created successfully');

        // 重新创建连接池，使用新数据库
        pool.end();
        Object.assign(pool, mysql.createPool(dbConfig));
        console.log('Reconnected to lfmq database');

    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
};

// 执行查询的辅助函数
export const query = async (sql, params) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

export default {
    pool,
    query,
    initDB
};
