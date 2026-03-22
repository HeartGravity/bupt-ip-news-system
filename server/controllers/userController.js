const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc    获取所有用户 (管理员)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  // 可以在此添加分页、排序等逻辑
  const users = await User.find();
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    获取单个用户 (管理员)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的用户`, 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    更新用户 (管理员，例如更新角色)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  // 从请求体中只提取允许管理员更新的字段，例如 role
  const { role } = req.body;
  const updateData = {};
  if (role && ["user", "admin"].includes(role)) {
    // 确保角色有效
    updateData.role = role;
  }

  // 防止管理员更新自己的角色或敏感信息（如果需要）
  // if (req.user.id === req.params.id) {
  //   return next(new ErrorResponse('不能更新自己的角色', 400));
  // }

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的用户`, 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    删除用户 (管理员)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的用户`, 404));
  }

  // 防止管理员删除自己
  if (req.user.id === req.params.id) {
    return next(new ErrorResponse("不能删除自己", 400));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// 未来可以添加管理员创建用户的函数
// exports.createUser = asyncHandler(async (req, res, next) => { ... });
