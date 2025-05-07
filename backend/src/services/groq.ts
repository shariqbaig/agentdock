import axios from "axios";
import { getConfig } from "../config";
import { logger } from "../utils/logger";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  model: string;
  created: number;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Groq API client for handling natural language processing
 */
export class GroqClient {
  private apiKey: string;
  private model: string;
  private client: any;

  constructor() {
    const config = getConfig();
    this.apiKey = config.groq.apiKey;
    this.model = config.groq.model;

    this.client = axios.create({
      baseURL: "https://api.groq.com/openai/v1",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    logger.info(`Initialized Groq client with model: ${this.model}`);
  }

  /**
   * Process a natural language query using Groq's LLM
   */
  async processQuery(
    query: string, 
    systemPrompt: string = "You are a helpful assistant that helps with tool integrations and agent management."
  ): Promise<string> {
    try {
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ];

      const request: ChatCompletionRequest = {
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2048
      };

      logger.info(`Sending query to Groq: ${query.substring(0, 100)}...`);
      const response = await this.client.post("/chat/completions", request);
      const completion = response.data as ChatCompletionResponse;

      const answer = completion.choices[0].message.content;
      logger.info(`Received response from Groq: ${answer.substring(0, 100)}...`);
      
      return answer;
    } catch (error: any) {
      logger.error(`Error processing query with Groq: ${error.message}`);
      if (error.response) {
        logger.error(`Groq API response error: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Failed to process query: ${error.message}`);
    }
  }

  /**
   * Process a query with specific tool knowledge
   */
  async processToolQuery(
    query: string,
    tool: string,
    action: string
  ): Promise<string> {
    const systemPrompt = `
    You are an AI assistant specialized in working with ${tool}. 
    Your task is to help users ${action}. 
    Provide clear, step-by-step instructions and relevant information.
    Be concise, accurate, and helpful.
    `;

    return this.processQuery(query, systemPrompt);
  }

  /**
   * Generate a response for a specific agent
   */
  async generateAgentResponse(
    agentName: string,
    agentDescription: string,
    query: string
  ): Promise<string> {
    const systemPrompt = `
    You are ${agentName}, an AI agent with the following capabilities:
    ${agentDescription}
    
    Respond to the user's query in a helpful and informative way.
    If you need to use specific tools to fulfill the request, mention that in your response.
    `;

    return this.processQuery(query, systemPrompt);
  }
}

// Export a singleton instance
export const groqClient = new GroqClient();