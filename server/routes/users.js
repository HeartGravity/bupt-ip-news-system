const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// 引入权限中间件
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// 应用 protect 和 authorize('admin') 到所有用户管理路由
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getUsers);
  // 如果添加了 createUser, 可以在这里加上 .post(createUser)

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router; 