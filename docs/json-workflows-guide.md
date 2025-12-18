# JSON Workflows in Mastra

This guide shows how to define and load workflows using JSON definitions in Mastra.

## Overview

JSON workflows allow you to:
- Define workflows in a declarative JSON format
- Store workflow definitions in files or databases
- Load and execute workflows dynamically at runtime
- Reference existing agents and tools in your Mastra instance

## JSON Workflow Structure

A JSON workflow definition has the following structure:

```typescript
interface JsonWorkflowDefinition {
  id: string;                      // Unique workflow identifier
  description?: string;            // Optional description
  inputSchema?: object;            // JSON Schema for input validation
  outputSchema?: object;           // JSON Schema for output validation
  stateSchema?: object;            // JSON Schema for state validation
  steps: JsonWorkflowStep[];       // Array of step definitions
  flow: JsonWorkflowFlowEntry[];   // Execution flow control
}
```

## Step Types

### Agent Step

References an agent registered in your Mastra instance:

```json
{
  "id": "ask-agent",
  "type": "agent",
  "referenceId": "myAgent",
  "description": "Ask the agent a question",
  "options": {
    "structuredOutput": {
      "schema": {
        "type": "object",
        "properties": {
          "answer": { "type": "string" }
        }
      }
    }
  }
}
```

### Tool Step

References a tool registered in your Mastra instance:

```json
{
  "id": "search-web",
  "type": "tool",
  "referenceId": "webSearchTool",
  "description": "Search the web"
}
```

### Function Step

Defines a custom JavaScript function:

```json
{
  "id": "process-data",
  "type": "function",
  "description": "Process the data",
  "inputSchema": {
    "type": "object",
    "properties": {
      "value": { "type": "number" }
    }
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "result": { "type": "number" }
    }
  },
  "execute": "async ({ inputData }) => { return { result: inputData.value * 2 }; }"
}
```

## Flow Control

### Sequential Steps

```json
{
  "flow": [
    { "type": "step", "stepId": "step1" },
    { "type": "step", "stepId": "step2" }
  ]
}
```

### Parallel Execution

```json
{
  "flow": [
    {
      "type": "parallel",
      "stepIds": ["step1", "step2", "step3"]
    }
  ]
}
```

### Conditional Branching

```json
{
  "flow": [
    {
      "type": "branch",
      "branches": [
        {
          "condition": "async ({ inputData }) => inputData.value > 10",
          "stepId": "highValueStep"
        },
        {
          "condition": "async ({ inputData }) => inputData.value <= 10",
          "stepId": "lowValueStep"
        }
      ]
    }
  ]
}
```

### Loop (Do-While/Do-Until)

```json
{
  "flow": [
    {
      "type": "loop",
      "stepId": "repeatingStep",
      "condition": "async ({ getStepResult }) => { const result = getStepResult(step); return result.output.count < 5; }",
      "loopType": "dowhile"
    }
  ]
}
```

### For-Each

```json
{
  "flow": [
    {
      "type": "foreach",
      "stepId": "itemProcessor",
      "concurrency": 3
    }
  ]
}
```

### Sleep

```json
{
  "flow": [
    { "type": "sleep", "duration": 1000 }
  ]
}
```

## Complete Example

Here's a complete example of a JSON workflow that processes user queries:

```json
{
  "id": "query-processor",
  "description": "Process user queries with AI and web search",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string" }
    },
    "required": ["query"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "response": { "type": "string" }
    }
  },
  "steps": [
    {
      "id": "analyze-query",
      "type": "agent",
      "referenceId": "analyzerAgent",
      "description": "Analyze the user query"
    },
    {
      "id": "search-web",
      "type": "tool",
      "referenceId": "webSearch",
      "description": "Search for relevant information"
    },
    {
      "id": "format-response",
      "type": "function",
      "description": "Format the final response",
      "execute": "async ({ inputData, getStepResult }) => { const analysis = getStepResult('analyze-query'); const searchResults = getStepResult('search-web'); return { response: `Based on: ${analysis.text}\\n\\nResults: ${searchResults.results}` }; }"
    }
  ],
  "flow": [
    { "type": "step", "stepId": "analyze-query" },
    { "type": "step", "stepId": "search-web" },
    { "type": "step", "stepId": "format-response" }
  ]
}
```

## Usage with Mastra

### Loading from JSON Definition

```typescript
import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import type { JsonWorkflowDefinition } from '@mastra/core/workflows';

// Setup Mastra with agents and tools
const mastra = new Mastra({
  agents: {
    analyzerAgent: new Agent({
      id: 'analyzer',
      name: 'Query Analyzer',
      instructions: 'Analyze user queries',
      model: 'openai/gpt-4o'
    })
  },
  tools: {
    webSearch: createTool({
      id: 'web-search',
      description: 'Search the web',
      inputSchema: z.object({ query: z.string() }),
      outputSchema: z.object({ results: z.string() }),
      execute: async ({ query }) => {
        // Implementation
        return { results: 'Search results...' };
      }
    })
  }
});

// Load workflow from JSON
const workflowDef: JsonWorkflowDefinition = {
  id: 'my-workflow',
  // ... workflow definition
};

const workflow = mastra.addWorkflowFromJson(workflowDef);
```

### Loading from JSON String

```typescript
import fs from 'fs';

// Load from file
const workflowJson = fs.readFileSync('./workflows/my-workflow.json', 'utf-8');
const workflow = mastra.addWorkflowFromJsonString(workflowJson);
```

### Executing the Workflow

```typescript
// Create a run
const run = await workflow.createRun();

// Execute
const result = await run.start({
  inputData: { query: 'What is TypeScript?' }
});

console.log(result.result);
```

## Serializing Workflows

You can also serialize existing workflows to JSON:

```typescript
import { serializeWorkflowToJson, createWorkflow, createStep } from '@mastra/core/workflows';

// Create a workflow programmatically
const step1 = createStep({
  id: 'step1',
  inputSchema: z.object({ input: z.string() }),
  outputSchema: z.object({ output: z.string() }),
  execute: async ({ inputData }) => ({ output: inputData.input.toUpperCase() })
});

const workflow = createWorkflow({
  id: 'my-workflow',
  inputSchema: z.object({ input: z.string() }),
  outputSchema: z.object({ output: z.string() })
});

workflow.then(step1).commit();

// Serialize to JSON
const json = serializeWorkflowToJson(workflow);
console.log(json);

// Save to file
fs.writeFileSync('./workflows/exported-workflow.json', json);
```

## Security Considerations

**Important**: The `function` step type uses JavaScript's `Function` constructor to evaluate code strings. This can be dangerous if you're loading workflow definitions from untrusted sources. Consider these security measures:

1. **Only load workflows from trusted sources**
2. **Validate and sanitize workflow definitions before loading**
3. **Use agent and tool steps instead of function steps when possible**
4. **Implement sandboxing for function execution in production**
5. **Add workflow validation and approval workflows**

## Best Practices

1. **Use Schemas**: Always define input and output schemas for validation
2. **Reference IDs**: Use the registration keys (not IDs) when referencing agents and tools
3. **Version Control**: Store workflow definitions in version control
4. **Testing**: Test workflows thoroughly before deployment
5. **Documentation**: Add clear descriptions to steps and workflows
6. **Error Handling**: Consider adding error handling in function steps

## Limitations

1. Function steps cannot access external variables (closures)
2. Complex types in schemas may not serialize perfectly
3. Nested workflows are serialized with limited detail
4. Not all workflow features can be fully serialized

## TypeScript Types

For TypeScript users, the following types are available:

```typescript
import type {
  JsonWorkflowDefinition,
  JsonWorkflowStep,
  JsonWorkflowFlowEntry,
  createWorkflowFromJson,
  serializeWorkflowToJson
} from '@mastra/core/workflows';
```
