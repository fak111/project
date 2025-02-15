import { testConnection } from './src/views/db.js';

// 执行测试连接
console.log('开始测试数据库连接...');
testConnection()
    .then(result => {
        if (result) {
            console.log('测试完成：连接成功！');
        } else {
            console.log('测试完成：连接失败！');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('测试过程中发生错误：', err);
        process.exit(1);
    });
