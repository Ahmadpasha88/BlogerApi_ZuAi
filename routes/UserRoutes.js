const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, updatePassword, getUser } = require('../controllers/UserController');

const router = express.Router();

router.post('/register', [
    body('name').notEmpty().withMessage('name is required'),
    body('mail').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], registerUser);

router.post('/login', [
    body('mail').isEmail().withMessage('Please enter a valid email address'),
    body('password').notEmpty().withMessage('Password is Required')
], loginUser);

router.put('/update-password/:id', updatePassword);

router.get('/:id', getUser);

module.exports = router;
