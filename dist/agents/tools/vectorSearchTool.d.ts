import { z } from 'zod';
export declare const vectorSearchTool: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    query: z.ZodString;
    collection_name: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    score_threshold: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit: number | null;
    score_threshold: number | null;
    collection_name: string | null;
}, {
    query: string;
    limit?: number | null | undefined;
    score_threshold?: number | null | undefined;
    collection_name?: string | null | undefined;
}>, string>;
//# sourceMappingURL=vectorSearchTool.d.ts.map