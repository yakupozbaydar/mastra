# JSON Workflow Example

This example demonstrates how to load and execute workflows from JSON definitions in Mastra.

## What's Inside

- `workflows/text-processor.json` - A JSON workflow definition that processes text through multiple steps
- `index.ts` - Example code showing how to load and execute the workflow

## The Workflow

The text processor workflow:
1. Converts input text to uppercase
2. Adds a "PROCESSED:" prefix
3. Wraps the result in "[FINAL]" tags

All steps are defined as function steps in the JSON file.

## Running the Example

```bash
# From the repository root
cd examples/json-workflow-example

# Install dependencies (if needed)
pnpm install

# Run the example
pnpm tsx index.ts
```

## Expected Output

```
Loading workflow from JSON...
Workflow loaded: text-processor
Description: Process text with multiple steps

Executing workflow...

Workflow completed!
Status: success
Result: { result: '[FINAL] PROCESSED: HELLO WORLD' }
```

## Key Concepts

### Loading from JSON String

```typescript
const workflowJson = fs.readFileSync('./workflow.json', 'utf-8');
const workflow = mastra.addWorkflowFromJsonString(workflowJson);
```

### Function Steps

Function steps in JSON use string representations of async functions:

```json
{
  "id": "myStep",
  "type": "function",
  "execute": "async ({ inputData }) => { return { result: inputData.value * 2 }; }"
}
```

### Sequential Flow

The workflow executes steps sequentially as defined in the `flow` array:

```json
{
  "flow": [
    { "type": "step", "stepId": "step1" },
    { "type": "step", "stepId": "step2" },
    { "type": "step", "stepId": "step3" }
  ]
}
```

## More Examples

For examples with agents and tools, see the main documentation at `docs/json-workflows-guide.md`.
