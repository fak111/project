const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Questionnaire = sequelize.define('Questionnaire', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    questionId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    answer: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'questionnaires',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'questionId']
        }
    ]
});

module.exports = Questionnaire;
