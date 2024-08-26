const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Blog = sequelize.define('Blog', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true,
});


module.exports = Blog;
