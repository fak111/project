const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const TrackEvent = require('./trackEvent');

const TrackEventDetail = sequelize.define('TrackEventDetail', {
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
    param_key: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '参数名'
    },
    param_value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '参数值'
    }
}, {
    tableName: 'track_event_details',
    indexes: [
        {
            fields: ['event_id']
        }
    ]
});

// 建立外键关联
TrackEventDetail.belongsTo(TrackEvent, {
    foreignKey: 'event_id',
    as: 'event'
});

module.exports = TrackEventDetail;
