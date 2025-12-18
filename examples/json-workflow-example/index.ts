import { Mastra } from '@mastra/core';
import fs from 'fs';
import path from 'path';

async function main() {
  // Initialize Mastra instance
  const mastra = new Mastra({});

  // Load workflow from JSON file
  const workflowPath = path.join(__dirname, 'workflows', 'text-processor.json');
  const workflowJson = fs.readFileSync(workflowPath, 'utf-8');

  console.log('Loading workflow from JSON...');
  const workflow = mastra.addWorkflowFromJsonString(workflowJson);

  console.log(`Workflow loaded: ${workflow.id}`);
  console.log(`Description: ${workflow.description}`);

  // Create and execute a workflow run
  console.log('\nExecuting workflow...');
  const run = await workflow.createRun();

  const result = await run.start({
    inputData: {
      text: 'hello world',
    },
  });

  console.log('\nWorkflow completed!');
  console.log('Status:', result.status);
  console.log('Result:', result.result);
}

main().catch(console.error);
