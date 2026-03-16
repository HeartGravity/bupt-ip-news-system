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
├── ml/              # 模型训练与推理
│   ├── data/        # 训练数据与法律文本
│   ├── training/    # 训练脚本与配置
│   ├── scripts/     # LoRA 合并等脚本
│   ├── inference/   # 推理服务（OpenAI 兼容）
│   └── models/      # 训练产物（adapter / merged）
├── .env             # 环境变量配置
└── package.json     # 项目依赖
```

## 前置要求

确保您的系统已安装以下软件：

- **Node.js** (推荐 v16.x 或更高版本)
- **npm** (通常随 Node.js 一起安装)
- **MongoDB** (v4.x 或更高版本)
- **Python** (推荐 3.10/3.11，用于模型训练与推理)
- **CUDA + NVIDIA Driver**（如需 GPU 训练/推理）

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

## 模型训练与推理（新增）

本项目支持基于 Qwen2.5-7B 的 LoRA 微调，并通过本地推理服务提供 OpenAI 兼容接口。

### 1) 安装 ML 依赖

```bash
pip install -r ml/requirements.txt
```

> 如需国内镜像拉取 HuggingFace 模型，可设置：

```bash
set HF_ENDPOINT=https://hf-mirror.com
```

### 2) 数据准备（可选）

项目已提供若干数据处理脚本（按需执行）：

```bash
python ml/data/prepare_dataset.py
python ml/data/convert_docx.py
python ml/data/export_news.js
```

### 3) 训练 LoRA

训练配置位于 [ml/training/config.yaml](ml/training/config.yaml)，执行：

```bash
python ml/training/train.py
```

训练完成后通常会在 `ml/models/` 下得到 LoRA adapter 目录（例如 `lora-adapter-7B/`）。

### 4) 合并 LoRA（推荐用于生产推理）

```bash
python ml/scripts/merge_lora.py
```

合并后可得到 `ml/models/merged/`。对于显存较充足的 GPU（如 24G），优先使用 merged 目录进行推理，稳定性更好。

### 5) 启动推理服务（本地）

推理服务入口： [ml/inference/server.py](ml/inference/server.py)

使用 merged（推荐）：

```bash
python ml/inference/server.py --model ml/models/merged --host 0.0.0.0 --port 8000
```

使用 LoRA adapter（需指定 base，低显存场景可加 --8bit）：

```bash
python ml/inference/server.py --model ml/models/lora-adapter-7B --base Qwen/Qwen2.5-7B-Instruct --8bit
```

健康检查：

```bash
curl http://127.0.0.1:8000/health
```

### 6) 启动推理服务（AutoDL 云端）并接入本地后端

#### A. 云端启动（建议仅内网监听）

```bash
python ml/inference/server.py --model ml/models/merged --host 127.0.0.1 --port 8000
```

#### B. 本机建立 SSH 隧道（Windows PowerShell/CMD）

```bash
ssh -N -L 18000:127.0.0.1:8000 <云端用户名>@<云端SSH地址> -p <SSH端口>
```

#### C. 本地后端配置 `.env`

```env
LOCAL_LLM_URL=http://127.0.0.1:18000
LOCAL_LLM_MODEL=local-finetuned
```

后端调用逻辑位于 [server/controllers/chatController.js](server/controllers/chatController.js)，已支持：

- 命中站内 RAG 资料时优先本地模型
- 未命中时优先外部 API
- 首选失败自动回退

### 7) 运行顺序建议

1. 启动 MongoDB
2. 启动（本地或云端）推理服务
3. 若云端推理，先建立 SSH 隧道
4. 启动后端 `npm run server`
5. 启动前端 `npm run client`（或根目录 `npm run dev`）

## 可用脚本

- `npm run dev` - 同时运行前后端开发服务器
- `npm run server` - 运行后端服务器（带热重载）
- `npm run client` - 运行前端开发服务器
- `npm start` - 运行生产模式服务器
- `npm run build` - 构建前端生产版本
- `npm run install-all` - 安装所有依赖
- `npm run seed` - 填充数据库
- `npm run seed-demo` - 填充演示数据

### ML 相关脚本（手动执行）

- `python ml/training/train.py` - 训练 LoRA
- `python ml/scripts/merge_lora.py` - 合并 LoRA 权重
- `python ml/inference/server.py ...` - 启动推理服务

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
