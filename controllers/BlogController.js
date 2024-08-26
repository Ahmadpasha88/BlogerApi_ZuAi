const Blog = require("../models/Blog");
const cloudinary = require("cloudinary").v2;

const sequelize = require("../db");

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
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

const getBlogsById = async (req, res) => {
  const user_id = req.user.id;

  try {
    const blogs = await Blog.findAll({
      where: {
        user_id: user_id,
      },
    });

    if (blogs.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

const addBlog = async (req, res) => {
  const { title, content } = req.body;
  const imageFile = req.file;
  const user_id = req.user.id;

  try {
    let imageUrl = "";

    if (imageFile) {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(imageFile.path);
      imageUrl = result.secure_url;
    }

    // Create a new blog entry in the database
    const newBlog = await Blog.create({
      title,
      content,
      image_url: imageUrl,
      user_id,
    });

    // Respond with the created blog entry
    res.status(201).json(newBlog);
  } catch (error) {
    console.error("Failed to create blog:", error); // Log the error for debugging
    res.status(400).json({ error: "Failed to create blog" });
  }
};

const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const imageFile = req.file;
  const user_id = req.user.id;
  try {
    console.log("Received Update Request:", { id, title, content, user_id });

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    let imageUrl = blog.image_url;
    console.log("Existing Image URL:", imageUrl);

    if (imageFile) {
      console.log("Uploading new image...");
      const result = await cloudinary.uploader.upload(imageFile.path);
      imageUrl = result.secure_url;
      console.log("New Image URL:", imageUrl);
    }

    blog.title = title;
    blog.content = content;
    blog.image_url = imageUrl;
    blog.user_id = user_id;

    await blog.save();
    console.log("Blog successfully updated:", blog);

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(400).json({ error: "Failed to update blog" });
  }
};

const detailedBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const [blog] = await sequelize.query(
      `SELECT "Blogs".*, "Users".name 
             FROM "Blogs" 
             JOIN "Users" ON "Blogs".user_id = "Users".id 
             WHERE "Blogs".id = :blogId`,
      {
        replacements: { blogId: id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the blog." });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (blog.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this blog" });
    }
    if (blog.image_url) {
      const publicId = blog.image_url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await blog.destroy();

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog" });
  }
};

module.exports = {
  getBlog,
  addBlog,
  updateBlog,
  detailedBlog,
  deleteBlog,
  getBlogsById,
};
