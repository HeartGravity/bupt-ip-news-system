const express = require('express');
const {
  getLectures,
  getLecture,
  createLecture,
  updateLecture,
  deleteLecture,
} = require('../controllers/lectureController');

// 引入权限中间件
const { protect, authorize } = require('../middleware/authMiddleware'); // 修正路径

const router = express.Router();

router
  .route('/')
  .get(getLectures) // 获取列表通常是公开的
  .post(protect, authorize('admin'), createLecture); // 只有管理员可以创建

router
  .route('/:id')
  .get(getLecture) // 获取详情通常是公开的
  .put(protect, authorize('admin'), updateLecture) // 只有管理员可以更新
  .delete(protect, authorize('admin'), deleteLecture); // 只有管理员可以删除

module.exports = router; 