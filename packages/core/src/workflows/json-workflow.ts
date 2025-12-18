import { z } from 'zod';
import { Agent } from '../agent';
import { MastraError, ErrorDomain, ErrorCategory } from '../error';
import type { Mastra } from '../mastra';
import { Tool } from '../tools';
import { createStep, createWorkflow, type Workflow } from './workflow';

/**
 * JSON representation of a workflow step
 */
export interface JsonWorkflowStep {
  /**
   * Unique identifier for the step
   */
  id: string;
  /**
   * Type of step: 'agent', 'tool', or 'function'
   */
  type: 'agent' | 'tool' | 'function';
  /**
   * For 'agent' type: the agent ID registered in Mastra
   * For 'tool' type: the tool ID registered in Mastra
   * For 'function' type: not used
   */
  referenceId?: string;
  /**
   * Optional description of what this step does
   */
  description?: string;
  /**
   * JSON schema for input validation (optional)
   */
  inputSchema?: Record<string, any>;
  /**
   * JSON schema for output validation (optional)
   */
  outputSchema?: Record<string, any>;
  /**
   * For 'function' type: JavaScript function code as string
   * This will be evaluated using Function constructor
   */
  execute?: string;
  /**
   * Options for agent steps (e.g., structuredOutput)
   */
  options?: Record<string, any>;
}

/**
 * JSON representation of workflow control flow
 */
export type JsonWorkflowFlowEntry =
  | {
      type: 'step';
      stepId: string;
    }
  | {
      type: 'parallel';
      stepIds: string[];
    }
  | {
      type: 'branch';
      branches: Array<{
        condition: string; // JavaScript function as string
        stepId: string;
      }>;
    }
  | {
      type: 'loop';
      stepId: string;
      condition: string; // JavaScript function as string
      loopType: 'dowhile' | 'dountil';
    }
  | {
      type: 'foreach';
      stepId: string;
      concurrency?: number;
    }
  | {
      type: 'sleep';
      duration: number; // milliseconds
    }
  | {
      type: 'map';
      mapping: Record<string, any>;
    };

/**
 * JSON representation of a complete workflow
 */
export interface JsonWorkflowDefinition {
  /**
   * Unique identifier for the workflow
   */
  id: string;
  /**
   * Optional description of the workflow
   */
  description?: string;
  /**
   * JSON schema for workflow input (optional)
   */
  inputSchema?: Record<string, any>;
  /**
   * JSON schema for workflow output (optional)
   */
  outputSchema?: Record<string, any>;
  /**
   * JSON schema for workflow state (optional)
   */
  stateSchema?: Record<string, any>;
  /**
   * Step definitions
   */
  steps: JsonWorkflowStep[];
  /**
   * Flow control - defines the execution order and control structures
   */
  flow: JsonWorkflowFlowEntry[];
}

/**
 * Convert a JSON schema object to a Zod schema
 * This is a simple implementation that supports basic types
 */
function jsonSchemaToZod(schema: Record<string, any>): z.ZodType<any> {
  if (!schema || typeof schema !== 'object') {
    return z.any();
  }

  const type = schema.type;

  if (type === 'object') {
    const shape: Record<string, z.ZodType<any>> = {};
    const properties = schema.properties || {};

    for (const [key, value] of Object.entries(properties)) {
      let fieldSchema = jsonSchemaToZod(value as Record<string, any>);

      // Handle optional fields
      const required = schema.required || [];
      if (!required.includes(key)) {
        fieldSchema = fieldSchema.optional();
      }

      shape[key] = fieldSchema;
    }

    return z.object(shape);
  }

  if (type === 'array') {
    const items = schema.items || {};
    return z.array(jsonSchemaToZod(items));
  }

  if (type === 'string') {
    return z.string();
  }

  if (type === 'number' || type === 'integer') {
    return z.number();
  }

  if (type === 'boolean') {
    return z.boolean();
  }

  // Default to any for unsupported types
  return z.any();
}

/**
 * Create a Mastra workflow from a JSON definition
 *
 * @param definition - The JSON workflow definition
 * @param mastra - The Mastra instance (required to resolve agent and tool references)
 * @returns A Mastra Workflow instance
 *
 * @example
 * ```typescript
 * const workflowDef: JsonWorkflowDefinition = {
 *   id: 'my-workflow',
 *   description: 'A sample workflow',
 *   inputSchema: {
 *     type: 'object',
 *     properties: {
 *       prompt: { type: 'string' }
 *     }
 *   },
 *   outputSchema: {
 *     type: 'object',
 *     properties: {
 *       result: { type: 'string' }
 *     }
 *   },
 *   steps: [
 *     {
 *       id: 'ask-agent',
 *       type: 'agent',
 *       referenceId: 'my-agent'
 *     }
 *   ],
 *   flow: [
 *     { type: 'step', stepId: 'ask-agent' }
 *   ]
 * };
 *
 * const workflow = createWorkflowFromJson(workflowDef, mastra);
 * ```
 */
export function createWorkflowFromJson(
  definition: JsonWorkflowDefinition,
  mastra: Mastra,
): Workflow<any, any, any, any, any, any> {
  // Validate required fields
  if (!definition.id) {
    throw new MastraError({
      id: 'JSON_WORKFLOW_MISSING_ID',
      domain: ErrorDomain.MASTRA_WORKFLOW,
      category: ErrorCategory.USER,
      text: 'Workflow definition must have an id',
    });
  }

  if (!definition.steps || definition.steps.length === 0) {
    throw new MastraError({
      id: 'JSON_WORKFLOW_MISSING_STEPS',
      domain: ErrorDomain.MASTRA_WORKFLOW,
      category: ErrorCategory.USER,
      text: 'Workflow definition must have at least one step',
    });
  }

  if (!definition.flow || definition.flow.length === 0) {
    throw new MastraError({
      id: 'JSON_WORKFLOW_MISSING_FLOW',
      domain: ErrorDomain.MASTRA_WORKFLOW,
      category: ErrorCategory.USER,
      text: 'Workflow definition must have a flow definition',
    });
  }

  // Convert JSON schemas to Zod schemas
  const inputSchema = definition.inputSchema ? jsonSchemaToZod(definition.inputSchema) : z.any();
  const outputSchema = definition.outputSchema ? jsonSchemaToZod(definition.outputSchema) : z.any();
  const stateSchema = definition.stateSchema ? (jsonSchemaToZod(definition.stateSchema) as z.ZodObject<any>) : undefined;

  // Create step instances
  const stepMap = new Map();

  for (const stepDef of definition.steps) {
    let step;

    if (stepDef.type === 'agent') {
      if (!stepDef.referenceId) {
        throw new MastraError({
          id: 'JSON_WORKFLOW_AGENT_MISSING_REFERENCE',
          domain: ErrorDomain.MASTRA_WORKFLOW,
          category: ErrorCategory.USER,
          text: `Agent step '${stepDef.id}' must have a referenceId`,
        });
      }

      const agent = mastra.getAgent(stepDef.referenceId);
      if (!agent) {
        const availableAgents = Object.keys(mastra.listAgents() || {}).join(', ');
        throw new MastraError({
          id: 'JSON_WORKFLOW_AGENT_NOT_FOUND',
          domain: ErrorDomain.MASTRA_WORKFLOW,
          category: ErrorCategory.USER,
          text: `Agent '${stepDef.referenceId}' not found in Mastra instance`,
          details: { availableAgents },
        });
      }

      step = createStep(agent as Agent<any, any>, stepDef.options);
    } else if (stepDef.type === 'tool') {
      if (!stepDef.referenceId) {
        throw new MastraError({
          id: 'JSON_WORKFLOW_TOOL_MISSING_REFERENCE',
          domain: ErrorDomain.MASTRA_WORKFLOW,
          category: ErrorCategory.USER,
          text: `Tool step '${stepDef.id}' must have a referenceId`,
        });
      }

      const tool = mastra.getTool(stepDef.referenceId);
      if (!tool) {
        const availableTools = Object.keys(mastra.listTools() || {}).join(', ');
        throw new MastraError({
          id: 'JSON_WORKFLOW_TOOL_NOT_FOUND',
          domain: ErrorDomain.MASTRA_WORKFLOW,
          category: ErrorCategory.USER,
          text: `Tool '${stepDef.referenceId}' not found in Mastra instance`,
          details: { availableTools },
        });
      }

      step = createStep(tool as Tool<any, any, any, any, any>);
    } else if (stepDef.type === 'function') {
      if (!stepDef.execute) {
        throw new MastraError({
          id: 'JSON_WORKFLOW_FUNCTION_MISSING_EXECUTE',
          domain: ErrorDomain.MASTRA_WORKFLOW,
          category: ErrorCategory.USER,
          text: `Function step '${stepDef.id}' must have an execute function`,
        });
      }

      // Parse JSON schemas to Zod
      const stepInputSchema = stepDef.inputSchema ? jsonSchemaToZod(stepDef.inputSchema) : z.any();
      const stepOutputSchema = stepDef.outputSchema ? jsonSchemaToZod(stepDef.outputSchema) : z.any();

      // Create function from string
      // Security note: This uses Function constructor which can be dangerous
      // In production, you might want to use a safer evaluation method or sandboxing
      let executeFn;
      try {
        // The function string should be in the format: "async (ctx) => { return ...; }"
        // We wrap it to ensure proper scoping
        executeFn = new Function('return ' + stepDef.execute)();
      } catch (error) {
        throw new MastraError({
          id: 'JSON_WORKFLOW_FUNCTION_INVALID',
          domain: ErrorDomain.MASTRA_WORKFLOW,
          category: ErrorCategory.USER,
          text: `Failed to parse execute function for step '${stepDef.id}'`,
          details: { error: error instanceof Error ? error.message : String(error) },
        });
      }

      step = createStep({
        id: stepDef.id,
        description: stepDef.description,
        inputSchema: stepInputSchema,
        outputSchema: stepOutputSchema,
        execute: executeFn,
      });
    } else {
      throw new MastraError({
        id: 'JSON_WORKFLOW_UNKNOWN_STEP_TYPE',
        domain: ErrorDomain.MASTRA_WORKFLOW,
        category: ErrorCategory.USER,
        text: `Unknown step type '${stepDef.type}' for step '${stepDef.id}'`,
      });
    }

    stepMap.set(stepDef.id, step);
  }

  // Create workflow
  const workflow = createWorkflow({
    id: definition.id,
    description: definition.description,
    inputSchema,
    outputSchema,
    stateSchema,
    mastra,
  });

  // Build workflow flow
  for (const flowEntry of definition.flow) {
    if (flowEntry.type === 'step') {
      const step = stepMap.get(flowEntry.stepId);
      if (!step) {
        throw new MastraError({
          id: 'JSON_WORKFLOW_STEP_NOT_FOUND',
          domain: ErrorDomain.MASTRA_WORKFLOW,
          category: ErrorCategory.USER,
          text: `Step '${flowEntry.stepId}' referenced in flow but not defined in steps`,
        });
      }
      workflow.then(step);
    } else if (flowEntry.type === 'parallel') {
      const steps = flowEntry.stepIds.map(stepId => {
        const step = stepMap.get(stepId);
        if (!step) {
          throw new MastraError({
            id: 'JSON_WORKFLOW_STEP_NOT_FOUND',
            domain: ErrorDomain.MASTRA_WORKFLOW,
            category: ErrorCategory.USER,
            text: `Step '${stepId}' referenced in parallel flow but not defined in steps`,
          });
        }
        return step;
      });
      workflow.parallel(steps);
    } else if (flowEntry.type === 'branch') {
      const branches = flowEntry.branches.map(branch => {
        const step = stepMap.get(branch.stepId);
        if (!step) {
          throw new MastraError({
            id: 'JSON_WORKFLOW_STEP_NOT_FOUND',
            domain: ErrorDomain.MASTRA_WORKFLOW,
            category: ErrorCategory.USER,
            text: `Step '${branch.stepId}' referenced in branch flow but not defined in steps`,
          });
        }

        // Create condition function
        let conditionFn;
        try {
          conditionFn = new Function('return ' + branch.condition)();
        } catch (error) {
          throw new MastraError({
            id: 'JSON_WORKFLOW_CONDITION_INVALID',
            domain: ErrorDomain.MASTRA_WORKFLOW,
            category: ErrorCategory.USER,
            text: `Failed to parse condition function for branch`,
            details: { error: error instanceof Error ? error.message : String(error) },
          });
        }

        return [conditionFn, step] as const;
      });
      workflow.branch(branches as any);
    } else if (flowEntry.type === 'loop') {
      const step = stepMap.get(flowEntry.stepId);
      if (!step) {
        throw new MastraError({
          id: 'JSON_WORKFLOW_STEP_NOT_FOUND',
          domain: ErrorDomain.MASTRA_WORKFLOW,
          category: ErrorCategory.USER,
          text: `Step '${flowEntry.stepId}' referenced in loop flow but not defined in steps`,
        });
      }

      // Create condition function
      let conditionFn;
      try {
        conditionFn = new Function('return ' + flowEntry.condition)();
      } catch (error) {
        throw new MastraError({
          id: 'JSON_WORKFLOW_CONDITION_INVALID',
          domain: ErrorDomain.MASTRA_WORKFLOW,
          category: ErrorCategory.USER,
          text: `Failed to parse condition function for loop`,
          details: { error: error instanceof Error ? error.message : String(error) },
        });
      }

      if (flowEntry.loopType === 'dowhile') {
        workflow.dowhile(step, conditionFn);
      } else {
        workflow.dountil(step, conditionFn);
      }
    } else if (flowEntry.type === 'foreach') {
      const step = stepMap.get(flowEntry.stepId);
      if (!step) {
        throw new MastraError({
          id: 'JSON_WORKFLOW_STEP_NOT_FOUND',
          domain: ErrorDomain.MASTRA_WORKFLOW,
          category: ErrorCategory.USER,
          text: `Step '${flowEntry.stepId}' referenced in foreach flow but not defined in steps`,
        });
      }

      workflow.foreach(step, { concurrency: flowEntry.concurrency || 1 });
    } else if (flowEntry.type === 'sleep') {
      workflow.sleep(flowEntry.duration);
    } else if (flowEntry.type === 'map') {
      workflow.map(flowEntry.mapping);
    }
  }

  // Commit the workflow
  workflow.commit();

  return workflow;
}

/**
 * Serialize a workflow to a JSON string
 *
 * Note: This is a basic serialization that captures the structure but not all details.
 * Function-based steps cannot be fully serialized and will be marked as type 'function'
 * with empty execute strings. You'll need to manually add the function code.
 *
 * @param workflow - The workflow to serialize
 * @returns JSON string representation of the workflow
 */
export function serializeWorkflowToJson(workflow: Workflow<any, any, any, any, any, any>): string {
  const definition: JsonWorkflowDefinition = {
    id: workflow.id,
    description: workflow.description,
    steps: [],
    flow: [],
  };

  // Convert serialized step graph to JSON flow
  const serializedGraph = workflow.serializedStepGraph;

  for (const entry of serializedGraph) {
    if (entry.type === 'step') {
      const step = entry.step;

      // Determine step type based on component
      let stepType: 'agent' | 'tool' | 'function' = 'function';
      let referenceId: string | undefined;

      if (step.component === 'AGENT') {
        stepType = 'agent';
        referenceId = step.id;
      } else if (step.component === 'TOOL') {
        stepType = 'tool';
        referenceId = step.id;
      }

      definition.steps.push({
        id: step.id,
        type: stepType,
        referenceId,
        description: step.description,
      });

      definition.flow.push({
        type: 'step',
        stepId: step.id,
      });
    } else if (entry.type === 'parallel') {
      const stepIds = entry.steps.map(s => s.step.id);
      definition.flow.push({
        type: 'parallel',
        stepIds,
      });

      // Add steps if not already added
      for (const stepEntry of entry.steps) {
        const step = stepEntry.step;
        if (!definition.steps.find(s => s.id === step.id)) {
          definition.steps.push({
            id: step.id,
            type: 'function',
            description: step.description,
          });
        }
      }
    } else if (entry.type === 'conditional') {
      const branches = entry.steps.map((s, idx) => ({
        stepId: s.step.id,
        condition: entry.serializedConditions[idx]?.fn || 'async (ctx) => true',
      }));

      definition.flow.push({
        type: 'branch',
        branches,
      });

      // Add steps if not already added
      for (const stepEntry of entry.steps) {
        const step = stepEntry.step;
        if (!definition.steps.find(s => s.id === step.id)) {
          definition.steps.push({
            id: step.id,
            type: 'function',
            description: step.description,
          });
        }
      }
    } else if (entry.type === 'loop') {
      if (!definition.steps.find(s => s.id === entry.step.id)) {
        definition.steps.push({
          id: entry.step.id,
          type: 'function',
          description: entry.step.description,
        });
      }

      definition.flow.push({
        type: 'loop',
        stepId: entry.step.id,
        condition: entry.serializedCondition.fn,
        loopType: entry.loopType,
      });
    } else if (entry.type === 'foreach') {
      if (!definition.steps.find(s => s.id === entry.step.id)) {
        definition.steps.push({
          id: entry.step.id,
          type: 'function',
          description: entry.step.description,
        });
      }

      definition.flow.push({
        type: 'foreach',
        stepId: entry.step.id,
        concurrency: entry.opts.concurrency,
      });
    } else if (entry.type === 'sleep') {
      definition.flow.push({
        type: 'sleep',
        duration: entry.duration || 0,
      });
    }
  }

  return JSON.stringify(definition, null, 2);
}
