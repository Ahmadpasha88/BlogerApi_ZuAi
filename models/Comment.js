const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Blog = require('./Blog');

const Comment = sequelize.define('Comment', {
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE'
    },
    blog_id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: Blog,
            key: 'id',
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true,
});

module.exports = Comment;
