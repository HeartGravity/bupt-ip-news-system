# 知识产权助手 — 本地 LLM 微调指南

本目录包含将知识产权领域数据（站内新闻、法律法规）用于微调预训练模型，并将微调后的模型接入网站智能助手的完整流程。

---

## 目录结构

```
ml/
├── requirements.txt          # Python 依赖
├── data/
│   ├── export_news.js        # 从 MongoDB 导出新闻数据（Node.js）
│   ├── prepare_dataset.py    # 将原始数据格式化为训练集
│   ├── raw/                  # 自动生成，存放导出的原始数据
│   └── laws/                 # 手动放入法律法规 .txt 文件
├── training/
│   ├── train.py              # LoRA / QLoRA 微调脚本
│   └── config.yaml           # 训练超参数配置
├── inference/
│   ├── server.py             # FastAPI 推理服务器（OpenAI 兼容接口）
│   └── model.py              # 模型加载与生成模块
├── scripts/
│   └── merge_lora.py         # 将 LoRA adapter 合并为完整模型
└── models/                   # 自动生成，存放训练输出
    ├── lora-adapter/         # LoRA adapter 权重
    └── merged/               # 合并后的完整模型（供推理使用）
```

---

## 硬件要求

| 模型规格 | 微调所需显存 | 推理所需显存 |
|----------|-------------|-------------|
| Qwen2.5-1.5B-Instruct | ≥ 6 GB | ≥ 4 GB |
| Qwen2.5-3B-Instruct   | ≥ 8 GB | ≥ 6 GB |
| **Qwen2.5-7B-Instruct（推荐）** | **≥ 16 GB（QLoRA）** | **≥ 8 GB（8-bit）** |

> 没有 GPU？可以在云服务器（如 AutoDL、阿里云 PAI）上完成微调，再把模型文件下载到本地推理。

---

## 快速开始

### 第一步：安装 Python 依赖

```bash
# 创建虚拟环境（推荐）
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS

# 安装依赖
pip install -r ml/requirements.txt

# CUDA 用户额外安装对应版本 PyTorch（以 CUDA 12.1 为例）
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

### 第二步：准备训练数据

#### 2a. 导出站内新闻数据

确保 MongoDB 已运行，且 `.env` 中配置了 `MONGO_URI`，然后在项目根目录执行：

```bash
node ml/data/export_news.js
# 输出: ml/data/raw/news.jsonl
```

#### 2b. 添加法律法规文本（可选但推荐）

将知识产权相关法律法规的纯文本文件（`.txt` 格式）放入 `ml/data/laws/` 目录。

文件命名示例：
```
ml/data/laws/
├── 中华人民共和国专利法.txt
├── 专利法实施细则.txt
├── 中华人民共和国商标法.txt
└── 著作权法.txt
```

**文本格式建议：** 保留"第X条"等原始条款格式，脚本会自动按条款分割生成问答对。

#### 2c. 生成训练集

```bash
python ml/data/prepare_dataset.py
# 输出:
#   ml/data/train.jsonl   训练集（90%）
#   ml/data/eval.jsonl    验证集（10%）
```

常用参数：
```bash
python ml/data/prepare_dataset.py --news-only    # 仅使用新闻数据
python ml/data/prepare_dataset.py --laws-only    # 仅使用法规数据
python ml/data/prepare_dataset.py --eval-ratio 0.05  # 调整验证集比例
```

---

### 第三步：微调模型

#### 修改训练配置（可选）

编辑 `ml/training/config.yaml`，根据你的显存调整：

```yaml
# 显存 ≥ 16GB：使用 7B 模型
model_name: "Qwen/Qwen2.5-7B-Instruct"

# 显存 8-12GB：使用 3B 模型
# model_name: "Qwen/Qwen2.5-3B-Instruct"

# 显存 < 8GB：使用 1.5B 模型
# model_name: "Qwen/Qwen2.5-1.5B-Instruct"
```

> **国内网络提示：** 模型会自动从 HuggingFace 下载。如网络不通，可先通过 `modelscope` 或镜像下载模型文件，然后将 `model_name` 改为本地路径。

#### 启动训练

```bash
python ml/training/train.py
# 或指定配置文件：
python ml/training/train.py --config ml/training/config.yaml

# 训练时间参考（Qwen2.5-7B, RTX 3090, 500条样本）：约 30-60 分钟
```

训练完成后，adapter 保存在 `ml/models/lora-adapter/`。

---

### 第四步：合并模型（推荐）

将 LoRA adapter 合并为独立模型，推理速度更快：

```bash
python ml/scripts/merge_lora.py
# 输出: ml/models/merged/
```

---

### 第五步：启动本地推理服务器

```bash
# 使用合并后的完整模型（推荐）
python ml/inference/server.py --model ml/models/merged

# 或直接使用 LoRA adapter（无需提前合并）
python ml/inference/server.py --model ml/models/lora-adapter

# 显存不足时启用 8-bit 量化
python ml/inference/server.py --model ml/models/merged --8bit
```

服务器启动后，访问以下地址验证：
- 健康检查：http://localhost:8000/health
- API 文档：http://localhost:8000/docs

---

### 第六步：接入网站

在项目根目录的 `.env` 文件中添加：

```env
# 启用本地模型（注释掉或删除 HUNYUAN_API_KEY 配置）
LOCAL_LLM_URL=http://localhost:8000
LOCAL_LLM_MODEL=local-finetuned
```

重启 Node.js 服务器：

```bash
npm run dev   # 或 node server/app.js
```

此时网站智能助手将调用本地微调模型，而非外部 Hunyuan API。

---

## 切换配置说明

`chatController.js` 支持三种配置状态：

| 配置 | 效果 |
|------|------|
| `LOCAL_LLM_URL` 已设置 | 使用本地微调模型（优先级最高） |
| 仅 `HUNYUAN_API_KEY` 已设置 | 使用腾讯混元外部 API |
| 两者均未设置 | AI 功能不可用，返回错误提示 |

---

## 数据格式说明

训练数据为 JSONL 格式，每行一条样本：

```json
{
  "messages": [
    {"role": "system", "content": "你是北京邮电大学知识产权服务中心的AI智能助手……"},
    {"role": "user", "content": "专利申请需要哪些步骤？"},
    {"role": "assistant", "content": "专利申请主要包括以下步骤……"}
  ]
}
```

你也可以手动创建或补充高质量问答对追加到 `ml/data/train.jsonl`，效果会更好。

---

## 常见问题

**Q: 下载模型速度慢**

设置镜像环境变量后再运行训练脚本：
```bash
set HF_ENDPOINT=https://hf-mirror.com   # Windows
# export HF_ENDPOINT=https://hf-mirror.com  # Linux/macOS
```

**Q: CUDA out of memory**

1. 在 `config.yaml` 中减小 `per_device_train_batch_size`（改为 1）
2. 增大 `gradient_accumulation_steps`（改为 16）
3. 换用更小的模型（3B 或 1.5B）
4. 确认 `use_4bit: true` 已启用

**Q: Windows 下 bitsandbytes 安装失败**

参考 `requirements.txt` 中的注释，安装预编译 Windows 版本：
```bash
pip install bitsandbytes --index-url https://github.com/jllllll/bitsandbytes-windows-webui/releases/download/wheels
```

**Q: 推理服务器报端口冲突**

```bash
python ml/inference/server.py --model ml/models/merged --port 8001
# 同时更新 .env: LOCAL_LLM_URL=http://localhost:8001
```
