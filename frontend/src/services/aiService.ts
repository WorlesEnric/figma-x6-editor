/**
 * AI Service - 处理与后端 AI API 的通信
 */

import { useEditorStore, useAIStore } from '@/store';

const API_BASE_URL = 'http://localhost:3001/api';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * 发送流式聊天请求
 */
export async function sendChatMessage(
    userMessage: string,
    onChunk: (chunk: string) => void,
    onComplete: (fullContent: string) => void,
    onError: (error: string) => void
): Promise<void> {
    const { config, messages } = useAIStore.getState();

    // 构建消息历史（只取最近的几条对话作为上下文）
    const recentMessages = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));

    // 添加用户新消息
    recentMessages.push({ role: 'user' as const, content: userMessage });

    try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: recentMessages,
                provider: config.provider,
                model: config.model,
                apiKey: config.apiKey,
                baseURL: config.baseURL,
                accessCode: config.accessCode,
                temperature: config.temperature,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (!reader) {
            throw new Error('No response body');
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        onComplete(fullContent);
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.error) {
                            onError(parsed.error);
                            return;
                        }
                        if (parsed.content) {
                            fullContent += parsed.content;
                            onChunk(parsed.content);
                        }
                    } catch {
                        // 跳过无法解析的行
                    }
                }
            }
        }

        onComplete(fullContent);
    } catch (error) {
        onError(error instanceof Error ? error.message : 'Unknown error');
    }
}

/**
 * 解析 AI 响应中的 JSON 图表数据
 * 支持两种格式:
 * 1. 新格式: <graph-data>JSON</graph-data> 标签
 * 2. 旧格式: 直接的 JSON 或 markdown 代码块
 */
export function parseGraphJSON(content: string): { nodes: any[]; edges: any[] } | null {
    // 1. 首先尝试从 <graph-data> 标签中提取
    const graphDataMatch = content.match(/<graph-data>([\s\S]*?)<\/graph-data>/);
    if (graphDataMatch) {
        try {
            const parsed = JSON.parse(graphDataMatch[1].trim());
            if (parsed.nodes && Array.isArray(parsed.nodes)) {
                console.log('Parsed graph data from <graph-data> tag');
                return parsed;
            }
        } catch (e) {
            console.warn('Failed to parse <graph-data> content:', e);
        }
    }

    // 2. 移除 markdown 代码块标记
    let cleanContent = content;
    cleanContent = cleanContent.replace(/```json\s*/gi, '');
    cleanContent = cleanContent.replace(/```\s*/g, '');
    cleanContent = cleanContent.trim();

    try {
        // 3. 尝试直接解析
        const parsed = JSON.parse(cleanContent);
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
            return parsed;
        }
    } catch {
        // 4. 尝试从内容中提取 JSON 对象
        const firstBrace = cleanContent.indexOf('{');
        const lastBrace = cleanContent.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonStr = cleanContent.substring(firstBrace, lastBrace + 1);
            try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.nodes && Array.isArray(parsed.nodes)) {
                    return parsed;
                }
            } catch {
                // 解析失败，继续尝试
            }
        }

        // 5. 使用正则表达式提取
        const jsonMatch = cleanContent.match(/\{[\s\S]*"nodes"\s*:\s*\[[\s\S]*\][\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.nodes && Array.isArray(parsed.nodes)) {
                    return parsed;
                }
            } catch {
                // 解析失败
            }
        }
    }

    console.warn('Failed to parse graph JSON from content:', content.substring(0, 200));
    return null;
}

/**
 * 将 AI 生成的图表数据应用到 X6 画布
 */
export function applyGraphData(data: { nodes: any[]; edges: any[] }, clearExisting = false): void {
    const { graph } = useEditorStore.getState();
    if (!graph) {
        console.error('Graph not initialized');
        return;
    }

    // 可选：清空现有内容
    if (clearExisting) {
        graph.clearCells();
    }

    // Ports 配置 - 与 basicShapes.ts 中的 commonPorts 保持一致
    const commonPorts = {
        groups: {
            top: {
                position: 'top',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: { visibility: 'hidden' },
                    },
                },
            },
            right: {
                position: 'right',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: { visibility: 'hidden' },
                    },
                },
            },
            bottom: {
                position: 'bottom',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: { visibility: 'hidden' },
                    },
                },
            },
            left: {
                position: 'left',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: { visibility: 'hidden' },
                    },
                },
            },
        },
        items: [
            { group: 'top' },
            { group: 'right' },
            { group: 'bottom' },
            { group: 'left' },
        ],
    };

    // 形状映射表：将 AI 生成的形状名称映射到已注册的自定义形状
    const shapeMapping: Record<string, string> = {
        // 基础形状 -> 自定义形状
        'rect': 'custom-rect',
        'rectangle': 'custom-rect',
        'ellipse': 'custom-ellipse',
        'circle': 'custom-ellipse',
        'polygon': 'custom-diamond',
        // 自定义形状保持不变
        'custom-rect': 'custom-rect',
        'custom-rounded-rect': 'custom-rounded-rect',
        'custom-ellipse': 'custom-ellipse',
        'custom-diamond': 'custom-diamond',
        'custom-cylinder': 'custom-cylinder',
        'custom-document': 'custom-document',
        'custom-parallelogram': 'custom-parallelogram',
        'custom-hexagon': 'custom-hexagon',
        'custom-cloud': 'custom-cloud',
        'custom-triangle': 'custom-triangle',
        'custom-star': 'custom-star',
        // 流程图形状
        'custom-terminator': 'custom-rounded-rect',
        'custom-process': 'custom-rect',
        'custom-decision': 'custom-diamond',
        'custom-actor': 'custom-rect',
        'custom-database': 'custom-cylinder',
        'process': 'custom-rect',
        'decision': 'custom-diamond',
        'terminator': 'custom-rounded-rect',
        'data': 'custom-parallelogram',
        'database': 'custom-cylinder',
        'start': 'custom-rounded-rect',
        'end': 'custom-rounded-rect',
    };

    // 为节点和边生成唯一 ID
    const nodeIdMap = new Map<string, string>();
    const timestamp = Date.now();

    console.log('Applying graph data:', { nodes: data.nodes?.length, edges: data.edges?.length });

    // 获取现有节点的边界范围
    const existingNodes = graph.getNodes();
    let existingMaxY = 0;
    let existingMinX = Infinity;
    let existingMaxX = -Infinity;

    if (existingNodes.length > 0) {
        existingNodes.forEach(node => {
            const bbox = node.getBBox();
            existingMaxY = Math.max(existingMaxY, bbox.y + bbox.height);
            existingMinX = Math.min(existingMinX, bbox.x);
            existingMaxX = Math.max(existingMaxX, bbox.x + bbox.width);
        });
    }

    // 计算 AI 生成图表的边界（基于节点数据）
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    data.nodes.forEach((nodeData: any, index: number) => {
        const x = nodeData.x ?? 100 + index * 180;
        const y = nodeData.y ?? 100 + index * 120;
        const width = nodeData.width || 120;
        const height = nodeData.height || 60;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x + width);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y + height);
    });

    // 计算新图表的尺寸
    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;

    let offsetX: number;
    let offsetY: number;

    if (existingNodes.length > 0) {
        // 如果已有图形，将新图形放在现有图形的下方
        const existingCenterX = (existingMinX + existingMaxX) / 2;
        offsetX = existingCenterX - (minX + graphWidth / 2);
        offsetY = existingMaxY + 80 - minY; // 80px 间距
    } else {
        // 如果画布为空，居中显示
        const graphArea = graph.getGraphArea();
        const viewportCenter = {
            x: graphArea.x + graphArea.width / 2,
            y: graphArea.y + graphArea.height / 2,
        };
        offsetX = viewportCenter.x - (minX + graphWidth / 2);
        offsetY = viewportCenter.y - (minY + graphHeight / 2);
    }

    // 添加节点
    data.nodes.forEach((nodeData: any, index: number) => {
        const originalId = nodeData.id || `node-${index}`;
        const newId = `ai-${timestamp}-${originalId}`;
        nodeIdMap.set(originalId, newId);

        // 获取映射后的形状，默认使用 custom-rect
        const originalShape = nodeData.shape || 'rect';
        const mappedShape = shapeMapping[originalShape] || 'custom-rect';

        // 处理 attrs 结构 - 确保有正确的样式
        const bodyAttrs = nodeData.attrs?.body || {};
        const labelAttrs = nodeData.attrs?.label || {};

        // 构建节点配置 - 应用偏移量使图表居中
        const node: any = {
            id: newId,
            shape: mappedShape,
            x: (nodeData.x ?? 100 + index * 180) + offsetX,
            y: (nodeData.y ?? 100 + index * 120) + offsetY,
            width: nodeData.width || 120,
            height: nodeData.height || 60,
            // 添加 ports 配置 - 这是让节点可编辑和连接的关键
            ports: commonPorts,
            attrs: {
                body: {
                    fill: bodyAttrs.fill || '#5F95FF',
                    stroke: bodyAttrs.stroke || '#5F95FF',
                    strokeWidth: bodyAttrs.strokeWidth ?? 1,
                    rx: bodyAttrs.rx ?? 6,
                    ry: bodyAttrs.ry ?? 6,
                },
                label: {
                    text: nodeData.label || '',
                    fill: labelAttrs.fill || '#fff',
                    fontSize: labelAttrs.fontSize || 14,
                    fontWeight: labelAttrs.fontWeight || 500,
                },
            },
        };

        // 对于 rounded-rect 形状，使用更大的圆角
        if (mappedShape === 'custom-rounded-rect' ||
            originalShape === 'custom-terminator' || originalShape === 'terminator' ||
            originalShape === 'start' || originalShape === 'end') {
            node.attrs.body.rx = 30;
            node.attrs.body.ry = 30;
        }

        try {
            graph.addNode(node);
            console.log('Added node:', node.id, node.label, 'shape:', mappedShape);
        } catch (error) {
            console.error('Failed to add node:', nodeData, error);
        }
    });

    // 添加边
    data.edges?.forEach((edgeData, index) => {
        const sourceId = nodeIdMap.get(edgeData.source) || edgeData.source;
        const targetId = nodeIdMap.get(edgeData.target) || edgeData.target;

        // 验证源和目标节点存在
        const sourceNode = graph.getCellById(sourceId);
        const targetNode = graph.getCellById(targetId);
        if (!sourceNode || !targetNode) {
            console.warn('Edge source or target not found:', edgeData);
            return;
        }

        // 根据节点的相对位置计算最佳的连接锚点
        // 获取节点的位置信息
        const sourceBBox = (sourceNode as any).getBBox?.();
        const targetBBox = (targetNode as any).getBBox?.();

        let sourceAnchor: string | { name: string } = 'bottom';
        let targetAnchor: string | { name: string } = 'top';

        if (sourceBBox && targetBBox) {
            const sourceCenterX = sourceBBox.x + sourceBBox.width / 2;
            const sourceCenterY = sourceBBox.y + sourceBBox.height / 2;
            const targetCenterX = targetBBox.x + targetBBox.width / 2;
            const targetCenterY = targetBBox.y + targetBBox.height / 2;

            const dx = targetCenterX - sourceCenterX;
            const dy = targetCenterY - sourceCenterY;

            // 根据方向选择合适的锚点
            if (Math.abs(dx) > Math.abs(dy)) {
                // 水平方向为主
                if (dx > 0) {
                    sourceAnchor = 'right';
                    targetAnchor = 'left';
                } else {
                    sourceAnchor = 'left';
                    targetAnchor = 'right';
                }
            } else {
                // 垂直方向为主
                if (dy > 0) {
                    sourceAnchor = 'bottom';
                    targetAnchor = 'top';
                } else {
                    sourceAnchor = 'top';
                    targetAnchor = 'bottom';
                }
            }
        }

        const newEdge: any = {
            id: `ai-edge-${timestamp}-${edgeData.id || index}`,
            source: {
                cell: sourceId,
                anchor: sourceAnchor,
                connectionPoint: 'boundary',
            },
            target: {
                cell: targetId,
                anchor: targetAnchor,
                connectionPoint: 'boundary',
            },
            // 使用直线连接，不使用 manhattan 路由避免弯曲
            router: {
                name: 'normal',
            },
            connector: {
                name: 'normal',
            },
            attrs: {
                line: {
                    stroke: edgeData.attrs?.line?.stroke || '#5F95FF',
                    strokeWidth: edgeData.attrs?.line?.strokeWidth || 2,
                    targetMarker: {
                        name: 'block',
                        width: 12,
                        height: 8,
                    },
                },
            },
        };

        // 如果有标签，添加到边上
        if (edgeData.label) {
            newEdge.labels = [{
                position: 0.5,
                attrs: {
                    text: {
                        text: edgeData.label,
                        fill: '#333',
                        fontSize: 12,
                    },
                    rect: {
                        fill: '#fff',
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        rx: 3,
                        ry: 3,
                    },
                },
            }];
        }

        try {
            graph.addEdge(newEdge);
            console.log('Added edge:', newEdge.id, 'from', sourceId, 'to', targetId);
        } catch (error) {
            console.warn('Failed to add edge:', edgeData, error);
        }
    });

    // 自动调整视图
    setTimeout(() => {
        graph.zoomToFit({ padding: 50, maxScale: 1 });
    }, 100);
}

/**
 * 获取 AI 提供商列表
 */
export async function getProviders(): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/providers`);
        if (!response.ok) {
            throw new Error('Failed to fetch providers');
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch providers:', error);
        return null;
    }
}

/**
 * 获取选中元素的信息，用于发送给 AI
 */
export function getSelectedElementInfo(): any | null {
    const { graph } = useEditorStore.getState();
    if (!graph) return null;

    const selectedCells = graph.getSelectedCells();
    if (selectedCells.length === 0) return null;

    // 只处理第一个选中的元素
    const cell = selectedCells[0];
    if (!cell.isNode()) return null;

    const node = cell;
    const bbox = node.getBBox();
    const attrs = node.getAttrs();

    return {
        id: node.id,
        shape: node.shape,
        x: Math.round(bbox.x),
        y: Math.round(bbox.y),
        width: Math.round(bbox.width),
        height: Math.round(bbox.height),
        label: attrs?.label?.text || '',
        attrs: {
            body: {
                fill: attrs?.body?.fill || '#ffffff',
                stroke: attrs?.body?.stroke || '#000000',
                strokeWidth: attrs?.body?.strokeWidth || 1,
                rx: attrs?.body?.rx,
                ry: attrs?.body?.ry,
            },
            label: {
                fill: attrs?.label?.fill || '#000000',
                fontSize: attrs?.label?.fontSize || 14,
                fontWeight: attrs?.label?.fontWeight,
                fontFamily: attrs?.label?.fontFamily,
            }
        }
    };
}

/**
 * 发送样式修改的流式聊天请求
 */
export async function sendStyleChatMessage(
    userMessage: string,
    elementInfo: any,
    onChunk: (chunk: string) => void,
    onComplete: (fullContent: string) => void,
    onError: (error: string) => void
): Promise<void> {
    const { config, messages } = useAIStore.getState();

    // 构建消息历史
    const recentMessages = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));

    recentMessages.push({ role: 'user' as const, content: userMessage });

    try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: recentMessages,
                provider: config.provider,
                model: config.model,
                apiKey: config.apiKey,
                baseURL: config.baseURL,
                accessCode: config.accessCode,
                temperature: config.temperature,
                mode: 'style',
                elementInfo: elementInfo,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (!reader) {
            throw new Error('No response body');
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        onComplete(fullContent);
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) {
                            fullContent += parsed.content;
                            onChunk(parsed.content);
                        }
                        if (parsed.error) {
                            onError(parsed.error);
                            return;
                        }
                    } catch {
                        // 忽略解析错误
                    }
                }
            }
        }

        onComplete(fullContent);
    } catch (error: any) {
        onError(error.message || 'Network error');
    }
}

/**
 * 解析 AI 响应中的样式修改数据
 */
export function parseStyleJSON(content: string): any | null {
    // 从 <style-data> 标签中提取
    const styleDataMatch = content.match(/<style-data>([\s\S]*?)<\/style-data>/);
    if (styleDataMatch) {
        try {
            const parsed = JSON.parse(styleDataMatch[1].trim());
            if (parsed.action === 'updateStyle') {
                console.log('Parsed style data from <style-data> tag');
                return parsed;
            }
        } catch (e) {
            console.warn('Failed to parse <style-data> content:', e);
        }
    }

    return null;
}

/**
 * 将样式修改应用到选中的元素
 * 支持更换图形类型（会删除原节点并创建新节点）
 */
export function applyStyleData(styleData: any, targetNodeId?: string): boolean {
    const { graph } = useEditorStore.getState();
    if (!graph) {
        console.error('Graph not initialized');
        return false;
    }

    // 获取目标节点
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
        // 检查是否需要更换图形类型
        if (styleData.shape && styleData.shape !== node.shape) {
            console.log('Shape type change requested:', node.shape, '->', styleData.shape);

            // 保存原节点信息
            const oldPosition = node.getPosition();
            const oldSize = node.getSize();
            const oldAttrs = node.getAttrs();
            const oldData = node.getData();
            const oldId = node.id;

            // 获取连接到此节点的所有边
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

            // 计算新尺寸
            const newWidth = styleData.size?.width || oldSize.width;
            const newHeight = styleData.size?.height || oldSize.height;

            // 创建新节点
            const newNode = graph.addNode({
                shape: styleData.shape,
                x: oldPosition.x,
                y: oldPosition.y,
                width: newWidth,
                height: newHeight,
                data: oldData,
            });

            // 应用原有的样式属性
            if (oldAttrs.body) {
                for (const [key, value] of Object.entries(oldAttrs.body)) {
                    // 跳过特定形状的特殊属性
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

            // 应用新的样式属性（覆盖原有属性）
            if (styleData.attrs?.body) {
                const bodyAttrs = styleData.attrs.body as Record<string, string | number>;
                for (const [key, value] of Object.entries(bodyAttrs)) {
                    newNode.attr(`body/${key}`, value as string | number);
                }
            }
            if (styleData.attrs?.label) {
                const labelAttrs = styleData.attrs.label as Record<string, string | number>;
                for (const [key, value] of Object.entries(labelAttrs)) {
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

            console.log('Shape type changed successfully. New node:', newNode.id);
            return true;
        }

        // 普通样式修改（不更换形状类型）
        // 应用 body 属性
        if (styleData.attrs?.body) {
            const bodyAttrs = styleData.attrs.body as Record<string, string | number>;
            for (const [key, value] of Object.entries(bodyAttrs)) {
                node.attr(`body/${key}`, value as string | number);
            }
        }

        // 应用 label 属性
        if (styleData.attrs?.label) {
            const labelAttrs = styleData.attrs.label as Record<string, string | number>;
            for (const [key, value] of Object.entries(labelAttrs)) {
                node.attr(`label/${key}`, value as string | number);
            }
        }

        // 应用尺寸
        if (styleData.size) {
            if (styleData.size.width) node.resize(styleData.size.width, node.getSize().height);
            if (styleData.size.height) node.resize(node.getSize().width, styleData.size.height);
            if (styleData.size.width && styleData.size.height) {
                node.resize(styleData.size.width, styleData.size.height);
            }
        }

        console.log('Style applied successfully to node:', node.id);
        return true;
    } catch (error) {
        console.error('Failed to apply style data:', error);
        return false;
    }
}
