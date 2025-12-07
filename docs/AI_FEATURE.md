# AI 聊天功能

## 概述

本项目集成了 AI 聊天功能，允许用户通过自然语言描述来生成和修改图表。

## 功能特性

### 1. 可拖拽悬浮聊天窗口
- 点击工具栏右侧的 **"AI 助手"** 按钮打开聊天面板
- 使用快捷键 **Ctrl/Cmd + L** 快速打开/关闭
- 支持拖拽移动和八方向缩放

### 2. AI 图表生成
通过自然语言描述，AI 会自动生成对应的图表：
- "创建一个简单的流程图"
- "画一个 AWS 架构图"
- "设计用户登录流程"

### 3. 多 AI 提供商支持
在设置面板中可以配置不同的 AI 提供商：
- **OpenAI** (GPT-4, GPT-4o)
- **DeepSeek** (DeepSeek-Chat, DeepSeek-Reasoner)
- **SiliconFlow** (DeepSeek-V3, Qwen2.5)

## 配置

### 后端配置

1. 复制环境变量示例文件：
```bash
cd backend
cp .env.example .env
```

2. 编辑 `.env` 文件，配置你的 AI 提供商：
```env
# AI 提供商: openai, deepseek, siliconflow
AI_PROVIDER=openai

# AI 模型
AI_MODEL=gpt-4o

# API Key
OPENAI_API_KEY=your_api_key_here
```

3. 启动后端服务：
```bash
npm run dev
```

### 前端使用

1. 点击工具栏的 "AI 助手" 按钮
2. 在设置中输入 API Key（可选，如果后端已配置则不需要）
3. 输入你想要创建的图表描述
4. AI 会生成图表并自动添加到画布

## API 端点

### 流式聊天 API
```
POST /api/ai/chat

Body:
{
  "messages": [
    { "role": "user", "content": "创建一个流程图" }
  ],
  "provider": "openai",
  "model": "gpt-4o",
  "apiKey": "optional_api_key",
  "temperature": 0.7
}

Response: Server-Sent Events (SSE)
```

### 同步聊天 API
```
POST /api/ai/chat/sync

Body: 同上

Response:
{
  "content": "生成的 JSON 数据",
  "model": "gpt-4o",
  "usage": { ... }
}
```

### 获取提供商列表
```
GET /api/ai/providers

Response:
{
  "providers": [...],
  "currentProvider": "openai",
  "currentModel": "gpt-4o"
}
```

## 支持的形状

AI 可以生成以下形状：
- `rect` - 矩形（默认）
- `ellipse` - 椭圆
- `circle` - 圆形
- `custom-actor` - 人物图标
- `custom-database` - 数据库
- `custom-process` - 流程矩形
- `custom-decision` - 决策钻石
- `custom-terminator` - 终止符
- `custom-document` - 文档

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + L` | 打开/关闭 AI 助手面板 |

## 技术实现

- **前端**: React + Zustand + TypeScript
- **后端**: Express.js + OpenAI SDK
- **通信**: Server-Sent Events (SSE) 流式响应
- **图表引擎**: AntV X6
