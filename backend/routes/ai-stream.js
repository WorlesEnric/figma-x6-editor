/**
 * AI Stream Routes - 使用 Vercel AI SDK
 * 支持流式工具调用，实现边输出边渲染图表
 */

const express = require('express');
const router = express.Router();
const { createOpenAI } = require('@ai-sdk/openai');
const { createOpenAICompatible } = require('@ai-sdk/openai-compatible');
const { streamText } = require('ai');
const { z } = require('zod');

// 节点 Schema
const nodeSchema = z.object({
    id: z.string().describe('节点唯一ID'),
    shape: z.string().describe('形状类型，如 custom-rect, custom-ellipse 等'),
    x: z.number().describe('X 坐标'),
    y: z.number().describe('Y 坐标'),
    width: z.number().describe('宽度'),
    height: z.number().describe('高度'),
    label: z.string().optional().describe('节点标签文本'),
    attrs: z.object({
        body: z.object({
            fill: z.string().optional(),
            stroke: z.string().optional(),
            strokeWidth: z.number().optional(),
            rx: z.number().optional(),
            ry: z.number().optional(),
        }).optional(),
        label: z.object({
            fill: z.string().optional(),
            fontSize: z.number().optional(),
            fontWeight: z.union([z.string(), z.number()]).optional(),
        }).optional(),
    }).optional(),
});

// 边 Schema
const edgeSchema = z.object({
    id: z.string().describe('边的唯一ID'),
    source: z.string().describe('源节点ID'),
    target: z.string().describe('目标节点ID'),
    label: z.string().optional().describe('边的标签'),
    attrs: z.object({
        line: z.object({
            stroke: z.string().optional(),
            strokeWidth: z.number().optional(),
            strokeDasharray: z.string().optional(),
        }).optional(),
    }).optional(),
});

// X6 图表生成的系统提示词
const SYSTEM_PROMPT = `你是一个专业的图表设计助手，帮助用户创建 AntV X6 图表。

## 工具使用
你必须使用 create_graph 工具来创建图表。不要在文本中输出 JSON 数据。

## 可用的形状类型

### 基础形状
- custom-rect: 矩形（通用节点）
- custom-rounded-rect: 圆角矩形（开始/结束/状态）
- custom-ellipse: 椭圆/圆形（开始/结束/事件）
- custom-diamond: 菱形（判断/决策/条件）
- custom-triangle: 三角形（警告/方向）
- custom-hexagon: 六边形（准备/复杂步骤）
- custom-pentagon: 五边形
- custom-star: 五角星（重要/目标）
- custom-plus: 加号（添加/合并）

### 专业形状
- custom-cylinder: 圆柱体（数据库/存储）
- custom-parallelogram: 平行四边形（输入/输出/数据）
- custom-trapezoid: 梯形（手动操作）
- custom-document: 文档形状（文件/报告）
- custom-note: 便签（注释/备注）
- custom-cloud: 云朵（云服务/外部系统）
- custom-callout: 对话气泡（说明/标注）
- custom-cube: 立方体（3D组件/服务）
- custom-arrow-right: 箭头形状（流向/方向）
- custom-actor: 人物（用户/角色）

## 颜色方案
- 开始节点: 绿色 #52C41A, #73D13D
- 处理节点: 蓝色 #1890FF, #5F95FF, #40A9FF
- 决策节点: 橙色/黄色 #FA8C16, #FAAD14
- 结束节点: 红色 #F5222D, #FF4D4F
- 数据库/存储: 紫色 #722ED1, #9254DE
- 云服务: 青色 #13C2C2, #36CFC9
- 用户/角色: 粉色 #EB2F96

## 布局规则
1. 起始位置: x=100, y=100
2. 垂直流程图: 节点垂直排列，每行间距 100-120px
3. 水平流程图: 节点水平排列，每列间距 180-200px
4. 保持对齐，使图表整洁美观

## 设计原则
1. 使用不同形状区分节点类型
2. 使用颜色编码区分功能区域
3. 边框颜色通常比填充色深
4. 深色背景用白色文字，浅色背景用深色文字

## 回复格式
1. 先用自然语言简短描述你的规划
2. 然后调用 create_graph 工具创建图表`;

// 样式修改的系统提示词
const STYLE_EDIT_PROMPT = `你是一个专业的图表样式设计助手，帮助用户修改 AntV X6 图表元素的样式和形状类型。

## 工具使用
你必须使用 update_style 工具来修改图形样式。

## 可修改的属性

### 形状类型 (shape)
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

### 填充属性 (body)
- fill: 填充颜色
- fillOpacity: 填充透明度 (0-1)
- stroke: 边框颜色
- strokeWidth: 边框宽度 (1-10)
- rx, ry: 圆角半径

### 文本属性 (label)
- fill: 文字颜色
- fontSize: 字号 (12-72)
- fontWeight: 字重

### 尺寸属性
- width: 宽度
- height: 高度

## 颜色参考
- 红色系: #F5222D, #FF4D4F
- 橙色系: #FA8C16, #FAAD14
- 绿色系: #52C41A, #73D13D
- 蓝色系: #1890FF, #5F95FF
- 紫色系: #722ED1, #9254DE
- 青色系: #13C2C2, #36CFC9

## 回复格式
1. 先用自然语言简短描述你的修改
2. 然后调用 update_style 工具应用修改`;

// 获取 AI 模型
function getAIModel(provider, apiKey, baseURL) {
    // 根据 provider 选择模型名称
    // 注意：使用支持 Tool Calling 的模型
    const modelMap = {
        openai: 'gpt-4o',
        deepseek: 'deepseek-chat',
        // 使用 MiniMax-M2 因为它支持工具调用
        siliconflow: 'MiniMaxAI/MiniMax-M2',
    };

    const modelName = modelMap[provider] || 'gpt-4o';

    console.log('Using model:', modelName, 'for provider:', provider);

    if (provider === 'openai') {
        // OpenAI 使用原生 SDK
        const openai = createOpenAI({
            apiKey: apiKey,
            baseURL: baseURL || undefined,
        });
        return openai(modelName);
    } else {
        // 非 OpenAI 供应商使用兼容模式
        const compatible = createOpenAICompatible({
            name: provider,
            apiKey: apiKey,
            baseURL: baseURL,
        });
        return compatible(modelName);
    }
}

// 流式聊天 API - 使用 Tool Calling
router.post('/chat', async (req, res) => {
    try {
        const {
            messages,
            provider = process.env.AI_PROVIDER || 'openai',
            model,
            apiKey,
            baseURL,
            accessCode,
            mode = 'graph', // 'graph' 或 'style'
            elementInfo = null,
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
                    finalBaseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
                    break;
                case 'siliconflow':
                    finalBaseURL = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
                    break;
            }
        }

        // 创建 AI 模型
        const aiModel = getAIModel(provider, finalApiKey, finalBaseURL);

        // 根据模式选择系统提示词和工具
        let systemPrompt = SYSTEM_PROMPT;
        let tools = {
            create_graph: {
                description: '创建 AntV X6 图表，包含节点和边。调用此工具后图表会实时渲染在画布上。',
                parameters: z.object({
                    nodes: z.array(nodeSchema).describe('图表节点数组'),
                    edges: z.array(edgeSchema).describe('图表边数组'),
                }),
            },
        };

        if (mode === 'style' && elementInfo) {
            systemPrompt = STYLE_EDIT_PROMPT + `\n\n## 当前选中的图形信息\n\`\`\`json\n${JSON.stringify(elementInfo, null, 2)}\n\`\`\``;
            tools = {
                update_style: {
                    description: '更新选中图形的样式或形状类型',
                    parameters: z.object({
                        shape: z.string().optional().describe('新的形状类型，如 custom-ellipse'),
                        attrs: z.object({
                            body: z.object({
                                fill: z.string().optional(),
                                stroke: z.string().optional(),
                                strokeWidth: z.number().optional(),
                                rx: z.number().optional(),
                                ry: z.number().optional(),
                            }).optional(),
                            label: z.object({
                                fill: z.string().optional(),
                                fontSize: z.number().optional(),
                                fontWeight: z.union([z.string(), z.number()]).optional(),
                            }).optional(),
                        }).optional(),
                        size: z.object({
                            width: z.number().optional(),
                            height: z.number().optional(),
                        }).optional(),
                    }),
                },
            };
        }

        // 构建消息
        const coreMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
        ];

        // 设置响应头为流式
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 使用 streamText
        const result = await streamText({
            model: aiModel,
            messages: coreMessages,
            tools,
            maxSteps: 2,
        });

        // 流式输出
        for await (const chunk of result.fullStream) {
            // 调试：打印 chunk 类型
            console.log('Chunk type:', chunk.type, 'Data:', JSON.stringify(chunk).substring(0, 200));

            if (chunk.type === 'text-delta') {
                // 文本增量 - 只在有内容时发送
                const text = chunk.textDelta || '';
                if (text) {
                    res.write(`data: ${JSON.stringify({ type: 'text-delta', content: text })}\n\n`);
                }
            } else if (chunk.type === 'tool-call') {
                // 工具调用完成
                console.log('Tool call:', chunk.toolName, chunk.args ? JSON.stringify(chunk.args).substring(0, 500) : 'no args');
                res.write(`data: ${JSON.stringify({
                    type: 'tool-call',
                    toolName: chunk.toolName,
                    args: chunk.args,
                })}\n\n`);
            } else if (chunk.type === 'tool-call-streaming-start') {
                // 工具调用开始
                res.write(`data: ${JSON.stringify({
                    type: 'tool-call-start',
                    toolName: chunk.toolName,
                    toolCallId: chunk.toolCallId,
                })}\n\n`);
            } else if (chunk.type === 'tool-call-delta') {
                // 工具参数增量
                res.write(`data: ${JSON.stringify({
                    type: 'tool-call-delta',
                    toolCallId: chunk.toolCallId,
                    argsTextDelta: chunk.argsTextDelta,
                })}\n\n`);
            } else if (chunk.type === 'finish') {
                // 完成
                res.write(`data: ${JSON.stringify({ type: 'finish' })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('AI Stream Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Internal server error' });
        } else {
            res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
            res.end();
        }
    }
});

module.exports = router;
