interface ConversationEntry {
  query: string;
  response: string;
  timestamp: string;
  agent: string;
}

// Simple in-memory conversation storage
// In production, you'd use Redis or a database
export class ConversationMemoryService {
  private conversations = new Map<string, ConversationEntry[]>();

  addEntry(conversationId: string, entry: ConversationEntry) {
    const history = this.conversations.get(conversationId) || [];
    history.push(entry);
    
    // Keep only last 10 entries per conversation
    if (history.length > 10) {
      history.shift();
    }
    
    this.conversations.set(conversationId, history);
  }

  getHistory(conversationId: string): ConversationEntry[] {
    return this.conversations.get(conversationId) || [];
  }

  clearConversation(conversationId: string) {
    this.conversations.delete(conversationId);
  }

  getContextualQuery(conversationId: string, currentQuery: string): string {
    const history = this.getHistory(conversationId);
    
    if (history.length === 0) {
      return currentQuery;
    }
    
    // Add context from last 2 exchanges
    const recentHistory = history.slice(-2);
    const context = recentHistory.map(h => h.query).join(' ');
    
    return `Previous context: ${context}\n\nCurrent question: ${currentQuery}`;
  }
}

export const conversationMemory = new ConversationMemoryService();