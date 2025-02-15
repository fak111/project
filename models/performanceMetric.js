const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const TrackEvent = require('./trackEvent');

const PerformanceMetric = sequelize.define('PerformanceMetric', {
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
    fp: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'First Paint 时间'
    },
    fcp: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'First Contentful Paint 时间'
    }
}, {
    tableName: 'performance_metrics',
    indexes: [
        {
            fields: ['event_id']
        }
    ]
});

// 建立外键关联
PerformanceMetric.belongsTo(TrackEvent, {
    foreignKey: 'event_id',
    as: 'event'
});

module.exports = PerformanceMetric;
