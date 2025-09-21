import { z } from 'zod';
export declare const calculatorTool: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    expression: z.ZodString;
    type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["basic", "scientific", "equation"]>>>;
}, "strip", z.ZodTypeAny, {
    type: "basic" | "scientific" | "equation";
    expression: string;
}, {
    expression: string;
    type?: "basic" | "scientific" | "equation" | undefined;
}>, string>;
//# sourceMappingURL=calculatorTool.d.ts.map