interface ConversationEntry {
    query: string;
    response: string;
    timestamp: string;
    agent: string;
}
export declare class ConversationMemoryService {
    private conversations;
    addEntry(conversationId: string, entry: ConversationEntry): void;
    getHistory(conversationId: string): ConversationEntry[];
    clearConversation(conversationId: string): void;
    getContextualQuery(conversationId: string, currentQuery: string): string;
}
export declare const conversationMemory: ConversationMemoryService;
export {};
//# sourceMappingURL=conversationMemory.d.ts.map