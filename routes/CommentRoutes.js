const express = require('express');
const { getComments, addComment, updateComment, deleteComment } = require('../controllers/CommentController');
const { protect } = require('../middleware/auth');
const { body, param } = require('express-validator');
const Blog = require('../models/Blog');

const router = express.Router();

const validateComment = [
    body('comment').notEmpty().withMessage('Comment is required'),
    body('bolg_id').notEmpty().withMessage('Blog_id is required'),
    param('blog_id').custom(async (blog_id) => {
        const blog = await Blog.findByPk(blog_id);
        if (!blog) {
            return Promise.reject('Blog not found');
        }
    })
];


router.get('/', getComments);

router.post('/', protect, validateComment, addComment);

router.put('/:id/:blog_id', protect, validateComment, updateComment);

router.delete('/:id', protect, deleteComment);

module.exports = router;
