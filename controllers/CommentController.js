const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

const addComment = async (req, res) => {
    const { comment } = req.body;
    const { blog_id } = req.body;
    const user_id = req.user.id;

    try {
    
        const blog = await Blog.findByPk(blog_id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

   
        const newComment = await Comment.create({
            comment,
            user_id,
            blog_id
        });

        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

const updateComment = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id;

    try {
        const existingComment = await Comment.findByPk(id);
        if (!existingComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (existingComment.user_id !== user_id) {
            return res.status(403).json({ error: 'Unauthorized to update this comment' });
        }

        existingComment.comment = comment;
        await existingComment.save();

        res.status(200).json(existingComment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update comment' });
    }
};

const deleteComment = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.user_id !== user_id) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        await comment.destroy();
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

const getComments = async (req, res) => {
    try {
        const comments = await Comment.findAll();
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

module.exports = { getComments, addComment, updateComment, deleteComment };
