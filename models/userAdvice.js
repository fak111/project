const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');  // 导入 User 模型

const UserAdvice = sequelize.define('UserAdvice', {
    userid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    advice: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'user_advice',
    timestamps: false
});

// 建立关联关系
UserAdvice.belongsTo(User, {
    foreignKey: 'userid',
    targetKey: 'id'
});

module.exports = UserAdvice;
