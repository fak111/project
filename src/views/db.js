import mysql from 'mysql2/promise';

// 数据库连接配置
export const dbConfig = {
    host: '124.70.213.60',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'mysql',  // 默认连接到mysql数据库
    connectTimeout: 60000,  // 增加到60秒
    ssl: false,  // 禁用SSL
    debug: ['ComQueryPacket', 'RowDataPacket'],  // 详细的调试信息
    trace: true,  // 启用跟踪
    multipleStatements: true,  // 允许多语句查询
    supportBigNumbers: true,
    bigNumberStrings: true
};

// 测试数据库连接的函数
export async function testConnection() {
    let connection;
    try {
        console.log('正在尝试连接到数据库...');
        console.log('连接配置:', { ...dbConfig, password: '****' });

        // 尝试创建连接
        connection = await mysql.createConnection({
            ...dbConfig,
            authPlugins: {
                mysql_native_password: () => () => Buffer.from(dbConfig.password + '\0')
            }
        });

        console.log('数据库连接成功！');

        // 执行一个简单的查询来测试连接
        console.log('执行测试查询...');
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log('测试查询结果:', rows[0].result);

        return true;
    } catch (error) {
        console.error('数据库连接错误:', error.message);
        if (error.code) {
            console.error('错误代码:', error.code);
        }
        if (error.errno) {
            console.error('错误号:', error.errno);
        }
        if (error.sqlState) {
            console.error('SQL状态:', error.sqlState);
        }
        if (error.sqlMessage) {
            console.error('SQL消息:', error.sqlMessage);
        }
        console.error('完整错误对象:', error);
        return false;
    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('数据库连接已关闭');
            } catch (err) {
                console.error('关闭连接时出错:', err.message);
            }
        }
    }
}
