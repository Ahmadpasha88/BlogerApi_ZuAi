const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  getBlog,
  addBlog,
  detailedBlog,
  updateBlog,
  deleteBlog,
  getBlogsById,
} = require("../controllers/BlogController");
const { protect } = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();

const validateBlog = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title must be less than 255 characters"),
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ max: 955 })
    .withMessage("Title must be less than 955 characters"),
];

router.route("/").get(getBlog).post(protect, upload.single("image"), addBlog);

router.route("/user").get(protect, getBlogsById);

router
  .route("/:id")
  .get(detailedBlog)
  .put(
    protect,
    upload.single("image"),
    validateBlog,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    updateBlog
  )
  .delete(protect, deleteBlog);

module.exports = router;
