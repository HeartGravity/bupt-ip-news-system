"""
本地 LLM 推理服务器（OpenAI API 兼容）

提供与 OpenAI Chat Completions API 相同的接口，可无缝替换 chatController.js 中的外部 API 调用。

支持：
  - POST /v1/chat/completions   非流式 + 流式（SSE）
  - GET  /health                健康检查

启动方式：
  python ml/inference/server.py --model ml/models/merged
  python ml/inference/server.py --model ml/models/lora-adapter --base Qwen/Qwen2.5-7B-Instruct
  python ml/inference/server.py --model ml/models/merged --port 8000 --8bit
"""

import argparse
import json
import os
import sys
import time
from typing import Optional
import uuid
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

# ── 项目路径 ───────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "ml"))

from inference.model import get_llm, init_llm  # noqa: E402

# ── FastAPI 应用 ────────────────────────────────────────────────────────────
app = FastAPI(
    title="知识产权助手 - 本地 LLM 服务",
    description="OpenAI 兼容的本地微调模型推理接口",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 请求/响应 Schema（OpenAI 兼容） ─────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    model: str = "local-finetuned"
    messages: list[Message]
    stream: bool = False
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2048, ge=1, le=4096)
    top_p: float = Field(default=0.9, ge=0.0, le=1.0)


# ── 工具函数：构造 OpenAI 格式的响应块 ────────────────────────────────────
def make_chunk(content: str, finish_reason: Optional[str] = None, request_id: str = "") -> str:
    chunk = {
        "id": f"chatcmpl-{request_id}",
        "object": "chat.completion.chunk",
        "created": int(time.time()),
        "model": "local-finetuned",
        "choices": [
            {
                "index": 0,
                "delta": {"content": content} if content else {},
                "finish_reason": finish_reason,
            }
        ],
    }
    return f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"


def make_full_response(content: str, request_id: str = "") -> dict:
    return {
        "id": f"chatcmpl-{request_id}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": "local-finetuned",
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": -1,   # 本地推理暂不统计
            "completion_tokens": -1,
            "total_tokens": -1,
        },
    }


# ── 路由 ────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health_check():
    llm = get_llm()
    return {
        "status": "ok",
        "model": str(llm.model_path),
        "device": llm.device,
    }


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatCompletionRequest):
    llm = get_llm()
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    request_id = uuid.uuid4().hex[:12]

    if req.stream:
        # ── 流式响应（SSE） ────────────────────────────────────────────────
        async def event_stream():
            # 发送初始空 delta（与 OpenAI 规范一致）
            yield make_chunk("", request_id=request_id)
            try:
                async for token in llm.astream_generate(
                    messages,
                    max_new_tokens=req.max_tokens,
                    temperature=req.temperature,
                    top_p=req.top_p,
                ):
                    if token:
                        yield make_chunk(token, request_id=request_id)

                yield make_chunk("", finish_reason="stop", request_id=request_id)
                yield "data: [DONE]\n\n"
            except Exception as e:
                err_chunk = {"error": {"message": str(e), "type": "server_error"}}
                yield f"data: {json.dumps(err_chunk)}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    else:
        # ── 非流式响应 ────────────────────────────────────────────────────
        try:
            content = llm.generate(
                messages,
                max_new_tokens=req.max_tokens,
                temperature=req.temperature,
                top_p=req.top_p,
            )
            return JSONResponse(content=make_full_response(content, request_id))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


# ── 启动入口 ────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="本地 LLM 推理服务器")
    parser.add_argument(
        "--model",
        required=True,
        help="合并后的模型路径，或 LoRA adapter 路径（需同时指定 --base）",
    )
    parser.add_argument(
        "--base",
        default=None,
        help="当 --model 为 LoRA adapter 时，指定基础模型路径或 HuggingFace model ID",
    )
    parser.add_argument("--host", default="0.0.0.0", help="监听地址 (默认 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="监听端口 (默认 8000)")
    parser.add_argument("--device", default=None, help="cuda / cpu / mps，默认自动检测")
    parser.add_argument("--8bit", dest="load_in_8bit", action="store_true", help="8-bit 量化推理")
    args = parser.parse_args()

    model_path = str(Path(args.model).resolve()) if not args.model.startswith("/") and ":" not in args.model else args.model
    # 处理相对路径
    if not Path(model_path).is_absolute():
        model_path = str(PROJECT_ROOT / args.model)

    print(f"初始化模型: {model_path}")
    init_llm(
        model_path=model_path,
        base_model_path=args.base,
        device=args.device,
        load_in_8bit=args.load_in_8bit,
    )

    print(f"启动推理服务器: http://{args.host}:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()
