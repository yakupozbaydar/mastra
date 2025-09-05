# Creating New Integrations

This directory contains templates and examples for creating new integrations with third-party services.

## Integration Template

Use this template as a starting point for new integrations:

### 1. Create Package Structure

```
integrations/my-service/
├── package.json
├── README.md
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── tools/
│   └── types/
└── tests/
```

### 2. Package.json Template

```json
{
  "name": "@mastra/my-service",
  "version": "0.1.0",
  "description": "Mastra integration for My Service API",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup --silent",
    "test": "vitest run",
    "lint": "eslint ."
  },
  "dependencies": {
    "@mastra/core": "workspace:*"
  },
  "peerDependencies": {
    "@mastra/core": ">=0.15.0"
  }
}
```

### 3. Basic Integration Structure

```typescript
// src/index.ts
import { Integration } from '@mastra/core/integration';
import { MyServiceClient } from './client';
import { myServiceTools } from './tools';

export interface MyServiceConfig {
  apiKey: string;
  baseUrl?: string;
}

export class MyServiceIntegration extends Integration<MyServiceConfig> {
  readonly name = 'MY_SERVICE';
  readonly logoUrl = 'https://example.com/logo.png';

  constructor(config: MyServiceConfig) {
    super(config);
  }

  async getClient(): Promise<MyServiceClient> {
    return new MyServiceClient(this.config);
  }

  getTools() {
    return myServiceTools;
  }
}

export { MyServiceClient };
export * from './tools';
export * from './types';
```

### 4. Client Implementation

```typescript
// src/client.ts
import type { MyServiceConfig } from './index';

export class MyServiceClient {
  private config: MyServiceConfig;

  constructor(config: MyServiceConfig) {
    this.config = config;
  }

  private get baseUrl() {
    return this.config.baseUrl || 'https://api.myservice.com';
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { ...this.headers, ...options?.headers },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Implement specific API methods
  async getItems() {
    return this.request('/items');
  }

  async createItem(data: any) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
```

### 5. Tools Implementation

```typescript
// src/tools/index.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import type { MyServiceIntegration } from '../index';

export const getItemsTool = createTool({
  id: 'my_service_get_items',
  description: 'Get items from My Service',
  inputSchema: z.object({
    limit: z.number().optional().describe('Number of items to retrieve'),
  }),
  execute: async ({ context, integration }) => {
    const client = await (integration as MyServiceIntegration).getClient();
    return await client.getItems();
  },
});

export const createItemTool = createTool({
  id: 'my_service_create_item',
  description: 'Create a new item in My Service',
  inputSchema: z.object({
    name: z.string().describe('Name of the item'),
    description: z.string().optional().describe('Item description'),
  }),
  execute: async ({ context, integration }) => {
    const client = await (integration as MyServiceIntegration).getClient();
    return await client.createItem({
      name: context.name,
      description: context.description,
    });
  },
});

export const myServiceTools = {
  getItemsTool,
  createItemTool,
};
```

### 6. README Template

```markdown
# @mastra/my-service

Mastra integration for My Service API.

## Installation

\`\`\`bash
npm install @mastra/my-service
\`\`\`

## Usage

\`\`\`typescript
import { MyServiceIntegration } from '@mastra/my-service';

const integration = new MyServiceIntegration({
  apiKey: process.env.MY_SERVICE_API_KEY,
});

// Use with Mastra
const mastra = new Mastra({
  integrations: { myService: integration },
});
\`\`\`

## Configuration

- \`apiKey\`: Your My Service API key
- \`baseUrl\`: Optional custom API base URL

## Available Tools

- \`getItemsTool\`: Retrieve items
- \`createItemTool\`: Create new items
```

## Best Practices

1. **Error Handling**: Implement proper error handling for API failures
2. **Rate Limiting**: Respect API rate limits in your client
3. **Authentication**: Support multiple auth methods (API key, OAuth, etc.)
4. **Type Safety**: Define proper TypeScript types for all API responses
5. **Documentation**: Include comprehensive README with examples
6. **Testing**: Write integration tests with mock API responses

## Examples

See existing integrations for reference:
- [@mastra/github](./github) - REST API with OAuth
- [@mastra/firecrawl](./firecrawl) - Simple API key authentication

## Publishing

Before publishing a new integration:

1. Test with real API credentials
2. Add comprehensive documentation
3. Follow semantic versioning
4. Add to the main Mastra documentation