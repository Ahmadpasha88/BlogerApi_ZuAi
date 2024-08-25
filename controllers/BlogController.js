const Blog = require('../models/Blog');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getBlog = async (req, res) => {
    try {
        const blogs = await Blog.findAll();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
};


const addBlog = async (req, res) => {
    const { title, content } = req.body;
    const imageFile = req.file;
    const user_id = req.user.id;

    try {
        let imageUrl = '';

        if (imageFile) {
            const result = await cloudinary.uploader.upload(imageFile.path);
            imageUrl = result.secure_url;
        }

        const newBlog = await Blog.create({
            title,
            content,
            image_url: imageUrl,
            user_id,
        });

        res.status(201).json(newBlog);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create blog' });
    }
};


const updateBlog = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const imageFile = req.file;
    const user_id = req.user.id; // Extracted from JWT

    try {
        const blog = await Blog.findByPk(id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        let imageUrl = blog.image_url;

        if (imageFile) {
            const result = await cloudinary.uploader.upload(imageFile.path);
            imageUrl = result.secure_url;
        }

        blog.title = title;
        blog.content = content;
        blog.image_url = imageUrl;
        blog.user_id = user_id;

        await blog.save();
        res.status(200).json(blog);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update blog' });
    }
};


const detailedBlog = async (req, res) => {
    const { id } = req.params;
    try {
        const blog = await Blog.findByPk(id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog details' });
    }
};

const deleteBlog = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const blog = await Blog.findByPk(id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.user_id !== user_id) {
            return res.status(403).json({ error: 'Unauthorized to delete this blog' });
        }
        if (blog.image_url) {
            const publicId = blog.image_url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
        await blog.destroy();

        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog' });
    }
};


module.exports = { getBlog, addBlog, updateBlog, detailedBlog,deleteBlog };
