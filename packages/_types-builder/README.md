# @mastra/types-builder

Internal build tooling for generating TypeScript types across the Mastra framework.

## Overview

This package provides type generation utilities used during the build process to ensure type consistency and safety across the Mastra monorepo. It handles the generation of shared interfaces, integration types, and schema validation types.

## Usage

This is an internal package used by the Mastra build system. It should not be used directly in user applications.

### Key Features

- Automatic type generation from schemas
- Integration type definitions
- Cross-package type consistency validation
- Build-time type checking utilities

## Development

This package is part of the Mastra monorepo build pipeline. Changes to type definitions should be coordinated with the core framework team.

### Building

```bash
pnpm build:packages
```

## Related Packages

- [@mastra/core](../core) - Uses generated types for core functionality
- [@mastra/cli](../cli) - Leverages types for code generation
- [@mastra/schema-compat](../schema-compat) - Schema compatibility utilities