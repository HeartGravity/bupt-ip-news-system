const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  streamMessage,
  getChatList,
  getChatDetail,
  deleteChat
} = require('../controllers/chatController');

// 所有路由都需要登录
router.use(protect);

router.post('/send', sendMessage);
router.post('/stream', streamMessage);
router.get('/history', getChatList);
router.get('/history/:chatId', getChatDetail);
router.delete('/history/:chatId', deleteChat);

module.exports = router;
