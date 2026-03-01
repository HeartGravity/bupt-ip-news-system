const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 用户模型架构
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '请提供用户名'],
    unique: true,
    trim: true,
    maxlength: [50, '用户名不能超过50个字符']
  },
  email: {
    type: String,
    required: [true, '请提供邮箱'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      '请提供有效的邮箱'
    ]
  },
  password: {
    type: String,
    required: [true, '请提供密码'],
    minlength: 6,
    select: false
  },
  nickname: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }]
});

// 密码加密
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 签发JWT令牌
UserSchema.methods.getSignedJwtToken = function() {
  // 检查JWT密钥是否存在
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('警告: JWT_SECRET环境变量未设置！');
    throw new Error('服务器配置错误: JWT密钥未设置');
  }

  return jwt.sign(
    { id: this._id, username: this.username, role: this.role },
    jwtSecret,
    { 
      expiresIn: process.env.JWT_EXPIRE || '30d',
      algorithm: 'HS256' // 明确指定算法
    }
  );
};

// 验证用户密码
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);