# @mastra/firecrawl (Deprecated)

**⚠️ DEPRECATION NOTICE**: This package is deprecated. Please use [`firecrawl-mcp`](https://www.npmjs.com/package/firecrawl-mcp) instead.

## Migration Guide

This Firecrawl integration has been deprecated in favor of the official Firecrawl MCP Server.

### Recommended Migration

1. **Install the Firecrawl MCP Server**:
   ```bash
   npm install firecrawl-mcp
   ```

2. **Update your Mastra configuration**:
   ```typescript
   import { Mastra } from '@mastra/core';
   import { createMCPClient } from '@mastra/mcp';

   const mastra = new Mastra({
     integrations: {
       firecrawl: createMCPClient({
         server: 'firecrawl-mcp',
         config: {
           apiKey: process.env.FIRECRAWL_API_KEY,
         },
       }),
     },
   });
   ```

## Legacy Features

The deprecated integration provided:
- Web scraping capabilities
- Content extraction
- URL crawling
- Site mapping

Please migrate to the MCP server for continued support.
