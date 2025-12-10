#!/usr/bin/env node
/**
 * MCP Server for Figma X6 Editor
 * Exposes canvas operations and state for LLM control
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Canvas state storage (in-memory, shared with backend)
// In production, this would be connected to the actual editor state
let canvasState = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedIds: [],
};

// Shape registry - available shapes in the editor
const AVAILABLE_SHAPES = [
  'custom-rect',
  'custom-rounded-rect',
  'custom-ellipse',
  'custom-diamond',
  'custom-triangle',
  'custom-hexagon',
  'custom-star',
  'custom-pentagon',
  'custom-parallelogram',
  'custom-trapezoid',
  'custom-cylinder',
  'custom-document',
  'custom-note',
  'custom-cloud',
  'custom-callout',
  'custom-cube',
  'custom-arrow-right',
  'custom-actor',
];

/**
 * Get current canvas state
 */
function getCanvasState() {
  return {
    nodes: canvasState.nodes,
    edges: canvasState.edges,
    viewport: canvasState.viewport,
    selectedIds: canvasState.selectedIds,
    nodeCount: canvasState.nodes.length,
    edgeCount: canvasState.edges.length,
  };
}

/**
 * Create a new shape/node on the canvas
 */
function createShape(params) {
  const {
    shape = 'custom-rect',
    x = 100,
    y = 100,
    width = 120,
    height = 60,
    label = '',
    fill = '#5F95FF',
    stroke = '#3A71CA',
    strokeWidth = 2,
    rx = 6,
    ry = 6,
    labelFill = '#ffffff',
    fontSize = 14,
    fontWeight = 500,
  } = params;

  if (!AVAILABLE_SHAPES.includes(shape)) {
    throw new Error(`Invalid shape type: ${shape}. Available shapes: ${AVAILABLE_SHAPES.join(', ')}`);
  }

  const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const node = {
    id: nodeId,
    shape,
    x: Number(x),
    y: Number(y),
    width: Number(width),
    height: Number(height),
    label: String(label),
    attrs: {
      body: {
        fill: String(fill),
        stroke: String(stroke),
        strokeWidth: Number(strokeWidth),
        rx: Number(rx),
        ry: Number(ry),
      },
      label: {
        text: String(label),
        fill: String(labelFill),
        fontSize: Number(fontSize),
        fontWeight: Number(fontWeight),
      },
    },
  };

  canvasState.nodes.push(node);

  return {
    success: true,
    nodeId,
    node,
    message: `Created ${shape} node "${label}" at (${x}, ${y})`,
  };
}

/**
 * Update an existing shape/node
 */
function updateShape(params) {
  const { nodeId, ...updates } = params;

  if (!nodeId) {
    throw new Error('nodeId is required');
  }

  const nodeIndex = canvasState.nodes.findIndex((n) => n.id === nodeId);
  if (nodeIndex === -1) {
    throw new Error(`Node with id ${nodeId} not found`);
  }

  const node = canvasState.nodes[nodeIndex];

  // Update position
  if (updates.x !== undefined) node.x = Number(updates.x);
  if (updates.y !== undefined) node.y = Number(updates.y);

  // Update size
  if (updates.width !== undefined) node.width = Number(updates.width);
  if (updates.height !== undefined) node.height = Number(updates.height);

  // Update shape type
  if (updates.shape !== undefined) {
    if (!AVAILABLE_SHAPES.includes(updates.shape)) {
      throw new Error(`Invalid shape type: ${updates.shape}`);
    }
    node.shape = updates.shape;
  }

  // Update label
  if (updates.label !== undefined) {
    node.label = String(updates.label);
    if (node.attrs.label) {
      node.attrs.label.text = String(updates.label);
    }
  }

  // Update body attributes
  if (updates.fill !== undefined) {
    node.attrs.body.fill = String(updates.fill);
  }
  if (updates.stroke !== undefined) {
    node.attrs.body.stroke = String(updates.stroke);
  }
  if (updates.strokeWidth !== undefined) {
    node.attrs.body.strokeWidth = Number(updates.strokeWidth);
  }
  if (updates.rx !== undefined) {
    node.attrs.body.rx = Number(updates.rx);
  }
  if (updates.ry !== undefined) {
    node.attrs.body.ry = Number(updates.ry);
  }

  // Update label attributes
  if (updates.labelFill !== undefined) {
    node.attrs.label.fill = String(updates.labelFill);
  }
  if (updates.fontSize !== undefined) {
    node.attrs.label.fontSize = Number(updates.fontSize);
  }
  if (updates.fontWeight !== undefined) {
    node.attrs.label.fontWeight = Number(updates.fontWeight);
  }

  canvasState.nodes[nodeIndex] = node;

  return {
    success: true,
    nodeId,
    node,
    message: `Updated node ${nodeId}`,
  };
}

/**
 * Delete a shape/node
 */
function deleteShape(params) {
  const { nodeId } = params;

  if (!nodeId) {
    throw new Error('nodeId is required');
  }

  const nodeIndex = canvasState.nodes.findIndex((n) => n.id === nodeId);
  if (nodeIndex === -1) {
    throw new Error(`Node with id ${nodeId} not found`);
  }

  // Also remove any edges connected to this node
  canvasState.edges = canvasState.edges.filter(
    (e) => e.source !== nodeId && e.target !== nodeId
  );

  const deletedNode = canvasState.nodes[nodeIndex];
  canvasState.nodes.splice(nodeIndex, 1);

  return {
    success: true,
    nodeId,
    message: `Deleted node ${nodeId}`,
    deletedNode,
  };
}

/**
 * Create an edge/connection between nodes
 */
function createEdge(params) {
  const {
    source,
    target,
    label = '',
    stroke = '#5F95FF',
    strokeWidth = 2,
    strokeDasharray = '',
  } = params;

  if (!source || !target) {
    throw new Error('source and target are required');
  }

  // Verify nodes exist
  const sourceNode = canvasState.nodes.find((n) => n.id === source);
  const targetNode = canvasState.nodes.find((n) => n.id === target);

  if (!sourceNode) {
    throw new Error(`Source node ${source} not found`);
  }
  if (!targetNode) {
    throw new Error(`Target node ${target} not found`);
  }

  const edgeId = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const edge = {
    id: edgeId,
    source: String(source),
    target: String(target),
    label: String(label),
    attrs: {
      line: {
        stroke: String(stroke),
        strokeWidth: Number(strokeWidth),
        strokeDasharray: String(strokeDasharray),
      },
    },
  };

  canvasState.edges.push(edge);

  return {
    success: true,
    edgeId,
    edge,
    message: `Created edge from ${source} to ${target}`,
  };
}

/**
 * Delete an edge
 */
function deleteEdge(params) {
  const { edgeId } = params;

  if (!edgeId) {
    throw new Error('edgeId is required');
  }

  const edgeIndex = canvasState.edges.findIndex((e) => e.id === edgeId);
  if (edgeIndex === -1) {
    throw new Error(`Edge with id ${edgeId} not found`);
  }

  const deletedEdge = canvasState.edges[edgeIndex];
  canvasState.edges.splice(edgeIndex, 1);

  return {
    success: true,
    edgeId,
    message: `Deleted edge ${edgeId}`,
    deletedEdge,
  };
}

/**
 * Clear the entire canvas
 */
function clearCanvas() {
  const nodeCount = canvasState.nodes.length;
  const edgeCount = canvasState.edges.length;

  canvasState.nodes = [];
  canvasState.edges = [];
  canvasState.selectedIds = [];

  return {
    success: true,
    message: `Cleared canvas (removed ${nodeCount} nodes and ${edgeCount} edges)`,
  };
}

/**
 * Select nodes
 */
function selectNodes(params) {
  const { nodeIds } = params;

  if (!Array.isArray(nodeIds)) {
    throw new Error('nodeIds must be an array');
  }

  // Verify all nodes exist
  const invalidIds = nodeIds.filter((id) => !canvasState.nodes.find((n) => n.id === id));
  if (invalidIds.length > 0) {
    throw new Error(`Invalid node IDs: ${invalidIds.join(', ')}`);
  }

  canvasState.selectedIds = [...nodeIds];

  return {
    success: true,
    selectedIds: canvasState.selectedIds,
    message: `Selected ${nodeIds.length} node(s)`,
  };
}

/**
 * Get information about a specific node
 */
function getNodeInfo(params) {
  const { nodeId } = params;

  if (!nodeId) {
    throw new Error('nodeId is required');
  }

  const node = canvasState.nodes.find((n) => n.id === nodeId);
  if (!node) {
    throw new Error(`Node with id ${nodeId} not found`);
  }

  return {
    success: true,
    node,
  };
}

/**
 * List all available shapes
 */
function listShapes() {
  return {
    success: true,
    shapes: AVAILABLE_SHAPES,
    count: AVAILABLE_SHAPES.length,
  };
}

// Create MCP server
const server = new Server(
  {
    name: 'figma-x6-editor',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_canvas_state',
        description: 'Get the current state of the canvas including all nodes, edges, viewport, and selected elements',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_shape',
        description: 'Create a new shape/node on the canvas',
        inputSchema: {
          type: 'object',
          properties: {
            shape: {
              type: 'string',
              description: 'Shape type (e.g., custom-rect, custom-ellipse, custom-diamond)',
              enum: AVAILABLE_SHAPES,
            },
            x: { type: 'number', description: 'X coordinate' },
            y: { type: 'number', description: 'Y coordinate' },
            width: { type: 'number', description: 'Width' },
            height: { type: 'number', description: 'Height' },
            label: { type: 'string', description: 'Label text' },
            fill: { type: 'string', description: 'Fill color (hex)' },
            stroke: { type: 'string', description: 'Stroke color (hex)' },
            strokeWidth: { type: 'number', description: 'Stroke width' },
            rx: { type: 'number', description: 'Border radius X' },
            ry: { type: 'number', description: 'Border radius Y' },
            labelFill: { type: 'string', description: 'Label text color (hex)' },
            fontSize: { type: 'number', description: 'Font size' },
            fontWeight: { type: 'number', description: 'Font weight' },
          },
          required: [],
        },
      },
      {
        name: 'update_shape',
        description: 'Update properties of an existing shape/node',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: { type: 'string', description: 'ID of the node to update' },
            shape: { type: 'string', enum: AVAILABLE_SHAPES },
            x: { type: 'number' },
            y: { type: 'number' },
            width: { type: 'number' },
            height: { type: 'number' },
            label: { type: 'string' },
            fill: { type: 'string' },
            stroke: { type: 'string' },
            strokeWidth: { type: 'number' },
            rx: { type: 'number' },
            ry: { type: 'number' },
            labelFill: { type: 'string' },
            fontSize: { type: 'number' },
            fontWeight: { type: 'number' },
          },
          required: ['nodeId'],
        },
      },
      {
        name: 'delete_shape',
        description: 'Delete a shape/node from the canvas',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: { type: 'string', description: 'ID of the node to delete' },
          },
          required: ['nodeId'],
        },
      },
      {
        name: 'create_edge',
        description: 'Create a connection/edge between two nodes',
        inputSchema: {
          type: 'object',
          properties: {
            source: { type: 'string', description: 'Source node ID' },
            target: { type: 'string', description: 'Target node ID' },
            label: { type: 'string', description: 'Edge label' },
            stroke: { type: 'string', description: 'Stroke color' },
            strokeWidth: { type: 'number', description: 'Stroke width' },
            strokeDasharray: { type: 'string', description: 'Dash pattern (e.g., "5,5" for dashed)' },
          },
          required: ['source', 'target'],
        },
      },
      {
        name: 'delete_edge',
        description: 'Delete an edge/connection',
        inputSchema: {
          type: 'object',
          properties: {
            edgeId: { type: 'string', description: 'ID of the edge to delete' },
          },
          required: ['edgeId'],
        },
      },
      {
        name: 'clear_canvas',
        description: 'Clear all nodes and edges from the canvas',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'select_nodes',
        description: 'Select one or more nodes',
        inputSchema: {
          type: 'object',
          properties: {
            nodeIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of node IDs to select',
            },
          },
          required: ['nodeIds'],
        },
      },
      {
        name: 'get_node_info',
        description: 'Get detailed information about a specific node',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: { type: 'string', description: 'ID of the node' },
          },
          required: ['nodeId'],
        },
      },
      {
        name: 'list_shapes',
        description: 'List all available shape types',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'get_canvas_state':
        result = getCanvasState();
        break;
      case 'create_shape':
        result = createShape(args || {});
        break;
      case 'update_shape':
        result = updateShape(args || {});
        break;
      case 'delete_shape':
        result = deleteShape(args || {});
        break;
      case 'create_edge':
        result = createEdge(args || {});
        break;
      case 'delete_edge':
        result = deleteEdge(args || {});
        break;
      case 'clear_canvas':
        result = clearCanvas();
        break;
      case 'select_nodes':
        result = selectNodes(args || {});
        break;
      case 'get_node_info':
        result = getNodeInfo(args || {});
        break;
      case 'list_shapes':
        result = listShapes();
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            success: false,
          }),
        },
      ],
      isError: true,
    };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'canvas://state',
        name: 'Canvas State',
        description: 'Current state of the canvas including all nodes and edges',
        mimeType: 'application/json',
      },
      {
        uri: 'canvas://nodes',
        name: 'All Nodes',
        description: 'List of all nodes on the canvas',
        mimeType: 'application/json',
      },
      {
        uri: 'canvas://edges',
        name: 'All Edges',
        description: 'List of all edges/connections on the canvas',
        mimeType: 'application/json',
      },
      {
        uri: 'canvas://shapes',
        name: 'Available Shapes',
        description: 'List of all available shape types',
        mimeType: 'application/json',
      },
    ],
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    let content;

    switch (uri) {
      case 'canvas://state':
        content = JSON.stringify(getCanvasState(), null, 2);
        break;
      case 'canvas://nodes':
        content = JSON.stringify(canvasState.nodes, null, 2);
        break;
      case 'canvas://edges':
        content = JSON.stringify(canvasState.edges, null, 2);
        break;
      case 'canvas://shapes':
        content = JSON.stringify({ shapes: AVAILABLE_SHAPES }, null, 2);
        break;
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: content,
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

// Export canvas state getter/setter and all functions for backend integration
module.exports = {
  getCanvasState,
  createShape,
  updateShape,
  deleteShape,
  createEdge,
  deleteEdge,
  clearCanvas,
  selectNodes,
  getNodeInfo,
  listShapes,
  setCanvasState: (state) => {
    canvasState = { ...canvasState, ...state };
  },
  updateCanvasState: (updates) => {
    canvasState = { ...canvasState, ...updates };
  },
};

// Start server if run directly
if (require.main === module) {
  const transport = new StdioServerTransport();
  server.connect(transport);
  console.error('Figma X6 Editor MCP Server running on stdio');
}

