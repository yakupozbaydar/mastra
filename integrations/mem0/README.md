# @mastra/mem0 (Deprecated)

**⚠️ DEPRECATION NOTICE**: This package is deprecated.

## Migration Guide

This Mem0 integration has been deprecated. For memory and RAG capabilities, please use Mastra's built-in memory system.

### Recommended Migration

Use Mastra's native memory and RAG capabilities:

```typescript
import { Mastra } from '@mastra/core';
import { createAgent } from '@mastra/core/agent';
import { PostgresStore } from '@mastra/pg';
import { createRAG } from '@mastra/rag';

const mastra = new Mastra({
  memory: {
    provider: new PostgresStore({
      connectionString: process.env.DATABASE_URL,
    }),
  },
});

const agent = createAgent({
  name: 'memory-agent',
  memory: {
    provider: mastra.memory,
    type: 'conversational',
  },
});

// For RAG capabilities
const rag = createRAG({
  embedding: openaiEmbedding(),
  vectorStore: new PgVector({
    connectionString: process.env.DATABASE_URL,
  }),
});
```

## Legacy Features

The deprecated integration provided:
- Memory management
- Context persistence
- Knowledge graphs

Please migrate to Mastra's native memory and RAG systems for better integration and performance. 
