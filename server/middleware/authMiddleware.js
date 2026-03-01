const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// 保护路由，验证 token
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 从 Bearer token header 中提取
    token = req.headers.authorization.split(' ')[1];
  } 
  // else if (req.cookies.token) {
  //   // 或者从 cookie 中提取（如果使用 cookie）
  //   token = req.cookies.token;
  // }

  // 确保 token 存在
  if (!token) {
    return next(new ErrorResponse('未授权访问此路由', 401));
  }

  try {
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 查找用户并附加到请求对象
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
        return next(new ErrorResponse('与此token关联的用户不存在', 401));
    }

    next();
  } catch (err) {
    console.error('Token验证错误:', err.message);
    return next(new ErrorResponse('未授权访问此路由', 401));
  }
});

// 授权特定角色访问
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
        // 确保 protect 中间件已运行
        return next(new ErrorResponse('未授权访问此路由', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `用户角色 '${req.user.role}' 未被授权访问此路由`,
          403 // 403 Forbidden 表示禁止访问
        )
      );
    }
    next();
  };
}; 