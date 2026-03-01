# 北京邮电大学知识产权新闻系统

这是一个基于 Node.js + Express + React + MongoDB 的全栈知识产权新闻管理系统。

## 项目结构

```
bupt-ip-news-system/
├── server/           # 后端服务器
│   ├── app.js       # Express 应用入口
│   ├── db/          # 数据库连接
│   ├── models/      # Mongoose 模型
│   ├── routes/      # API 路由
│   ├── controllers/ # 业务逻辑控制器
│   ├── middleware/  # 中间件
│   └── utils/       # 工具函数
├── client/          # React 前端应用
│   ├── public/      # 静态资源
│   └── src/         # 源代码
├── .env             # 环境变量配置
└── package.json     # 项目依赖
```

## 前置要求

确保您的系统已安装以下软件：

- **Node.js** (推荐 v16.x 或更高版本)
- **npm** (通常随 Node.js 一起安装)
- **MongoDB** (v4.x 或更高版本)

## 安装步骤

### 1. 克隆项目（如果尚未克隆）

```bash
git clone <repository-url>
cd bupt-ip-news-system
```

### 2. 安装依赖

在项目根目录执行以下命令，将同时安装服务器端和客户端的所有依赖：

```bash
npm run install-all
```

或者分别安装：

```bash
# 安装服务器端依赖
npm install

# 安装客户端依赖
npm run install-client
```

### 3. 配置环境变量

项目根目录已有 `.env` 文件，确保配置正确：

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/bupt_ip_news
JWT_SECRET=bupt_ip_news_jwt_secret2025
JWT_EXPIRE=30d
```

**重要配置说明：**
- `PORT`: 后端服务器端口（默认 5000）
- `MONGO_URI`: MongoDB 连接字符串
- `JWT_SECRET`: JWT 加密密钥（生产环境请修改为强随机字符串）
- `NODE_ENV`: 运行环境（development/production）

### 4. 启动 MongoDB

确保 MongoDB 服务正在运行：

**Windows:**
```bash
# 如果已安装 MongoDB 服务
net start MongoDB

# 或者手动启动
mongod --dbpath <your-data-path>
```

**Mac/Linux:**
```bash
# 使用 brew (Mac)
brew services start mongodb-community

# 或者手动启动
mongod --dbpath <your-data-path>
```

### 5. （可选）初始化数据库

如果需要初始化测试数据：

```bash
# 运行数据填充脚本
npm run seed

# 或运行演示数据填充脚本
npm run seed-demo
```

## 运行项目

### 开发模式（推荐）

同时启动前端和后端开发服务器：

```bash
npm run dev
```

这将同时运行：
- 后端服务器: http://localhost:5000
- 前端开发服务器: http://localhost:3000

浏览器会自动打开 http://localhost:3000

### 分别运行

**仅运行后端服务器：**
```bash
npm run server
```

**仅运行前端应用：**
```bash
npm run client
```

### 生产模式

1. 构建前端生产版本：
```bash
npm run build
```

2. 设置环境变量为生产模式（修改 .env 文件）：
```env
NODE_ENV=production
```

3. 启动生产服务器：
```bash
npm start
```

## 可用脚本

- `npm run dev` - 同时运行前后端开发服务器
- `npm run server` - 运行后端服务器（带热重载）
- `npm run client` - 运行前端开发服务器
- `npm start` - 运行生产模式服务器
- `npm run build` - 构建前端生产版本
- `npm run install-all` - 安装所有依赖
- `npm run seed` - 填充数据库
- `npm run seed-demo` - 填充演示数据

## API 端点

后端提供以下 API 路由：

- `/api/auth` - 用户认证（登录/注册）
- `/api/news` - 新闻管理
- `/api/lectures` - 讲座管理
- `/api/users` - 用户管理

## 默认端口

- **前端**: http://localhost:3000
- **后端**: http://localhost:5000
- **数据库**: mongodb://localhost:27017

## 常见问题

### 1. MongoDB 连接失败

确保：
- MongoDB 服务正在运行
- `.env` 文件中的 `MONGO_URI` 配置正确
- 数据库端口 27017 未被占用

### 2. 端口已被占用

如果 5000 或 3000 端口被占用，可以：
- 修改 `.env` 文件中的 `PORT` 值
- 或者关闭占用端口的其他程序

### 3. 依赖安装失败

尝试清除缓存后重新安装：
```bash
npm cache clean --force
npm run install-all
```

## 技术栈

### 后端
- Node.js + Express
- MongoDB + Mongoose
- JWT 认证
- bcryptjs 密码加密

### 前端
- React 18
- React Router v6
- Styled Components
- Axios
- React Icons

## 开发团队

北京邮电大学知识产权新闻系统开发组

## 许可证

请根据实际情况添加许可证信息
