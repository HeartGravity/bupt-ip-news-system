const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./db");

// 加载环境变量
require("dotenv").config();

// 连接数据库
connectDB();

const app = express();

// 中间件
app.use(
  cors({
    // 根据环境变量设置CORS源，确保在生产环境中设置了正确的域名
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CORS_ORIGIN || "https://bupt-ip-news-system.xyz"
        : "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ extended: false }));

// 日志中间件 - 根据环境使用不同的日志格式
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  // 在生产环境使用更简洁的日志格式
  app.use(morgan("combined"));
}

// 路由定义
app.use("/api/auth", require("./routes/auth"));
app.use("/api/news", require("./routes/news"));
app.use("/api/lectures", require("./routes/lectures"));
app.use("/api/users", require("./routes/users"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/admin", require("./routes/admin"));

// 处理生产环境
if (process.env.NODE_ENV === "production") {
  // 设置静态文件夹
  app.use(express.static(path.join(__dirname, "../client/build")));

  // 所有未处理的请求返回React应用
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

// 404错误处理
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "请求的资源不存在",
  });
});

// 增强的错误处理中间件
app.use((err, req, res, next) => {
  // 记录错误
  console.error(`[ERROR] ${new Date().toISOString()}: ${err.message}`);
  console.error(err.stack);

  // 确定状态码
  const statusCode = err.statusCode || 500;

  // 构建错误响应
  const errorResponse = {
    success: false,
    message: statusCode === 500 ? "服务器内部错误" : err.message,
    // 在开发环境下提供更多错误详情
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
});

// 设置端口并启动服务器
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));
