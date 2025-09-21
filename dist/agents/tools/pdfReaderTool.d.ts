import { z } from 'zod';
export declare const pdfReaderTool: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    file_path: z.ZodString;
    page_range: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        start: z.ZodNullable<z.ZodNumber>;
        end: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        start: number | null;
        end: number | null;
    }, {
        start: number | null;
        end: number | null;
    }>>>;
}, "strip", z.ZodTypeAny, {
    file_path: string;
    page_range?: {
        start: number | null;
        end: number | null;
    } | null | undefined;
}, {
    file_path: string;
    page_range?: {
        start: number | null;
        end: number | null;
    } | null | undefined;
}>, string>;
//# sourceMappingURL=pdfReaderTool.d.ts.map