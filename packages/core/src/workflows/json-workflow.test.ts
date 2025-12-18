import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { Agent } from '../agent';
import { Mastra } from '../mastra';
import { createTool } from '../tools';
import { createWorkflowFromJson, serializeWorkflowToJson, type JsonWorkflowDefinition } from './json-workflow';
import { createStep, createWorkflow } from './workflow';

describe('JSON Workflow', () => {
  let mastra: Mastra;

  beforeEach(() => {
    const agent = new Agent({
      id: 'test-agent',
      name: 'Test Agent',
      instructions: 'You are a test agent',
      model: {
        provider: 'OPEN_AI',
        name: 'gpt-4o',
        toolChoice: 'auto',
      },
    });

    const tool = createTool({
      id: 'test-tool',
      description: 'A test tool',
      inputSchema: z.object({
        input: z.string(),
      }),
      outputSchema: z.object({
        output: z.string(),
      }),
      execute: async ({ input }) => {
        return { output: `Processed: ${input}` };
      },
    });

    mastra = new Mastra({
      agents: { testAgent: agent },
      tools: { testTool: tool },
    });
  });

  describe('createWorkflowFromJson', () => {
    it('should create a workflow with an agent step', () => {
      const definition: JsonWorkflowDefinition = {
        id: 'test-workflow',
        description: 'A test workflow',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string' },
          },
          required: ['prompt'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string' },
          },
        },
        steps: [
          {
            id: 'ask-agent',
            type: 'agent',
            referenceId: 'test-agent',
            description: 'Ask the agent',
          },
        ],
        flow: [{ type: 'step', stepId: 'ask-agent' }],
      };

      const workflow = createWorkflowFromJson(definition, mastra);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe('test-workflow');
      expect(workflow.description).toBe('A test workflow');
      expect(workflow.committed).toBe(true);
    });

    it('should create a workflow with a tool step', () => {
      const definition: JsonWorkflowDefinition = {
        id: 'tool-workflow',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string' },
          },
        },
        outputSchema: {
          type: 'object',
          properties: {
            output: { type: 'string' },
          },
        },
        steps: [
          {
            id: 'use-tool',
            type: 'tool',
            referenceId: 'test-tool',
          },
        ],
        flow: [{ type: 'step', stepId: 'use-tool' }],
      };

      const workflow = createWorkflowFromJson(definition, mastra);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe('tool-workflow');
    });

    it('should create a workflow with a function step', () => {
      const definition: JsonWorkflowDefinition = {
        id: 'function-workflow',
        inputSchema: {
          type: 'object',
          properties: {
            value: { type: 'number' },
          },
        },
        outputSchema: {
          type: 'object',
          properties: {
            doubled: { type: 'number' },
          },
        },
        steps: [
          {
            id: 'double',
            type: 'function',
            execute: 'async ({ inputData }) => { return { doubled: inputData.value * 2 }; }',
          },
        ],
        flow: [{ type: 'step', stepId: 'double' }],
      };

      const workflow = createWorkflowFromJson(definition, mastra);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe('function-workflow');
    });

    it('should create a workflow with parallel steps', () => {
      const definition: JsonWorkflowDefinition = {
        id: 'parallel-workflow',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string' },
          },
        },
        outputSchema: {
          type: 'object',
        },
        steps: [
          {
            id: 'step1',
            type: 'function',
            execute: 'async ({ inputData }) => { return { result: "step1" }; }',
          },
          {
            id: 'step2',
            type: 'function',
            execute: 'async ({ inputData }) => { return { result: "step2" }; }',
          },
        ],
        flow: [
          {
            type: 'parallel',
            stepIds: ['step1', 'step2'],
          },
        ],
      };

      const workflow = createWorkflowFromJson(definition, mastra);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe('parallel-workflow');
    });

    it('should create a workflow with sleep', () => {
      const definition: JsonWorkflowDefinition = {
        id: 'sleep-workflow',
        inputSchema: {
          type: 'object',
        },
        outputSchema: {
          type: 'object',
        },
        steps: [],
        flow: [
          {
            type: 'sleep',
            duration: 100,
          },
        ],
      };

      const workflow = createWorkflowFromJson(definition, mastra);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe('sleep-workflow');
    });

    it('should throw error for missing workflow id', () => {
      const definition = {
        steps: [],
        flow: [],
      } as any;

      expect(() => createWorkflowFromJson(definition, mastra)).toThrow('Workflow definition must have an id');
    });

    it('should throw error for missing steps', () => {
      const definition: JsonWorkflowDefinition = {
        id: 'no-steps',
        steps: [],
        flow: [{ type: 'step', stepId: 'missing' }],
      };

      expect(() => createWorkflowFromJson(definition, mastra)).toThrow(
        'Step \'missing\' referenced in flow but not defined in steps',
      );
    });

    it('should throw error for non-existent agent', () => {
      const definition: JsonWorkflowDefinition = {
        id: 'missing-agent',
        steps: [
          {
            id: 'step1',
            type: 'agent',
            referenceId: 'non-existent-agent',
          },
        ],
        flow: [{ type: 'step', stepId: 'step1' }],
      };

      expect(() => createWorkflowFromJson(definition, mastra)).toThrow(
        'Agent \'non-existent-agent\' not found in Mastra instance',
      );
    });

    it('should throw error for non-existent tool', () => {
      const definition: JsonWorkflowDefinition = {
        id: 'missing-tool',
        steps: [
          {
            id: 'step1',
            type: 'tool',
            referenceId: 'non-existent-tool',
          },
        ],
        flow: [{ type: 'step', stepId: 'step1' }],
      };

      expect(() => createWorkflowFromJson(definition, mastra)).toThrow(
        'Tool \'non-existent-tool\' not found in Mastra instance',
      );
    });
  });

  describe('serializeWorkflowToJson', () => {
    it('should serialize a simple workflow', () => {
      const step1 = createStep({
        id: 'step1',
        description: 'First step',
        inputSchema: z.object({ value: z.number() }),
        outputSchema: z.object({ result: z.number() }),
        execute: async ({ inputData }) => ({ result: inputData.value * 2 }),
      });

      const workflow = createWorkflow({
        id: 'simple-workflow',
        description: 'A simple workflow',
        inputSchema: z.object({ value: z.number() }),
        outputSchema: z.object({ result: z.number() }),
      });

      workflow.then(step1).commit();

      const json = serializeWorkflowToJson(workflow);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe('simple-workflow');
      expect(parsed.description).toBe('A simple workflow');
      expect(parsed.steps).toHaveLength(1);
      expect(parsed.steps[0].id).toBe('step1');
      expect(parsed.flow).toHaveLength(1);
      expect(parsed.flow[0].type).toBe('step');
    });
  });

  describe('Mastra integration', () => {
    it('should add workflow from JSON definition', () => {
      const definition: JsonWorkflowDefinition = {
        id: 'integration-test',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string' },
          },
        },
        outputSchema: {
          type: 'object',
        },
        steps: [
          {
            id: 'use-tool',
            type: 'tool',
            referenceId: 'test-tool',
          },
        ],
        flow: [{ type: 'step', stepId: 'use-tool' }],
      };

      const workflow = mastra.addWorkflowFromJson(definition);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe('integration-test');
      expect(mastra.getWorkflowById('integration-test')).toBe(workflow);
    });

    it('should add workflow from JSON string', () => {
      const jsonString = JSON.stringify({
        id: 'from-string',
        inputSchema: {
          type: 'object',
        },
        outputSchema: {
          type: 'object',
        },
        steps: [
          {
            id: 'step1',
            type: 'function',
            execute: 'async ({ inputData }) => { return {}; }',
          },
        ],
        flow: [{ type: 'step', stepId: 'step1' }],
      });

      const workflow = mastra.addWorkflowFromJsonString(jsonString);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe('from-string');
    });

    it('should throw error for invalid JSON string', () => {
      const invalidJson = '{ invalid json }';

      expect(() => mastra.addWorkflowFromJsonString(invalidJson)).toThrow('Failed to parse workflow JSON string');
    });
  });
});
