/**
 * AI Chat Routes
 * 支持多种 AI 提供商的流式聊天 API
 */

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// X6 图表生成的系统提示词
const SYSTEM_PROMPT = `你是一个专业的图表设计助手，帮助用户创建 AntV X6 图表。

## 回复格式
你需要用友好的自然语言回复用户，描述你要创建的图表内容。在回复的末尾，用特殊标签包含图表的 JSON 数据。

**重要**：
1. 先用中文友好地描述你的规划和图表内容
2. 在回复末尾添加 JSON 数据，用 \`<graph-data>\` 标签包裹
3. 不要在正文中显示 JSON 代码

## 回复示例
用户：画一个简单的流程图

回复：
好的！我来为你创建一个简单的流程图。

**规划：**
- 使用椭圆形表示开始和结束
- 使用矩形表示处理步骤
- 使用箭头连接各个节点
- 采用垂直布局，从上到下

我设计了以下流程：
1. **开始** - 流程的起点（绿色椭圆）
2. **处理** - 中间处理步骤（蓝色矩形）
3. **结束** - 流程的终点（红色椭圆）

<graph-data>
{"nodes":[...],"edges":[...]}
</graph-data>

## 可用的形状类型
- custom-rect: 矩形（推荐用于一般节点）
- custom-rounded-rect: 大圆角矩形（用于开始/结束）
- custom-ellipse: 椭圆/圆形
- custom-diamond: 菱形（用于判断/决策）
- custom-cylinder: 圆柱体（用于数据库）
- custom-document: 文档形状
- custom-parallelogram: 平行四边形（用于输入/输出）
- custom-hexagon: 六边形
- custom-cloud: 云朵形状

## 颜色方案
- 开始节点: 绿色 #73D13D
- 处理节点: 蓝色 #5F95FF
- 决策节点: 黄色/橙色 #FAAD14
- 结束节点: 红色 #F5222D
- 数据库: 紫色 #722ED1
- 文档: 青色 #13C2C2

## JSON 格式规范
\`\`\`json
{
  "nodes": [
    {
      "id": "唯一ID",
      "shape": "custom-rect",
      "x": 300,
      "y": 100,
      "width": 120,
      "height": 60,
      "label": "节点标签",
      "attrs": {
        "body": {
          "fill": "#5F95FF",
          "stroke": "#5F95FF",
          "strokeWidth": 1,
          "rx": 6,
          "ry": 6
        },
        "label": {
          "fill": "#ffffff",
          "fontSize": 14,
          "fontWeight": 500
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "源节点ID",
      "target": "目标节点ID"
    }
  ]
}
\`\`\`

## 布局规则（非常重要！）
1. 起始位置: x=300, y=100
2. **垂直流程图**: 节点垂直排列，每行间距 100-120px
   - 第一个节点: y=100
   - 第二个节点: y=220
   - 第三个节点: y=340
   - 以此类推...
3. **水平分支**: 决策节点的不同分支水平分开，x 间距 180-200px
4. 居中对齐主流程线上的节点

## 注意事项
1. 所有节点 ID 必须唯一
2. 边的 source 和 target 必须引用存在的节点 ID
3. 为 custom-rounded-rect 形状设置 rx=30, ry=30 来获得更圆润的效果
4. 决策节点通常需要多条出边，连接到不同的处理分支

现在请根据用户的描述创建图表。`;

// 获取 AI 客户端配置
function getAIClient(provider, apiKey, baseURL) {
    const config = {
        apiKey: apiKey,
    };

    // 根据提供商设置 baseURL
    switch (provider) {
        case 'deepseek':
            config.baseURL = baseURL || 'https://api.deepseek.com/v1';
            break;
        case 'siliconflow':
            config.baseURL = baseURL || 'https://api.siliconflow.cn/v1';
            break;
        case 'openai':
        default:
            if (baseURL) {
                config.baseURL = baseURL;
            }
            break;
    }

    return new OpenAI(config);
}

// 获取默认模型
function getDefaultModel(provider) {
    const models = {
        openai: 'gpt-4o',
        anthropic: 'claude-3-5-sonnet-20241022',
        deepseek: 'deepseek-chat',
        siliconflow: 'deepseek-ai/DeepSeek-V3',
    };
    return models[provider] || 'gpt-4o';
}

// 流式聊天 API
router.post('/chat', async (req, res) => {
    try {
        const {
            messages,
            provider = process.env.AI_PROVIDER || 'openai',
            model = process.env.AI_MODEL,
            apiKey,
            baseURL,
            temperature = 0.7,
            accessCode,
        } = req.body;

        // 验证访问密码（如果配置了）
        const accessCodeList = process.env.ACCESS_CODE_LIST?.split(',').filter(Boolean) || [];
        if (accessCodeList.length > 0 && !accessCodeList.includes(accessCode)) {
            return res.status(401).json({ error: 'Invalid access code' });
        }

        // 获取 API Key
        let finalApiKey = apiKey;
        if (!finalApiKey) {
            switch (provider) {
                case 'openai':
                    finalApiKey = process.env.OPENAI_API_KEY;
                    break;
                case 'anthropic':
                    finalApiKey = process.env.ANTHROPIC_API_KEY;
                    break;
                case 'deepseek':
                    finalApiKey = process.env.DEEPSEEK_API_KEY;
                    break;
                case 'siliconflow':
                    finalApiKey = process.env.SILICONFLOW_API_KEY;
                    break;
            }
        }

        if (!finalApiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        // 获取 baseURL
        let finalBaseURL = baseURL;
        if (!finalBaseURL) {
            switch (provider) {
                case 'openai':
                    finalBaseURL = process.env.OPENAI_BASE_URL;
                    break;
                case 'deepseek':
                    finalBaseURL = process.env.DEEPSEEK_BASE_URL;
                    break;
                case 'siliconflow':
                    finalBaseURL = process.env.SILICONFLOW_BASE_URL;
                    break;
            }
        }

        // 创建 AI 客户端
        const client = getAIClient(provider, finalApiKey, finalBaseURL);
        const finalModel = model || getDefaultModel(provider);

        // 构建消息历史
        const chatMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
        ];

        // 设置 SSE 响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // 流式调用 AI
        const stream = await client.chat.completions.create({
            model: finalModel,
            messages: chatMessages,
            temperature: temperature,
            stream: true,
        });

        // 发送流式响应
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        // 发送完成信号
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('AI Chat Error:', error);

        // 如果响应还没有开始发送，返回 JSON 错误
        if (!res.headersSent) {
            res.status(500).json({
                error: error.message || 'AI request failed',
                details: error.response?.data || null,
            });
        } else {
            // 如果已经开始流式响应，发送错误事件
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }
});

// 非流式聊天 API（用于简单请求）
router.post('/chat/sync', async (req, res) => {
    try {
        const {
            messages,
            provider = process.env.AI_PROVIDER || 'openai',
            model = process.env.AI_MODEL,
            apiKey,
            baseURL,
            temperature = 0.7,
            accessCode,
        } = req.body;

        // 验证访问密码
        const accessCodeList = process.env.ACCESS_CODE_LIST?.split(',').filter(Boolean) || [];
        if (accessCodeList.length > 0 && !accessCodeList.includes(accessCode)) {
            return res.status(401).json({ error: 'Invalid access code' });
        }

        // 获取 API Key
        let finalApiKey = apiKey;
        if (!finalApiKey) {
            switch (provider) {
                case 'openai':
                    finalApiKey = process.env.OPENAI_API_KEY;
                    break;
                case 'deepseek':
                    finalApiKey = process.env.DEEPSEEK_API_KEY;
                    break;
                case 'siliconflow':
                    finalApiKey = process.env.SILICONFLOW_API_KEY;
                    break;
            }
        }

        if (!finalApiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        // 获取 baseURL
        let finalBaseURL = baseURL;
        if (!finalBaseURL) {
            switch (provider) {
                case 'openai':
                    finalBaseURL = process.env.OPENAI_BASE_URL;
                    break;
                case 'deepseek':
                    finalBaseURL = process.env.DEEPSEEK_BASE_URL;
                    break;
                case 'siliconflow':
                    finalBaseURL = process.env.SILICONFLOW_BASE_URL;
                    break;
            }
        }

        const client = getAIClient(provider, finalApiKey, finalBaseURL);
        const finalModel = model || getDefaultModel(provider);

        const chatMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
        ];

        const response = await client.chat.completions.create({
            model: finalModel,
            messages: chatMessages,
            temperature: temperature,
        });

        const content = response.choices[0]?.message?.content || '';

        res.json({
            content,
            model: finalModel,
            usage: response.usage,
        });

    } catch (error) {
        console.error('AI Chat Sync Error:', error);
        res.status(500).json({
            error: error.message || 'AI request failed',
            details: error.response?.data || null,
        });
    }
});

// 获取支持的提供商和模型列表
router.get('/providers', (req, res) => {
    res.json({
        providers: [
            {
                id: 'openai',
                name: 'OpenAI',
                models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
                supportsCustomEndpoint: true,
            },
            {
                id: 'anthropic',
                name: 'Anthropic',
                models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
                supportsCustomEndpoint: false,
            },
            {
                id: 'deepseek',
                name: 'DeepSeek',
                models: ['deepseek-chat', 'deepseek-reasoner'],
                supportsCustomEndpoint: true,
            },
            {
                id: 'siliconflow',
                name: '硅基流动 (SiliconFlow)',
                models: [
                    'deepseek-ai/DeepSeek-V3',
                    'deepseek-ai/DeepSeek-R1',
                    'Pro/deepseek-ai/DeepSeek-V3',
                    'Qwen/Qwen2.5-72B-Instruct',
                    'Qwen/Qwen2.5-Coder-32B-Instruct',
                    'meta-llama/Llama-3.3-70B-Instruct',
                ],
                supportsCustomEndpoint: true,
            },
        ],
        currentProvider: process.env.AI_PROVIDER || 'openai',
        currentModel: process.env.AI_MODEL || 'gpt-4o',
    });
});

module.exports = router;
