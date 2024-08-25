const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const sequelize = require('./db');
const cors = require('cors');

const User = require('./models/User');
const Blog = require('./models/Blog');
const Comment = require('./models/Comment');

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());


sequelize.authenticate()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Unable to connect to the database:', err));


sequelize.sync({ force: false })
    .then(() => {
        console.log('Database & tables created!');
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch((err) => {
        console.error('Error synchronizing the database:', err);
    });

const userRoutes = require('./routes/UserRoutes');
const blogRoutes = require('./routes/BlogPostsRoutes');
const commentRoutes = require('./routes/CommentRoutes');

app.use('/api/users', userRoutes);
app.use('/api/posts', blogRoutes);
app.use('/api/comments', commentRoutes);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

module.exports = { User, Blog, Comment };