/**
 * AI 聊天面板 - 可拖拽、可缩放的悬浮窗口
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { useAIStore } from '@/store';
import {
    sendChatMessage,
    parseGraphJSON,
    applyGraphData,
    sendStyleChatMessage,
    parseStyleJSON,
    applyStyleData
} from '@/services/aiService';
import { Bot, Send, X, Minimize2, Maximize2, GripVertical, Trash2, Settings, Copy, Check, Palette } from 'lucide-react';
import styles from './AIChatPanel.module.css';

/**
 * 过滤消息内容，移除 <graph-data> 和 <style-data> 标签及其内容
 * 只显示用户友好的自然语言描述
 */
function filterDisplayContent(content: string): string {
    // 移除 <graph-data>...</graph-data> 标签及其内容
    let filtered = content.replace(/<graph-data>[\s\S]*?<\/graph-data>/g, '').trim();
    // 移除 <style-data>...</style-data> 标签及其内容
    filtered = filtered.replace(/<style-data>[\s\S]*?<\/style-data>/g, '').trim();
    return filtered;
}

export function AIChatPanel() {
    const {
        messages,
        addMessage,
        isLoading,
        setIsLoading,
        streamingContent,
        setStreamingContent,
        appendStreamingContent,
        isPanelVisible,
        hidePanel,
        panelPosition,
        panelSize,
        setPanelPosition,
        setPanelSize,
        clearMessages,
        setError,
        targetElement,
        clearTargetElement,
    } = useAIStore();

    // 是否处于样式修改模式（由右键菜单触发）
    const isStyleMode = targetElement !== null;

    const [inputValue, setInputValue] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // 复制消息内容
    const handleCopy = useCallback(async (content: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(messageId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, []);

    const panelRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
    const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number; posX: number; posY: number } | null>(null);

    // 滚动到最新消息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    // 拖拽处理
    const handleDragStart = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest(`.${styles.resizeHandle}`)) return;

        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            posX: panelPosition.x,
            posY: panelPosition.y,
        };
        e.preventDefault();
    }, [panelPosition]);

    const handleDrag = useCallback((e: MouseEvent) => {
        if (!isDragging || !dragStartRef.current) return;

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        const newX = Math.max(0, Math.min(window.innerWidth - 100, dragStartRef.current.posX + dx));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, dragStartRef.current.posY + dy));

        setPanelPosition(newX, newY);
    }, [isDragging, setPanelPosition]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        dragStartRef.current = null;
    }, []);

    // 缩放处理
    const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
        setIsResizing(true);
        setResizeDirection(direction);
        resizeStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            width: panelSize.width,
            height: panelSize.height,
            posX: panelPosition.x,
            posY: panelPosition.y,
        };
        e.preventDefault();
        e.stopPropagation();
    }, [panelSize, panelPosition]);

    const handleResize = useCallback((e: MouseEvent) => {
        if (!isResizing || !resizeStartRef.current || !resizeDirection) return;

        const dx = e.clientX - resizeStartRef.current.x;
        const dy = e.clientY - resizeStartRef.current.y;

        let newWidth = resizeStartRef.current.width;
        let newHeight = resizeStartRef.current.height;
        let newX = resizeStartRef.current.posX;
        let newY = resizeStartRef.current.posY;

        // 根据方向调整大小
        if (resizeDirection.includes('e')) {
            newWidth = Math.max(300, resizeStartRef.current.width + dx);
        }
        if (resizeDirection.includes('w')) {
            const widthDelta = Math.min(dx, resizeStartRef.current.width - 300);
            newWidth = resizeStartRef.current.width - widthDelta;
            newX = resizeStartRef.current.posX + widthDelta;
        }
        if (resizeDirection.includes('s')) {
            newHeight = Math.max(300, resizeStartRef.current.height + dy);
        }
        if (resizeDirection.includes('n')) {
            const heightDelta = Math.min(dy, resizeStartRef.current.height - 300);
            newHeight = resizeStartRef.current.height - heightDelta;
            newY = resizeStartRef.current.posY + heightDelta;
        }

        setPanelSize(newWidth, newHeight);
        setPanelPosition(newX, newY);
    }, [isResizing, resizeDirection, setPanelSize, setPanelPosition]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        setResizeDirection(null);
        resizeStartRef.current = null;
    }, []);

    // 添加全局鼠标事件监听
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDrag);
            window.addEventListener('mouseup', handleDragEnd);
            return () => {
                window.removeEventListener('mousemove', handleDrag);
                window.removeEventListener('mouseup', handleDragEnd);
            };
        }
    }, [isDragging, handleDrag, handleDragEnd]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleResize);
            window.addEventListener('mouseup', handleResizeEnd);
            return () => {
                window.removeEventListener('mousemove', handleResize);
                window.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [isResizing, handleResize, handleResizeEnd]);

    // 发送消息
    const handleSend = async () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        // 添加用户消息
        addMessage('user', trimmedInput);
        setInputValue('');
        setIsLoading(true);
        setStreamingContent('');
        setError(null);

        // 添加一个空的 AI 消息占位
        addMessage('assistant', '');

        // 检查是否为样式修改模式（使用从右键菜单传入的 targetElement）
        const elementInfo = isStyleMode ? targetElement : null;
        const targetNodeId = elementInfo?.id; // 记录目标节点 ID

        if (elementInfo) {
            // 样式修改模式
            await sendStyleChatMessage(
                trimmedInput,
                elementInfo,
                // onChunk
                (chunk) => {
                    appendStreamingContent(chunk);
                },
                // onComplete
                (fullContent) => {
                    setIsLoading(false);

                    // 更新最后一条消息
                    const currentMessages = useAIStore.getState().messages;
                    if (currentMessages.length > 0) {
                        const lastIndex = currentMessages.length - 1;
                        if (currentMessages[lastIndex].role === 'assistant') {
                            currentMessages[lastIndex].content = fullContent;
                            useAIStore.setState({ messages: [...currentMessages] });
                        }
                    }

                    setStreamingContent('');

                    // 尝试解析样式修改数据并应用
                    const styleData = parseStyleJSON(fullContent);
                    if (styleData) {
                        const success = applyStyleData(styleData, targetNodeId);
                        if (success) {
                            // 完成后清除目标元素，并在消息末尾追加成功提示
                            clearTargetElement();
                            const currentMessages = useAIStore.getState().messages;
                            if (currentMessages.length > 0) {
                                const lastIndex = currentMessages.length - 1;
                                if (currentMessages[lastIndex].role === 'assistant') {
                                    currentMessages[lastIndex].content = fullContent + '\n\n✅ 样式已成功应用！';
                                    useAIStore.setState({ messages: [...currentMessages] });
                                }
                            }
                        }
                    }
                },
                // onError
                (error) => {
                    setIsLoading(false);
                    setStreamingContent('');
                    setError(error);

                    const currentMessages = useAIStore.getState().messages;
                    if (currentMessages.length > 0) {
                        const lastIndex = currentMessages.length - 1;
                        if (currentMessages[lastIndex].role === 'assistant' && !currentMessages[lastIndex].content) {
                            currentMessages[lastIndex].content = `❌ 错误: ${error}`;
                            useAIStore.setState({ messages: [...currentMessages] });
                        }
                    }
                }
            );
        } else {
            // 图表生成模式
            await sendChatMessage(
                trimmedInput,
                // onChunk
                (chunk) => {
                    appendStreamingContent(chunk);
                },
                // onComplete
                (fullContent) => {
                    setIsLoading(false);

                    // 更新最后一条消息
                    const currentMessages = useAIStore.getState().messages;
                    if (currentMessages.length > 0) {
                        const lastIndex = currentMessages.length - 1;
                        if (currentMessages[lastIndex].role === 'assistant') {
                            currentMessages[lastIndex].content = fullContent;
                            useAIStore.setState({ messages: [...currentMessages] });
                        }
                    }

                    setStreamingContent('');

                    // 尝试解析图表数据并应用
                    const graphData = parseGraphJSON(fullContent);
                    if (graphData) {
                        try {
                            applyGraphData(graphData, false);
                            // 添加成功提示
                            addMessage('assistant', '✅ 图表已成功生成并添加到画布！');
                        } catch (error) {
                            console.error('Failed to apply graph data:', error);
                        }
                    }
                },
                // onError
                (error) => {
                    setIsLoading(false);
                    setStreamingContent('');
                    setError(error);

                    // 更新最后一条消息为错误信息
                    const currentMessages = useAIStore.getState().messages;
                    if (currentMessages.length > 0) {
                        const lastIndex = currentMessages.length - 1;
                        if (currentMessages[lastIndex].role === 'assistant' && !currentMessages[lastIndex].content) {
                            currentMessages[lastIndex].content = `❌ 错误: ${error}`;
                            useAIStore.setState({ messages: [...currentMessages] });
                        }
                    }
                }
            );
        }
    };

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isPanelVisible) return null;

    return (
        <div
            ref={panelRef}
            className={`${styles.panel} ${isMinimized ? styles.minimized : ''} ${isDragging ? styles.dragging : ''}`}
            style={{
                left: panelPosition.x,
                top: panelPosition.y,
                width: isMinimized ? 280 : panelSize.width,
                height: isMinimized ? 48 : panelSize.height,
            }}
        >
            {/* 标题栏 */}
            <div
                className={styles.header}
                onMouseDown={handleDragStart}
            >
                <div className={styles.headerLeft}>
                    <GripVertical size={16} className={styles.dragHandle} />
                    <Bot size={18} className={styles.logo} />
                    <span className={styles.title}>ArchMind AI</span>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.headerButton}
                        onClick={() => setShowSettings(!showSettings)}
                        title="设置"
                    >
                        <Settings size={16} />
                    </button>
                    <button
                        className={styles.headerButton}
                        onClick={() => setIsMinimized(!isMinimized)}
                        title={isMinimized ? '展开' : '最小化'}
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button
                        className={styles.headerButton}
                        onClick={hidePanel}
                        title="关闭"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* 设置面板 */}
            {showSettings && !isMinimized && (
                <SettingsPanel onClose={() => setShowSettings(false)} />
            )}

            {/* 消息列表 */}
            {!isMinimized && !showSettings && (
                <>
                    <div className={styles.messages}>
                        {messages.map((message, index) => {
                            const messageId = message.id || String(index);
                            const rawContent = message.content || (isLoading && index === messages.length - 1 ? streamingContent : '');
                            // 过滤掉 <graph-data> 标签内容，只显示友好的描述文字
                            const displayContent = message.role === 'assistant'
                                ? filterDisplayContent(rawContent)
                                : rawContent;

                            return (
                                <div
                                    key={messageId}
                                    className={`${styles.message} ${styles[message.role]}`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className={styles.avatar}>
                                            <Bot size={20} />
                                        </div>
                                    )}
                                    <div className={styles.messageWrapper}>
                                        <div className={styles.messageContent}>
                                            {displayContent}
                                            {isLoading && index === messages.length - 1 && (
                                                <span className={styles.cursor}>▋</span>
                                            )}
                                        </div>
                                        {/* 复制按钮 - 只在有内容时显示 */}
                                        {displayContent && !isLoading && (
                                            <button
                                                className={styles.copyButton}
                                                onClick={() => handleCopy(displayContent, messageId)}
                                                title="复制"
                                            >
                                                {copiedId === messageId ? (
                                                    <Check size={14} className={styles.copySuccess} />
                                                ) : (
                                                    <Copy size={14} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 输入区域 */}
                    <div className={styles.inputArea}>
                        {/* 选中图形的附件标签 */}
                        {isStyleMode && targetElement && (
                            <div className={styles.attachmentArea}>
                                <div className={styles.attachmentTag}>
                                    <Palette size={14} className={styles.attachmentIcon} />
                                    <span className={styles.attachmentLabel}>{targetElement.shape}</span>
                                    <button
                                        className={styles.attachmentRemove}
                                        onClick={clearTargetElement}
                                        title="移除"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className={styles.inputRow}>
                            <button
                                className={styles.clearButton}
                                onClick={clearMessages}
                                title="清空对话"
                            >
                                <Trash2 size={16} />
                            </button>
                            <input
                                type="text"
                                className={styles.input}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isStyleMode ? "描述你想要的样式修改..." : "描述你想要的图表..."}
                                disabled={isLoading}
                            />
                            <button
                                className={styles.sendButton}
                                onClick={handleSend}
                                disabled={isLoading || !inputValue.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* 缩放手柄 */}
            {!isMinimized && (
                <>
                    <div
                        className={`${styles.resizeHandle} ${styles.resizeN}`}
                        onMouseDown={(e) => handleResizeStart(e, 'n')}
                    />
                    <div
                        className={`${styles.resizeHandle} ${styles.resizeS}`}
                        onMouseDown={(e) => handleResizeStart(e, 's')}
                    />
                    <div
                        className={`${styles.resizeHandle} ${styles.resizeE}`}
                        onMouseDown={(e) => handleResizeStart(e, 'e')}
                    />
                    <div
                        className={`${styles.resizeHandle} ${styles.resizeW}`}
                        onMouseDown={(e) => handleResizeStart(e, 'w')}
                    />
                    <div
                        className={`${styles.resizeHandle} ${styles.resizeNE}`}
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                    />
                    <div
                        className={`${styles.resizeHandle} ${styles.resizeNW}`}
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                    />
                    <div
                        className={`${styles.resizeHandle} ${styles.resizeSE}`}
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                    />
                    <div
                        className={`${styles.resizeHandle} ${styles.resizeSW}`}
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                    />
                </>
            )}
        </div>
    );
}

/**
 * 设置面板组件
 */
function SettingsPanel({ onClose }: { onClose: () => void }) {
    const { config, setConfig } = useAIStore();
    const [localConfig, setLocalConfig] = useState(config);

    const providers = [
        { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] },
        { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'] },
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
            ]
        },
    ];

    const currentProvider = providers.find(p => p.id === localConfig.provider) || providers[0];

    const handleSave = () => {
        setConfig(localConfig);
        onClose();
    };

    return (
        <div className={styles.settings}>
            <h3 className={styles.settingsTitle}>AI 配置</h3>

            <div className={styles.settingsField}>
                <label>提供商</label>
                <select
                    value={localConfig.provider}
                    onChange={(e) => setLocalConfig({ ...localConfig, provider: e.target.value, model: providers.find(p => p.id === e.target.value)?.models[0] || '' })}
                >
                    {providers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.settingsField}>
                <label>模型</label>
                <select
                    value={localConfig.model}
                    onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                >
                    {currentProvider.models.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            <div className={styles.settingsField}>
                <label>API Key</label>
                <input
                    type="password"
                    value={localConfig.apiKey}
                    onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                    placeholder="输入 API Key..."
                />
            </div>

            <div className={styles.settingsField}>
                <label>自定义端点 (可选)</label>
                <input
                    type="text"
                    value={localConfig.baseURL || ''}
                    onChange={(e) => setLocalConfig({ ...localConfig, baseURL: e.target.value })}
                    placeholder="https://api.example.com/v1"
                />
            </div>

            <div className={styles.settingsField}>
                <label>Temperature: {localConfig.temperature}</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localConfig.temperature}
                    onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
                />
            </div>

            <div className={styles.settingsActions}>
                <button className={styles.cancelButton} onClick={onClose}>取消</button>
                <button className={styles.saveButton} onClick={handleSave}>保存</button>
            </div>
        </div>
    );
}

export default AIChatPanel;
