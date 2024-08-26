const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const sequelize = require("./db");
const cors = require("cors");

// Import models
const User = require("./models/User");
const Blog = require("./models/Blog");
const Comment = require("./models/Comment");

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Authenticate and sync database
sequelize
  .authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Unable to connect to the database:", err));

// Ensure models are associated properly if they are interdependent
User.hasMany(Blog, { foreignKey: 'user_id' });
Blog.belongsTo(User, { foreignKey: 'user_id' });

Blog.hasMany(Comment, { foreignKey: 'blog_id' });
Comment.belongsTo(Blog, { foreignKey: 'blog_id' });

User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// Synchronize models with the database
sequelize.sync({ alter: true, logging: console.log })
    .then(() => {
        console.log("All models were synchronized successfully.");
    })
    .catch((error) => {
        console.error("Error synchronizing the database:", error);
    });

// API route to check tables in production
app.get('/api/check-tables', async (req, res) => {
    try {
        const tables = await sequelize.getQueryInterface().showAllTables();
        res.status(200).json(tables);
    } catch (error) {
        console.error("Error fetching tables:", error);
        res.status(500).json({ message: "Failed to fetch tables" });
    }
});

// Import routes
const userRoutes = require("./routes/UserRoutes");
const blogRoutes = require("./routes/BlogPostsRoutes");
const commentRoutes = require("./routes/CommentRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/posts", blogRoutes);
app.use("/api/comments", commentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { User, Blog, Comment };
