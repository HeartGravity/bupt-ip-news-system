const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number, // 1 为好评(点赞)，-1 为差评(踩)，0或不填为未评价
    enum: [1, -1, 0, null],
    default: null,
  },
  feedback: {
    type: String,
    default: "",
  },
});

const ChatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    default: "新对话",
  },
  messages: [MessageSchema],
  summary: {
    type: String,
    default: "",
  },
  ragCache: {
    query: String,
    context: String,
    timestamp: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 更新 updatedAt
ChatHistorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("ChatHistory", ChatHistorySchema);
