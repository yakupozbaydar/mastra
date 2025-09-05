# @mastra/github (Deprecated)

**⚠️ DEPRECATION NOTICE**: This package is deprecated. Please use [Github MCP Server](https://github.com/github/github-mcp-server) instead.

## Migration Guide

This GitHub integration has been deprecated in favor of the official GitHub MCP Server, which provides better performance, more features, and official GitHub support.

### Recommended Migration

1. **Install the GitHub MCP Server**:
   ```bash
   npm install @github/github-mcp-server
   ```

2. **Update your Mastra configuration**:
   ```typescript
   import { Mastra } from '@mastra/core';
   import { createMCPClient } from '@mastra/mcp';

   const mastra = new Mastra({
     integrations: {
       github: createMCPClient({
         server: '@github/github-mcp-server',
         config: {
           token: process.env.GITHUB_TOKEN,
         },
       }),
     },
   });
   ```

3. **Update your tools and workflows** to use the new MCP-based GitHub integration.

## Legacy Documentation

For existing projects still using this deprecated integration, basic functionality includes:

- Repository management
- Issue and PR operations  
- File operations
- Basic GitHub API access

**Note**: This package will be removed in a future major version. Please migrate to the official GitHub MCP Server as soon as possible.
