# MCP Server for Figma X6 Editor

This MCP (Model Context Protocol) server exposes the canvas operations and state of the Figma X6 Editor for LLM control.

## Overview

The MCP server provides:
- **Tools**: Operations that LLMs can call to manipulate the canvas
- **Resources**: Read-only access to canvas state and information

## Installation

```bash
cd backend
npm install
```

## Usage

### As a Standalone MCP Server (stdio)

Run the MCP server directly for use with MCP-compatible clients:

```bash
npm run mcp
# or
node mcp-server.js
```

The server communicates via stdio using the MCP protocol.

### Via HTTP API

The MCP operations are also exposed via HTTP endpoints for easier integration:

```bash
npm start
# Server runs on http://localhost:3001
```

## Available Tools

### `get_canvas_state`
Get the current state of the canvas including all nodes, edges, viewport, and selected elements.

### `create_shape`
Create a new shape/node on the canvas.

**Parameters:**
- `shape` (string): Shape type (e.g., `custom-rect`, `custom-ellipse`, `custom-diamond`)
- `x`, `y` (number): Position coordinates
- `width`, `height` (number): Size
- `label` (string): Label text
- `fill`, `stroke` (string): Colors (hex format)
- `strokeWidth` (number): Stroke width
- `rx`, `ry` (number): Border radius
- `labelFill` (string): Label text color
- `fontSize`, `fontWeight` (number): Text styling

### `update_shape`
Update properties of an existing shape/node.

**Required:**
- `nodeId` (string): ID of the node to update

**Optional:** All shape properties can be updated.

### `delete_shape`
Delete a shape/node from the canvas.

**Required:**
- `nodeId` (string): ID of the node to delete

### `create_edge`
Create a connection/edge between two nodes.

**Required:**
- `source` (string): Source node ID
- `target` (string): Target node ID

**Optional:**
- `label` (string): Edge label
- `stroke` (string): Stroke color
- `strokeWidth` (number): Stroke width
- `strokeDasharray` (string): Dash pattern (e.g., "5,5")

### `delete_edge`
Delete an edge/connection.

**Required:**
- `edgeId` (string): ID of the edge to delete

### `clear_canvas`
Clear all nodes and edges from the canvas.

### `select_nodes`
Select one or more nodes.

**Required:**
- `nodeIds` (array): Array of node IDs to select

### `get_node_info`
Get detailed information about a specific node.

**Required:**
- `nodeId` (string): ID of the node

### `list_shapes`
List all available shape types.

## Available Resources

### `canvas://state`
Current state of the canvas including all nodes and edges.

### `canvas://nodes`
List of all nodes on the canvas.

### `canvas://edges`
List of all edges/connections on the canvas.

### `canvas://shapes`
List of all available shape types.

## HTTP API Endpoints

All MCP tools are also available via HTTP REST API:

- `GET /api/mcp/canvas/state` - Get canvas state
- `POST /api/mcp/canvas/shapes` - Create shape
- `PUT /api/mcp/canvas/shapes/:nodeId` - Update shape
- `DELETE /api/mcp/canvas/shapes/:nodeId` - Delete shape
- `POST /api/mcp/canvas/edges` - Create edge
- `DELETE /api/mcp/canvas/edges/:edgeId` - Delete edge
- `POST /api/mcp/canvas/clear` - Clear canvas
- `POST /api/mcp/canvas/select` - Select nodes
- `GET /api/mcp/canvas/nodes/:nodeId` - Get node info
- `GET /api/mcp/canvas/shapes` - List available shapes
- `PUT /api/mcp/canvas/sync` - Sync canvas state from frontend

## Available Shapes

- `custom-rect` - Rectangle
- `custom-rounded-rect` - Rounded rectangle
- `custom-ellipse` - Ellipse/Circle
- `custom-diamond` - Diamond
- `custom-triangle` - Triangle
- `custom-hexagon` - Hexagon
- `custom-star` - Star
- `custom-pentagon` - Pentagon
- `custom-parallelogram` - Parallelogram
- `custom-trapezoid` - Trapezoid
- `custom-cylinder` - Cylinder
- `custom-document` - Document
- `custom-note` - Note
- `custom-cloud` - Cloud
- `custom-callout` - Callout
- `custom-cube` - Cube
- `custom-arrow-right` - Arrow
- `custom-actor` - Actor/Person

## Integration with LLMs

### Using with Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "figma-x6-editor": {
      "command": "node",
      "args": ["/path/to/figma-x6-editor/backend/mcp-server.js"]
    }
  }
}
```

### Using with Other MCP Clients

The server follows the MCP protocol specification and can be used with any MCP-compatible client. Connect via stdio and use the standard MCP request/response format.

## Example Usage

### Create a flowchart via MCP:

```javascript
// Using HTTP API
const response = await fetch('http://localhost:3001/api/mcp/canvas/shapes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shape: 'custom-rounded-rect',
    x: 100,
    y: 100,
    width: 120,
    height: 60,
    label: 'Start',
    fill: '#52C41A',
    stroke: '#389E0D',
  }),
});
```

### Get canvas state:

```javascript
const state = await fetch('http://localhost:3001/api/mcp/canvas/state').then(r => r.json());
console.log(`Canvas has ${state.nodeCount} nodes and ${state.edgeCount} edges`);
```

## Notes

- The canvas state is currently stored in-memory. In production, this should be connected to the actual editor state.
- The MCP server can run independently or be integrated with the Express backend server.
- All operations are synchronous and return immediately with the result.

