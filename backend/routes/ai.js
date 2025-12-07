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

// 样式修改的系统提示词
const STYLE_EDIT_PROMPT = `你是一个专业的图表样式设计助手，帮助用户修改 AntV X6 图表元素的样式和形状类型。

## 你的任务
用户会提供一个选中图形的当前信息，以及他们想要的修改。你需要理解用户的意图并给出具体的修改方案。

## 回复格式
1. 用友好的中文描述你将做的修改
2. 在回复末尾用 \`<style-data>\` 标签包含修改的 JSON 数据

## 可修改的属性

### 形状类型 (shape) - 可以更换图形类型！
可用的形状类型：
- custom-rect: 矩形
- custom-rounded-rect: 圆角矩形
- custom-ellipse: 圆形/椭圆
- custom-diamond: 菱形
- custom-triangle: 三角形
- custom-hexagon: 六边形
- custom-star: 五角星
- custom-pentagon: 五边形
- custom-parallelogram: 平行四边形
- custom-trapezoid: 梯形
- custom-cylinder: 圆柱体
- custom-cloud: 云朵
- custom-callout: 对话气泡
- custom-arrow-right: 箭头形状
- custom-document: 文档形状
- custom-note: 便签
- custom-cube: 立方体
- custom-plus: 加号
- custom-actor: 人物

**填充属性 (body):**
- fill: 填充颜色 (如 "#5F95FF", "transparent")
- fillOpacity: 填充透明度 (0-1)

**边框属性 (body):**
- stroke: 边框颜色
- strokeWidth: 边框宽度 (1-10)
- strokeOpacity: 边框透明度 (0-1)
- strokeDasharray: 虚线样式 (如 "5,5" 表示虚线)
- rx, ry: 圆角半径

**文本属性 (label):**
- fill: 文字颜色
- fontSize: 字号 (12-72)
- fontWeight: 字重 (normal, bold, 500, 600, 700)
- fontFamily: 字体
- text: 文本内容

**尺寸属性:**
- width: 宽度
- height: 高度

## 颜色参考
- 红色系: #F5222D, #FF4D4F, #FF7875
- 橙色系: #FA8C16, #FAAD14, #FFC53D
- 黄色系: #FADB14, #FFEC3D
- 绿色系: #52C41A, #73D13D, #95DE64
- 蓝色系: #1890FF, #40A9FF, #69C0FF, #5F95FF
- 紫色系: #722ED1, #9254DE, #B37FEB
- 青色系: #13C2C2, #36CFC9, #5CDBD3
- 粉色系: #EB2F96, #F759AB, #FF85C0

## JSON 格式

### 只修改样式：
\`\`\`json
{
  "action": "updateStyle",
  "attrs": {
    "body": {
      "fill": "#新颜色",
      "stroke": "#边框颜色",
      "strokeWidth": 2
    },
    "label": {
      "fill": "#文字颜色",
      "fontSize": 14
    }
  },
  "size": {
    "width": 120,
    "height": 60
  }
}
\`\`\`

### 更换形状类型（同时可修改样式）：
\`\`\`json
{
  "action": "updateStyle",
  "shape": "custom-ellipse",
  "attrs": {
    "body": {
      "fill": "#现有填充色"
    }
  },
  "size": {
    "width": 80,
    "height": 80
  }
}
\`\`\`

只包含需要修改的属性，不需要修改的属性不要包含在 JSON 中。
当用户要求更换形状时，务必包含 "shape" 字段。

## 示例

用户：把这个矩形改成红色
回复：
好的！我来把这个矩形的填充颜色改成红色。红色会让这个元素更加醒目，适合用来表示重要或警告信息。

<style-data>
{"action":"updateStyle","attrs":{"body":{"fill":"#FF4D4F","stroke":"#F5222D"},"label":{"fill":"#ffffff"}}}
</style-data>

用户：把这个改成圆形
回复：
明白了！我来把这个图形变成圆形。我会保留现有的样式设置，只更换形状类型为椭圆，并设置宽高相等使其呈现为正圆。

<style-data>
{"action":"updateStyle","shape":"custom-ellipse","size":{"width":80,"height":80}}
</style-data>

用户：变成三角形，蓝色
回复：
好的！我来把这个图形变成蓝色的三角形。三角形可以用来表示方向、警告或层次关系。

<style-data>
{"action":"updateStyle","shape":"custom-triangle","attrs":{"body":{"fill":"#1890FF","stroke":"#0050B3"},"label":{"fill":"#ffffff"}}}
</style-data>

用户：把字改大一点，改成蓝色
回复：
没问题！我来调大字号并改成蓝色。这样文字会更清晰易读。

<style-data>
{"action":"updateStyle","attrs":{"label":{"fontSize":18,"fill":"#1890FF"}}}
</style-data>

现在请根据用户的描述修改图形样式或形状类型。`;

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
            mode = 'graph', // 'graph' 或 'style'
            elementInfo = null, // 选中元素的信息
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

        // 根据模式选择系统提示词
        let systemPrompt = SYSTEM_PROMPT;
        if (mode === 'style' && elementInfo) {
            // 样式修改模式：添加元素信息到提示词
            systemPrompt = STYLE_EDIT_PROMPT + `\n\n## 当前选中的图形信息\n\`\`\`json\n${JSON.stringify(elementInfo, null, 2)}\n\`\`\``;
        }

        // 构建消息历史
        const chatMessages = [
            { role: 'system', content: systemPrompt },
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
