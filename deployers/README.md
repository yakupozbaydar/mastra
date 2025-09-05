# Mastra Deployment Adapters

Platform-specific deployment adapters for deploying Mastra applications to various cloud environments.

## Overview

This directory contains deployment adapters that enable seamless deployment of Mastra agents, workflows, and APIs to different hosting platforms and serverless environments.

## Available Deployers

### Serverless Platforms
- **[@mastra/deployer-vercel](./vercel)** - Deploy to Vercel Edge Functions and Serverless Functions
- **[@mastra/deployer-netlify](./netlify)** - Deploy to Netlify Functions and Edge Functions
- **[@mastra/deployer-cloudflare](./cloudflare)** - Deploy to Cloudflare Workers and Pages

### Server Frameworks
- **[@mastra/deployer-cloud](./cloud)** - Generic cloud deployment utilities

## Quick Start

### Vercel Deployment

```typescript
import { Mastra } from '@mastra/core';
import { VercelDeployer } from '@mastra/deployer-vercel';

const mastra = new Mastra({
  deployer: new VercelDeployer({
    runtime: 'edge', // or 'nodejs'
    regions: ['iad1', 'sfo1'],
  }),
});

export default mastra.createHandler();
```

### Cloudflare Workers

```typescript
import { Mastra } from '@mastra/core';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';

const mastra = new Mastra({
  deployer: new CloudflareDeployer({
    compatibility_date: '2024-01-01',
    compatibility_flags: ['nodejs_compat'],
  }),
});

export default {
  fetch: mastra.createFetchHandler(),
};
```

### Netlify Functions

```typescript
import { Mastra } from '@mastra/core';
import { NetlifyDeployer } from '@mastra/deployer-netlify';

const mastra = new Mastra({
  deployer: new NetlifyDeployer({
    runtime: 'edge', // or 'deno'
  }),
});

export const handler = mastra.createNetlifyHandler();
```

## Features

### Common Features
- **Auto-configuration**: Automatic environment detection and setup
- **API Generation**: Generate REST endpoints for agents and workflows
- **Environment Variables**: Secure handling of secrets and configuration
- **Streaming Support**: Real-time response streaming where supported
- **Error Handling**: Platform-specific error handling and logging
- **Performance Optimization**: Platform-optimized bundling and execution

### Platform-Specific Features

#### Vercel
- Edge Runtime support for global low latency
- Node.js runtime for complex operations
- Automatic region selection
- Built-in analytics and monitoring
- Incremental Static Regeneration (ISR) support

#### Cloudflare Workers
- Global edge computing
- V8 isolate-based execution
- KV storage integration
- R2 object storage support
- Durable Objects for stateful operations
- WebSocket support

#### Netlify
- Edge Functions for global deployment
- Deno runtime support
- Built-in form handling
- Identity and authentication integration
- Split testing capabilities

## Deployment Commands

```bash
# Using Mastra CLI
mastra build --deployer vercel
mastra build --deployer cloudflare
mastra build --deployer netlify

# Platform-specific commands
vercel deploy
wrangler deploy
netlify deploy
```

## Configuration

### Environment Variables

```bash
# Common variables
MASTRA_ENV=production
API_KEY=your_api_key

# Platform-specific
VERCEL_TOKEN=your_vercel_token
CLOUDFLARE_API_TOKEN=your_cf_token
NETLIFY_AUTH_TOKEN=your_netlify_token
```

### Deployment Configuration

Create a `mastra.config.ts` file:

```typescript
import { defineConfig } from '@mastra/core';

export default defineConfig({
  deployer: {
    type: 'vercel',
    config: {
      runtime: 'edge',
      regions: ['iad1', 'sfo1'],
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      },
    },
  },
});
```

## Best Practices

### Performance
- Use edge runtimes for simple operations
- Use Node.js runtime for complex AI operations
- Implement proper caching strategies
- Optimize bundle size for cold start performance

### Security
- Store API keys in platform secrets management
- Use environment-specific configurations
- Implement proper CORS policies
- Enable rate limiting where appropriate

### Monitoring
- Set up platform-specific monitoring
- Implement health checks
- Use structured logging
- Monitor cold start times and memory usage

## Troubleshooting

### Common Issues

**Bundle Size Too Large**
```bash
# Check bundle size
mastra build --analyze

# Use dynamic imports for large dependencies
const { HeavyLibrary } = await import('heavy-library');
```

**Cold Start Performance**
```typescript
// Minimize initialization work
const agent = new Agent({
  model: openai('gpt-4o-mini'), // Use smaller models for faster startup
  cache: true, // Enable caching
});
```

**Memory Limits**
```typescript
// Configure memory limits per platform
export const config = {
  runtime: 'nodejs18.x',
  memory: 1024, // MB
  timeout: 30, // seconds
};
```

## Development

```bash
# Build all deployers
pnpm build:deployers

# Test deployments
pnpm test:deployers

# Local development
mastra dev # Test locally before deployment
```

## Examples

- [Vercel AI Chatbot](../examples/vercel-chatbot/)
- [Cloudflare Worker Agent](../examples/cloudflare-agent/)
- [Netlify Function Bot](../examples/netlify-bot/)

## Related Documentation

- [Deployment Guide](https://mastra.ai/docs/deployment/overview)
- [Platform Comparisons](https://mastra.ai/docs/deployment/platforms)
- [Production Best Practices](https://mastra.ai/docs/deployment/production)