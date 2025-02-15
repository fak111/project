const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const TrackEvent = require('./trackEvent');

const ErrorLog = sequelize.define('ErrorLog', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    event_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '关联的事件ID'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '错误信息'
    },
    source: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '错误来源文件'
    },
    line_no: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '错误行号'
    },
    col_no: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '错误列号'
    },
    stack_trace: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '错误堆栈信息'
    }
}, {
    tableName: 'error_logs',
    indexes: [
        {
            fields: ['event_id']
        }
    ]
});

// 建立外键关联
ErrorLog.belongsTo(TrackEvent, {
    foreignKey: 'event_id',
    as: 'event'
});

module.exports = ErrorLog;
