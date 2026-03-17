const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// 登录/注册限流：每个 IP 15分钟内最多 15 次请求
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: '请求过于频繁，请15分钟后再试' }
});

// 注册用户
router.post(
  '/register',
  authLimiter,
  [
    check('username', '用户名是必填项').not().isEmpty(),
    check('email', '请包含有效的电子邮件').isEmail(),
    check('password', '请输入6个或更多字符的密码').isLength({ min: 6 })
  ],
  authController.register
);

// 用户登录
router.post(
  '/login',
  authLimiter,
  [
    check('email', '请包含有效的电子邮件').isEmail(),
    check('password', '密码是必填项').exists()
  ],
  authController.login
);

// 获取当前用户信息
router.get('/me', protect, authController.getMe);

// 更新用户资料
router.put('/profile', protect, authController.updateProfile);

// 更新密码
router.put(
  '/password',
  [
    protect,
    check('currentPassword', '当前密码是必填项').exists(),
    check('newPassword', '请输入6个或更多字符的密码').isLength({ min: 6 })
  ],
  authController.updatePassword
);

// 获取当前用户的收藏列表
router.get('/favorites', protect, authController.getMyFavorites);

// 从收藏中移除新闻
router.put('/favorites/remove/:newsId', protect, authController.removeFavorite);

module.exports = router;