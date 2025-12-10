# Migration Summary: AI Chat to MCP Server

## Overview

The AI chat functionality has been completely removed from the Figma X6 Editor and replaced with an MCP (Model Context Protocol) server that exposes canvas operations and state for LLM control.

## Changes Made

### Removed Components

1. **Frontend AI Components:**
   - `frontend/src/components/AIChatPanel/` - Entire AI chat panel component
   - `frontend/src/services/aiService.ts` - AI service for chat
   - `frontend/src/services/aiStreamService.ts` - Stream service for AI
   - `frontend/src/store/aiStore.ts` - AI state management

2. **Backend AI Routes:**
   - `backend/routes/ai.js` - Standard AI chat routes
   - `backend/routes/ai-stream.js` - Stream-based AI routes with tool calling

3. **UI Elements:**
   - Removed AI Assistant button from Toolbar
   - Removed AI chat panel from App component
   - Removed "Add to Chat" option from context menu
   - Removed Ctrl/Cmd+L keyboard shortcut for AI panel

4. **Dependencies Removed:**
   - `@ai-sdk/openai`
   - `@ai-sdk/openai-compatible`
   - `@ai-sdk/react`
   - `ai` (Vercel AI SDK)
   - `openai`
   - `zod` (from backend)

### Added Components

1. **MCP Server:**
   - `backend/mcp-server.js` - Full MCP server implementation
   - `backend/routes/mcp.js` - HTTP API routes for MCP operations
   - `backend/MCP_README.md` - Comprehensive MCP documentation

2. **Dependencies Added:**
   - `@modelcontextprotocol/sdk` - MCP SDK for Node.js

## MCP Server Features

### Available Tools

The MCP server exposes the following tools for LLM control:

1. **get_canvas_state** - Get current canvas state
2. **create_shape** - Create new shapes/nodes
3. **update_shape** - Update existing shapes
4. **delete_shape** - Delete shapes
5. **create_edge** - Create connections between nodes
6. **delete_edge** - Delete connections
7. **clear_canvas** - Clear entire canvas
8. **select_nodes** - Select nodes
9. **get_node_info** - Get node details
10. **list_shapes** - List available shape types

### Available Resources

1. **canvas://state** - Full canvas state
2. **canvas://nodes** - All nodes
3. **canvas://edges** - All edges
4. **canvas://shapes** - Available shapes

### HTTP API Endpoints

All MCP operations are also available via REST API:

- `GET /api/mcp/canvas/state`
- `POST /api/mcp/canvas/shapes`
- `PUT /api/mcp/canvas/shapes/:nodeId`
- `DELETE /api/mcp/canvas/shapes/:nodeId`
- `POST /api/mcp/canvas/edges`
- `DELETE /api/mcp/canvas/edges/:edgeId`
- `POST /api/mcp/canvas/clear`
- `POST /api/mcp/canvas/select`
- `GET /api/mcp/canvas/nodes/:nodeId`
- `GET /api/mcp/canvas/shapes`
- `PUT /api/mcp/canvas/sync`

## Usage

### Running the MCP Server

**As standalone MCP server (stdio):**
```bash
cd backend
npm run mcp
```

**Via HTTP API:**
```bash
cd backend
npm start
# Server runs on http://localhost:3001
```

### Integration with LLMs

The MCP server can be integrated with any MCP-compatible LLM client:

1. **Claude Desktop** - Add to MCP configuration
2. **Other MCP Clients** - Connect via stdio using MCP protocol
3. **HTTP API** - Use REST endpoints directly

See `backend/MCP_README.md` for detailed integration instructions.

## Benefits

1. **Standard Protocol** - Uses MCP, a standard protocol for LLM integration
2. **Language Agnostic** - Any LLM that supports MCP can use it
3. **Complete Control** - Full access to canvas operations and state
4. **Dual Interface** - Available via both MCP protocol and HTTP API
5. **No Vendor Lock-in** - Not tied to specific AI providers

## Next Steps

To connect the MCP server to the actual editor state:

1. Implement bidirectional sync between MCP server state and editor state
2. Add WebSocket support for real-time updates
3. Connect MCP operations to actual X6 graph instance
4. Add authentication/authorization if needed

## Files Modified

- `frontend/src/components/App/App.tsx`
- `frontend/src/components/Toolbar/Toolbar.tsx`
- `frontend/src/components/Canvas/Canvas.tsx`
- `frontend/src/components/Canvas/CanvasContextMenu.tsx`
- `frontend/src/hooks/useKeyboard.ts`
- `frontend/src/store/index.ts`
- `frontend/src/services/index.ts`
- `frontend/package.json`
- `backend/server.js`
- `backend/package.json`

## Files Created

- `backend/mcp-server.js`
- `backend/routes/mcp.js`
- `backend/MCP_README.md`
- `MIGRATION_SUMMARY.md` (this file)

## Files Deleted

- `frontend/src/components/AIChatPanel/` (entire directory)
- `frontend/src/services/aiService.ts`
- `frontend/src/services/aiStreamService.ts`
- `frontend/src/store/aiStore.ts`
- `backend/routes/ai.js`
- `backend/routes/ai-stream.js`
- `docs/AI_FEATURE.md`

