import 'dotenv/config';
import { Agent, run } from '@openai/agents';
import { webSearchTool } from './tools/webSearchTool.js';
import { vectorSearchTool } from './tools/vectorSearchTool.js';
import { pdfReaderTool } from './tools/pdfReaderTool.js';
import { calculatorTool } from './tools/calculatorTool.js';
import { conversationMemory } from '../services/conversationMemory.js';
// Research Agent - handles web search and information gathering
const researchAgent = new Agent({
    name: 'Research Agent',
    model: 'gpt-4o-mini',
    tools: [webSearchTool, vectorSearchTool],
    instructions: `
   Yes, I understand now. The issue isn't with the code itself, but with how the AI is interpreting the prompt. The AI is only giving you sources because the prompt's instructions, particularly the emphasis on providing citations and source information, are causing it to prioritize the source list over a full, detailed explanation. It's essentially following your instructions to the letter, but the outcome isn't what you intended.

To fix this, we need to adjust the prompt to explicitly instruct the AI to do two things:

Synthesize information: Tell the AI to combine the facts from its search results into a comprehensive answer.

Explain the topic: Explicitly state that the goal is to provide a detailed explanation or summary, with sources as supporting evidence, not the main output.

Here is a revised prompt that should give you the behavior you want:

Revised Prompt
"You are a sophisticated AI assistant specializing in research and information synthesis. Your primary goal is to provide a complete, well-structured, and factual answer to the user's query, always backed by reliable sources.

Your Responsibilities:

Primary Action: First, answer the user's question directly and comprehensively.

Synthesis and Explanation: Analyze the information from the sources you find and write a coherent, detailed explanation or summary. Do not simply list facts; connect them to form a clear narrative.

Use of Tools:

web_search: Use this tool for queries about current events, recent data, or general topics that require up-to-date information.

vector_search: Utilize this for queries related to your internal knowledge base or pre-indexed documents.

Source Validation & Attribution:

Always search for and include at least three high-quality sources to cross-reference and support your answer.

Critically evaluate the sources. Prioritize official websites, academic papers, and well-known, reputable news outlets.

If a source is unreliable or cannot be accessed, do not use it. Instead, state that you encountered an issue and continue your search to find a working alternative.

Provide inline citations for every piece of information [1], [2], etc., linking to the correct source URL.

Response Structure:

Begin with a clear and concise summary of the answer.

Follow with a detailed explanation, ensuring every fact is cited.

Conclude with a bulleted list of the sourced links, clearly labeled for easy reference. Example: [1] Title of the article/page - URL. "
  `
});
// Analysis Agent - handles document analysis and complex reasoning
const analysisAgent = new Agent({
    name: 'Analysis Agent',
    model: 'gpt-4o-mini',
    tools: [pdfReaderTool, calculatorTool],
    instructions: `
    You are an analysis specialist focused on document processing and computational tasks.
    
    Your role:
    - Use pdf_reader for extracting and analyzing document content
    - Use calculator for mathematical computations and numerical analysis
    - Provide detailed analysis and insights from documents
    - Perform accurate calculations and show your work
    - Synthesize complex information into clear explanations
    
    When analyzing:
    - Read documents thoroughly and extract key information
    - Perform calculations step-by-step
    - Provide context for numerical results
    - Highlight important findings and patterns
    
    Response format:
    - Provide clear analysis with supporting evidence
    - Show calculation steps when relevant
    - Include document references and page numbers when available
  `
});
// Main Perplexity Agent - orchestrates the research process
export const perplexityAgent = Agent.create({
    name: 'Perplexity Assistant',
    model: 'gpt-4o-mini',
    instructions: `
    You are Perplexity AI, an intelligent research assistant that provides accurate, well-sourced answers to user questions.
    
    Your capabilities:
    - Research current information through web search
    - Access indexed document knowledge base
    - Analyze PDF documents and files
    - Perform mathematical calculations
    - Provide multi-step reasoning and follow-up analysis
    
    Response format:
    1. Provide a concise answer (under 150 words) with inline citations [1], [2], etc.
    2. Include a "Sources" section with numbered references
    3. Offer relevant follow-up questions when appropriate
    
    Decision making:
    - Hand off to Research Agent for: current events, factual queries, general information needs
    - Hand off to Analysis Agent for: document analysis, mathematical problems, computational tasks
    - For complex queries, you may need to use both agents in sequence
    
    Always:
    - Prioritize accuracy over speed
    - Cite sources clearly and consistently
    - Acknowledge limitations in available information
    - Maintain conversation context for follow-up questions
    - Be concise but comprehensive
  `,
    handoffs: [researchAgent, analysisAgent]
});
export async function processQuery(query, conversationId = 'default') {
    try {
        // Get contextual query with conversation history
        const contextualQuery = conversationMemory.getContextualQuery(conversationId, query);
        console.log(`Processing query: ${query}`);
        console.log(`Contextual query: ${contextualQuery}`);
        // Run the agent
        const result = await run(perplexityAgent, contextualQuery);
        // Store in conversation memory
        conversationMemory.addEntry(conversationId, {
            query,
            // @ts-ignore
            response: result.finalOutput,
            timestamp: new Date().toISOString(),
            agent: result.lastAgent?.name || 'Perplexity Assistant'
        });
        return {
            answer: result.finalOutput,
            sources: extractSources(result),
            conversationId,
            // @ts-ignore
            followUpQuestions: generateFollowUpQuestions(query, result.finalOutput),
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        console.error('Query processing error:', error);
        throw new Error(`Failed to process query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
function extractSources(result) {
    const sources = [];
    if (result.history) {
        result.history.forEach((step) => {
            if (step.toolCalls) {
                step.toolCalls.forEach((call) => {
                    if (call.result?.results) {
                        call.result.results.forEach((item) => {
                            sources.push({
                                id: sources.length + 1,
                                title: item.title || item.metadata?.title || `Source ${sources.length + 1}`,
                                url: item.link || item.metadata?.url || '',
                                snippet: item.snippet || item.content?.substring(0, 150) + '...' || '',
                                type: item.type || 'unknown'
                            });
                        });
                    }
                });
            }
        });
    }
    return sources;
}
function generateFollowUpQuestions(originalQuery, response) {
    const followUps = [];
    if (originalQuery.toLowerCase().includes('what')) {
        followUps.push(`How does this relate to ${originalQuery.split(' ').slice(-2).join(' ')}?`);
    }
    if (originalQuery.toLowerCase().includes('why')) {
        followUps.push(`What are the implications of this?`);
    }
    followUps.push('Can you provide more specific examples?');
    followUps.push('What are the recent developments in this area?');
    return followUps.slice(0, 3);
}
//# sourceMappingURL=perplexityAgent.js.map