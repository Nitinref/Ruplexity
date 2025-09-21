import "dotenv/config";
import { z } from 'zod';
export declare const webSearchTool: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    query: z.ZodString;
    num_results: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    num_results: number;
}, {
    query: string;
    num_results?: number | undefined;
}>, string>;
//# sourceMappingURL=webSearchTool.d.ts.map