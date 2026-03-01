const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入讲座标题'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, '请输入讲座描述'],
  },
  speaker: {
    type: String,
    required: [true, '请输入主讲人'],
  },
  lectureTime: {
    type: Date,
    required: [true, '请输入讲座时间'],
  },
  location: {
    type: String,
    required: [true, '请输入讲座地点'],
  },
  organizer: {
    type: String,
    default: '信息与通信工程学院', // 可以设置默认组织者
  },
  registrationRequired: {
    type: Boolean,
    default: false,
  },
  registrationLink: {
    type: String,
    // 仅当 registrationRequired 为 true 时需要
    validate: {
      validator: function(v) {
        // 仅当需要注册时，链接才可能是必需的或存在
        // 如果不需要注册，则此字段可以为空
        return !this.registrationRequired || (this.registrationRequired && v && v.length > 0);
      },
      message: '需要报名时，请输入报名链接'
    }
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'finished', 'cancelled'],
    default: 'upcoming',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // 可以添加创建者信息，如果需要权限管理
  // createdBy: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'User',
  //   required: true
  // }
});

module.exports = mongoose.model('Lecture', LectureSchema); 