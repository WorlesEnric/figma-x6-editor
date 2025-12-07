/**
 * AI Store - 管理 AI 聊天状态和配置
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface AIConfig {
    provider: string;
    model: string;
    apiKey: string;
    baseURL?: string;
    accessCode?: string;
    temperature: number;
}

// 目标元素信息（用于样式修改模式）
export interface TargetElementInfo {
    id: string;
    shape: string;
    label?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    attrs: {
        body: {
            fill?: string;
            stroke?: string;
            strokeWidth?: number;
            rx?: number;
            ry?: number;
        };
        label: {
            fill?: string;
            fontSize?: number;
            fontWeight?: string | number;
            fontFamily?: string;
        };
    };
}

interface AIStore {
    // 消息历史
    messages: Message[];
    addMessage: (role: 'user' | 'assistant', content: string) => void;
    updateLastMessage: (content: string) => void;
    clearMessages: () => void;

    // 加载状态
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    // 流式内容
    streamingContent: string;
    setStreamingContent: (content: string) => void;
    appendStreamingContent: (chunk: string) => void;

    // 聊天面板可见性
    isPanelVisible: boolean;
    togglePanel: () => void;
    showPanel: () => void;
    hidePanel: () => void;

    // 面板位置和大小
    panelPosition: { x: number; y: number };
    panelSize: { width: number; height: number };
    setPanelPosition: (x: number, y: number) => void;
    setPanelSize: (width: number, height: number) => void;

    // AI 配置
    config: AIConfig;
    setConfig: (config: Partial<AIConfig>) => void;

    // 错误处理
    error: string | null;
    setError: (error: string | null) => void;

    // 目标元素（样式修改模式）
    targetElement: TargetElementInfo | null;
    setTargetElement: (element: TargetElementInfo) => void;
    clearTargetElement: () => void;
}

export const useAIStore = create<AIStore>()(
    persist(
        (set) => ({
            // 初始状态
            messages: [
                {
                    id: 'welcome',
                    role: 'assistant' as const,
                    content: '你好！我是 AI 架构助手。描述你想要构建的图表，我会帮你绘制。\n\n例如：\n- "创建一个简单的流程图：开始 → 处理 → 结束"\n- "画一个 AWS 架构图，包含 EC2、RDS 和 S3"\n- "设计一个用户登录流程"',
                    timestamp: Date.now(),
                },
            ],
            isLoading: false,
            streamingContent: '',
            isPanelVisible: false,
            panelPosition: { x: 100, y: 100 },
            panelSize: { width: 400, height: 500 },
            config: {
                provider: 'siliconflow',
                model: 'deepseek-ai/DeepSeek-V3',
                apiKey: '',
                temperature: 0.7,
            },
            error: null,

            // 消息管理
            addMessage: (role, content) => {
                const message: Message = {
                    id: Date.now().toString(),
                    role,
                    content,
                    timestamp: Date.now(),
                };
                set((state) => ({
                    messages: [...state.messages, message],
                }));
            },

            updateLastMessage: (content) => {
                set((state) => {
                    const messages = [...state.messages];
                    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
                        messages[messages.length - 1].content = content;
                    }
                    return { messages };
                });
            },

            clearMessages: () => {
                set({
                    messages: [
                        {
                            id: 'welcome',
                            role: 'assistant' as const,
                            content: '你好！我是 AI 架构助手。描述你想要构建的图表，我会帮你绘制。',
                            timestamp: Date.now(),
                        },
                    ],
                });
            },

            // 加载状态
            setIsLoading: (loading) => set({ isLoading: loading }),

            // 流式内容
            setStreamingContent: (content) => set({ streamingContent: content }),
            appendStreamingContent: (chunk) =>
                set((state) => ({ streamingContent: state.streamingContent + chunk })),

            // 面板可见性
            togglePanel: () => set((state) => ({ isPanelVisible: !state.isPanelVisible })),
            showPanel: () => set({ isPanelVisible: true }),
            hidePanel: () => set({ isPanelVisible: false }),

            // 面板位置和大小
            setPanelPosition: (x, y) => set({ panelPosition: { x, y } }),
            setPanelSize: (width, height) => set({ panelSize: { width, height } }),

            // AI 配置
            setConfig: (config) =>
                set((state) => ({
                    config: { ...state.config, ...config },
                })),

            // 错误处理
            setError: (error) => set({ error }),

            // 目标元素（样式修改模式）
            targetElement: null,
            setTargetElement: (element) => set({ targetElement: element }),
            clearTargetElement: () => set({ targetElement: null }),
        }),
        {
            name: 'ai-store',
            partialize: (state) => ({
                config: state.config,
                panelPosition: state.panelPosition,
                panelSize: state.panelSize,
            }),
        }
    )
);
