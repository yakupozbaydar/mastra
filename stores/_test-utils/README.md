# @mastra/storage-test-utils

Testing utilities and mocks for Mastra storage adapters.

## Overview

This package provides common testing utilities, fixtures, and mock implementations for testing storage adapters and memory systems across the Mastra framework.

## Features

- **Mock Storage Implementations**: In-memory mocks for storage interfaces
- **Test Fixtures**: Common test data for vector stores and key-value stores
- **Testing Helpers**: Utilities for setting up and tearing down test environments
- **Performance Testing**: Benchmarking utilities for storage operations
- **Integration Testing**: Helpers for testing real storage backends

## Utilities

### Mock Implementations
- `MockVectorStore` - In-memory vector store for testing
- `MockKeyValueStore` - In-memory key-value store for testing
- `MockMemoryProvider` - Mock memory system for agent testing

### Test Fixtures
- `vectorFixtures` - Sample vector data and metadata
- `threadFixtures` - Sample conversation threads
- `messageFixtures` - Sample chat messages

### Helpers
- `setupTestDatabase()` - Initialize test database
- `cleanupTestDatabase()` - Clean up test resources
- `generateTestVectors()` - Create test vector data
- `assertVectorSimilarity()` - Vector comparison utilities

## Usage

```typescript
import { MockVectorStore, vectorFixtures, setupTestDatabase } from '@mastra/storage-test-utils';

describe('Vector Store Tests', () => {
  let store: MockVectorStore;

  beforeEach(async () => {
    store = new MockVectorStore();
    await setupTestDatabase();
  });

  it('should store and retrieve vectors', async () => {
    await store.upsert({
      indexName: 'test',
      vectors: vectorFixtures.sampleVectors,
      metadata: vectorFixtures.sampleMetadata,
    });

    const results = await store.query({
      indexName: 'test',
      queryVector: vectorFixtures.queryVector,
      topK: 5,
    });

    expect(results).toHaveLength(5);
  });
});
```

## Development

This package is used internally by other Mastra packages for testing. To run tests:

```bash
# Run all storage tests
pnpm test:combined-stores

# Run specific store tests
pnpm test:memory
```

## Related Packages

- [All stores](../) - Storage adapter implementations
- [@mastra/memory](../../packages/memory) - Memory system using these utilities
- [@mastra/core](../../packages/core) - Core framework with storage interfaces