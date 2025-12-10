/**
 * AI Stream Service - 使用 EventSource 处理流式响应
 * 支持工具调用的流式图表渲染
 */

import { useEditorStore } from '@/store';

// API 配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 工具调用的参数类型
interface GraphNode {
    id: string;
    shape: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    attrs?: {
        body?: {
            fill?: string;
            stroke?: string;
            strokeWidth?: number;
            rx?: number;
            ry?: number;
        };
        label?: {
            fill?: string;
            fontSize?: number;
            fontWeight?: string | number;
        };
    };
}

interface GraphEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    attrs?: {
        line?: {
            stroke?: string;
            strokeWidth?: number;
            strokeDasharray?: string;
        };
    };
}

interface CreateGraphArgs {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

interface UpdateStyleArgs {
    shape?: string;
    attrs?: {
        body?: Record<string, any>;
        label?: Record<string, any>;
    };
    size?: {
        width?: number;
        height?: number;
    };
}

// 流式事件类型
interface StreamEvent {
    type: 'text-delta' | 'tool-call' | 'tool-call-start' | 'tool-call-delta' | 'finish' | 'error';
    content?: string;
    toolName?: string;
    args?: any;
    toolCallId?: string;
    argsTextDelta?: string;
    message?: string;
}

// 回调类型
interface StreamCallbacks {
    onTextDelta?: (text: string) => void;
    onToolCallStart?: (toolName: string, toolCallId: string) => void;
    onToolCallDelta?: (toolCallId: string, argsDelta: string) => void;
    onToolCall?: (toolName: string, args: any) => void;
    onError?: (error: string) => void;
    onFinish?: () => void;
}

/**
 * 发送流式聊天消息
 */
export async function sendStreamChat(
    messages: { role: string; content: string }[],
    callbacks: StreamCallbacks,
    options: {
        mode?: 'graph' | 'style';
        elementInfo?: any;
        accessCode?: string;
    } = {}
): Promise<void> {
    const { mode = 'graph', elementInfo, accessCode } = options;

    try {
        const response = await fetch(`${API_BASE_URL}/api/ai-stream/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                mode,
                elementInfo,
                accessCode,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to connect to AI service');
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        // 用于累积工具调用参数
        const toolCallArgsBuffer: Record<string, string> = {};

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // 处理 SSE 格式的数据
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留最后一个不完整的行

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();

                    if (data === '[DONE]') {
                        callbacks.onFinish?.();
                        continue;
                    }

                    try {
                        const event: StreamEvent = JSON.parse(data);

                        switch (event.type) {
                            case 'text-delta':
                                if (event.content) {
                                    callbacks.onTextDelta?.(event.content);
                                }
                                break;

                            case 'tool-call-start':
                                if (event.toolName && event.toolCallId) {
                                    toolCallArgsBuffer[event.toolCallId] = '';
                                    callbacks.onToolCallStart?.(event.toolName, event.toolCallId);
                                }
                                break;

                            case 'tool-call-delta':
                                if (event.toolCallId && event.argsTextDelta) {
                                    toolCallArgsBuffer[event.toolCallId] =
                                        (toolCallArgsBuffer[event.toolCallId] || '') + event.argsTextDelta;
                                    callbacks.onToolCallDelta?.(event.toolCallId, event.argsTextDelta);
                                }
                                break;

                            case 'tool-call':
                                if (event.toolName && event.args) {
                                    callbacks.onToolCall?.(event.toolName, event.args);
                                }
                                break;

                            case 'finish':
                                callbacks.onFinish?.();
                                break;

                            case 'error':
                                callbacks.onError?.(event.message || 'Unknown error');
                                break;
                        }
                    } catch (e) {
                        console.warn('Failed to parse SSE event:', data, e);
                    }
                }
            }
        }
    } catch (error: any) {
        callbacks.onError?.(error.message || 'Stream connection failed');
        throw error;
    }
}

/**
 * 应用图表数据到画布（流式版本）
 */
export function applyStreamGraphData(args: CreateGraphArgs): boolean {
    const { graph } = useEditorStore.getState();
    if (!graph) {
        console.error('Graph not initialized');
        return false;
    }

    const timestamp = Date.now();
    const addedNodeIds: string[] = [];

    try {
        // 添加节点
        args.nodes.forEach((nodeData, index) => {
            const nodeId = `stream-node-${timestamp}-${nodeData.id || index}`;
            addedNodeIds.push(nodeId);

            const node = {
                id: nodeId,
                shape: nodeData.shape || 'custom-rect',
                x: nodeData.x,
                y: nodeData.y,
                width: nodeData.width || 120,
                height: nodeData.height || 60,
                attrs: {
                    body: {
                        fill: nodeData.attrs?.body?.fill || '#5F95FF',
                        stroke: nodeData.attrs?.body?.stroke || '#3A71CA',
                        strokeWidth: nodeData.attrs?.body?.strokeWidth || 2,
                        rx: nodeData.attrs?.body?.rx || 6,
                        ry: nodeData.attrs?.body?.ry || 6,
                    },
                    label: {
                        text: nodeData.label || '',
                        fill: nodeData.attrs?.label?.fill || '#ffffff',
                        fontSize: nodeData.attrs?.label?.fontSize || 14,
                        fontWeight: nodeData.attrs?.label?.fontWeight || 500,
                    },
                },
            };

            graph.addNode(node);
        });

        // ID 映射
        const nodeIdMap: Record<string, string> = {};
        args.nodes.forEach((nodeData, index) => {
            const originalId = nodeData.id || String(index);
            nodeIdMap[originalId] = `stream-node-${timestamp}-${originalId}`;
        });

        // 添加边
        args.edges.forEach((edgeData, index) => {
            const sourceId = nodeIdMap[edgeData.source] || edgeData.source;
            const targetId = nodeIdMap[edgeData.target] || edgeData.target;

            if (!graph.getCellById(sourceId) || !graph.getCellById(targetId)) {
                console.warn('Edge source or target not found:', edgeData);
                return;
            }

            const edge = {
                id: `stream-edge-${timestamp}-${edgeData.id || index}`,
                source: {
                    cell: sourceId,
                    connectionPoint: 'boundary',
                },
                target: {
                    cell: targetId,
                    connectionPoint: 'boundary',
                },
                router: { name: 'normal' },
                connector: { name: 'normal' },
                attrs: {
                    line: {
                        stroke: edgeData.attrs?.line?.stroke || '#5F95FF',
                        strokeWidth: edgeData.attrs?.line?.strokeWidth || 2,
                        strokeDasharray: edgeData.attrs?.line?.strokeDasharray || '',
                        targetMarker: {
                            name: 'block',
                            width: 12,
                            height: 8,
                        },
                    },
                },
            };

            graph.addEdge(edge);
        });

        // 居中显示
        if (addedNodeIds.length > 0) {
            const cells = addedNodeIds.map(id => graph.getCellById(id)).filter(Boolean);
            if (cells.length > 0) {
                graph.centerContent();
            }
        }

        console.log('Stream graph applied successfully');
        return true;
    } catch (error) {
        console.error('Failed to apply stream graph data:', error);
        return false;
    }
}

/**
 * 应用样式数据到选中元素（流式版本）
 */
export function applyStreamStyleData(args: UpdateStyleArgs, targetNodeId?: string): boolean {
    const { graph } = useEditorStore.getState();
    if (!graph) {
        console.error('Graph not initialized');
        return false;
    }

    let node;
    if (targetNodeId) {
        node = graph.getCellById(targetNodeId);
    } else {
        const selectedCells = graph.getSelectedCells();
        node = selectedCells.length > 0 ? selectedCells[0] : null;
    }

    if (!node || !node.isNode()) {
        console.error('No valid node to apply style');
        return false;
    }

    try {
        // 检查是否需要更换形状类型
        if (args.shape && args.shape !== node.shape) {
            const oldPosition = node.getPosition();
            const oldSize = node.getSize();
            const oldAttrs = node.getAttrs();
            const oldData = node.getData();
            const oldId = node.id;

            // 获取连接的边
            const connectedEdges = graph.getConnectedEdges(node);
            const edgeConnections: Array<{
                edge: any;
                isSource: boolean;
                sourcePortId?: string;
                targetPortId?: string;
            }> = [];

            connectedEdges.forEach(edge => {
                const sourceCell = edge.getSourceCell();
                edgeConnections.push({
                    edge,
                    isSource: sourceCell?.id === oldId,
                    sourcePortId: edge.getSourcePortId(),
                    targetPortId: edge.getTargetPortId(),
                });
            });

            const newWidth = args.size?.width || oldSize.width;
            const newHeight = args.size?.height || oldSize.height;

            // 创建新节点
            const newNode = graph.addNode({
                shape: args.shape,
                x: oldPosition.x,
                y: oldPosition.y,
                width: newWidth,
                height: newHeight,
                data: oldData,
            });

            // 应用原有样式
            if (oldAttrs.body) {
                for (const [key, value] of Object.entries(oldAttrs.body)) {
                    if (key !== 'refPoints' && key !== 'refD') {
                        newNode.attr(`body/${key}`, value as string | number);
                    }
                }
            }
            if (oldAttrs.label) {
                for (const [key, value] of Object.entries(oldAttrs.label)) {
                    newNode.attr(`label/${key}`, value as string | number);
                }
            }

            // 应用新样式
            if (args.attrs?.body) {
                for (const [key, value] of Object.entries(args.attrs.body)) {
                    newNode.attr(`body/${key}`, value as string | number);
                }
            }
            if (args.attrs?.label) {
                for (const [key, value] of Object.entries(args.attrs.label)) {
                    newNode.attr(`label/${key}`, value as string | number);
                }
            }

            // 重新连接边
            edgeConnections.forEach(({ edge, isSource, sourcePortId, targetPortId }) => {
                if (isSource) {
                    edge.setSource({ cell: newNode.id, port: sourcePortId });
                } else {
                    edge.setTarget({ cell: newNode.id, port: targetPortId });
                }
            });

            // 删除原节点
            graph.removeNode(node.id);

            // 选中新节点
            graph.cleanSelection();
            graph.select(newNode);

            return true;
        }

        // 普通样式修改
        if (args.attrs?.body) {
            for (const [key, value] of Object.entries(args.attrs.body)) {
                node.attr(`body/${key}`, value as string | number);
            }
        }

        if (args.attrs?.label) {
            for (const [key, value] of Object.entries(args.attrs.label)) {
                node.attr(`label/${key}`, value as string | number);
            }
        }

        if (args.size) {
            if (args.size.width && args.size.height) {
                node.resize(args.size.width, args.size.height);
            } else if (args.size.width) {
                node.resize(args.size.width, node.getSize().height);
            } else if (args.size.height) {
                node.resize(node.getSize().width, args.size.height);
            }
        }

        return true;
    } catch (error) {
        console.error('Failed to apply stream style data:', error);
        return false;
    }
}
