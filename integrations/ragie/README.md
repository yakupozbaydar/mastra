# @mastra/ragie (Deprecated)

**⚠️ DEPRECATION NOTICE**: This package is deprecated. Please use [`@ragieai/mcp-server`](https://www.npmjs.com/package/@ragieai/mcp-server) instead.

## Migration Guide

This Ragie integration has been deprecated in favor of the official Ragie MCP Server.

### Recommended Migration

1. **Install the Ragie MCP Server**:
   ```bash
   npm install @ragieai/mcp-server
   ```

2. **Update your Mastra configuration**:
   ```typescript
   import { Mastra } from '@mastra/core';
   import { createMCPClient } from '@mastra/mcp';

   const mastra = new Mastra({
     integrations: {
       ragie: createMCPClient({
         server: '@ragieai/mcp-server',
         config: {
           apiKey: process.env.RAGIE_API_KEY,
         },
       }),
     },
   });
   ```

## Legacy Features

The deprecated integration provided:
- Knowledge base management
- Document retrieval
- Semantic search
- RAG operations

Please migrate to the MCP server for continued support and new features.
