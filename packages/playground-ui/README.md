# @mastra/playground-ui

React UI components for the Mastra development playground interface.

## Overview

This package provides the frontend components used in the Mastra CLI's development server (`mastra dev`). It includes a chat interface, agent testing tools, workflow visualization, and configuration panels.

## Features

- **Chat Interface**: Interactive chat UI for testing agents
- **Agent Management**: View and configure agent settings
- **Workflow Visualization**: Visual representation of workflow execution
- **Tool Testing**: Interface for testing individual tools
- **Configuration Panel**: Environment and integration settings
- **Real-time Updates**: Live updates during development

## Components

### Chat Components
- `ChatInterface` - Main chat conversation component
- `MessageBubble` - Individual message display
- `InputArea` - Message input with tool support

### Agent Components
- `AgentList` - Display available agents
- `AgentConfig` - Agent configuration interface
- `AgentMetrics` - Performance and usage metrics

### Workflow Components
- `WorkflowGraph` - Visual workflow representation
- `StepDetail` - Individual step configuration
- `ExecutionTrace` - Workflow execution history

## Usage

This package is automatically used by the Mastra CLI and should not be installed separately in user projects.

```bash
# Start the development server
mastra dev
```

The playground UI will be available at `http://localhost:3000`.

## Development

### Prerequisites
- Node.js 20+
- React 18+
- Modern browser with ES2020 support

### Building
```bash
pnpm build:playground-ui
```

### Local Development
```bash
pnpm dev:playground
```

## Related Packages

- [@mastra/cli](../cli) - CLI that hosts the playground
- [@mastra/core](../core) - Core framework integration
- [mastra](../playground) - Playground backend server