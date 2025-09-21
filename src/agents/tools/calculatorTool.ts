import { tool } from '@openai/agents';
import { z } from 'zod';

export const calculatorTool = tool({
  name: 'calculator',
  description: 'Perform mathematical calculations and solve equations',
  parameters: z.object({
    expression: z.string().describe('Mathematical expression to evaluate'),
    type: z.enum(['basic', 'scientific', 'equation']).optional().default('basic')
  }),
  async execute({ expression, type = 'basic' }) {
    try {
      // Simple math evaluation (in production, use a proper math library like mathjs)
      const sanitizedExpression = expression
        .replace(/[^0-9+\-*/(). ]/g, '') // Basic sanitization
        .replace(/\s/g, '');

      // Basic validation
      if (!sanitizedExpression || /[^0-9+\-*/().]/g.test(sanitizedExpression)) {
        throw new Error('Invalid mathematical expression');
      }

      // Evaluate the expression safely
      const result = Function('"use strict"; return (' + sanitizedExpression + ')')();
      
      return {
        expression,
        result: typeof result === 'number' ? result : 'Invalid calculation',
        type,
        steps: [`Evaluating: ${expression}`, `Result: ${result}`],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Calculator error:', error);
      return {
        expression,
        result: 'Error in calculation',
        error: error instanceof Error ? error.message : 'Unknown calculation error',
        type,
        timestamp: new Date().toISOString()
      };
    }
  }
});