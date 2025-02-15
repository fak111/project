const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TrackEvent = sequelize.define('TrackEvent', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    event_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '事件名称'
    },
    project_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '项目ID'
    },
    user_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '用户ID'
    },
    timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '事件发生时间戳'
    },
    browser: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '浏览器信息'
    },
    os: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '操作系统信息'
    }
}, {
    tableName: 'track_events',
    indexes: [
        {
            fields: ['event_name']
        },
        {
            fields: ['project_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['timestamp']
        }
    ]
});

module.exports = TrackEvent;
