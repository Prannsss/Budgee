import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Controller for Budgee Chatbot
 * Handles finance-related questions using Google Gemini API
 */

// Initialize Google Gemini API
let genAI: GoogleGenerativeAI | null = null;

// Use a stable model with better rate limits
const GEMINI_MODEL = 'gemini-2.0-flash';

const initializeAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
        const waitTime = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`[AI Controller] Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
        await delay(waitTime);
        continue;
      }
      
      // For other errors, don't retry
      throw error;
    }
  }
  
  throw lastError;
}

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  accounts: Array<{
    name: string;
    type: string;
    balance: number;
    lastFour: string;
  }>;
  recentTransactions: Array<{
    date: string;
    description: string;
    amount: number;
    category: string;
  }>;
  categoryTotals: Record<string, number>;
}

interface AskQuestionRequest {
  question: string;
  userId: string;
  financialData: FinancialData;
}

/**
 * Answer finance questions
 * POST /api/ai/ask
 */
export const answerFinanceQuestion = async (req: Request, res: Response) => {
  try {
    const { question, userId, financialData } = req.body as AskQuestionRequest;

    // Validate required fields
    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Question is required and must be a string',
      });
    }

    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({
        success: false,
        error: 'User ID is required',
      });
    }

    if (!financialData || typeof financialData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Financial data is required',
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('[AI Controller] GEMINI_API_KEY is not configured');
      return res.status(503).json({
        success: false,
        error: 'AI service is not properly configured. Please contact support.',
      });
    }

    console.log('[AI Controller] Processing question for user:', userId);
    console.log('[AI Controller] Question:', question);

    // Initialize AI
    const ai = initializeAI();
    if (!ai) {
      throw new Error('Failed to initialize AI service');
    }

    // Get the generative model - using stable model with better rate limits
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

    // Prepare financial context
    const financialContext = `
User Financial Summary:
- Total Income: ₱${financialData.totalIncome.toFixed(2)}
- Total Expenses: ₱${financialData.totalExpenses.toFixed(2)}
- Total Savings: ₱${financialData.savings.toFixed(2)}
- Net Balance: ₱${(financialData.totalIncome - financialData.totalExpenses).toFixed(2)}

Accounts (${financialData.accounts.length}):
${financialData.accounts.map(acc => `  - ${acc.name} (${acc.type}): ₱${acc.balance.toFixed(2)} ${acc.lastFour !== '----' ? `[****${acc.lastFour}]` : ''}`).join('\n')}

Recent Transactions:
${financialData.recentTransactions.map(txn => 
  `  - ${txn.date}: ${txn.description} - ${txn.amount >= 0 ? '+' : ''}₱${txn.amount.toFixed(2)} (${txn.category})`
).join('\n')}

Category Totals:
${Object.entries(financialData.categoryTotals)
  .map(([category, amount]) => `  - ${category}: ${amount >= 0 ? '+' : ''}₱${amount.toFixed(2)}`)
  .join('\n')}
`.trim();

    // Create the prompt
    const prompt = `You are Budgee, a friendly and supportive financial buddy! Talk to the user like a close friend who's good with money - be warm, encouraging, and genuinely helpful.

IMPORTANT: The financial data below is FOR YOUR REFERENCE ONLY. DO NOT include this raw data in your response. Use it to understand their situation and answer their question naturally.

Financial Data (REFERENCE ONLY - DO NOT REPEAT THIS):
${financialContext}

User Question: ${question}

How to respond:
- Answer their ACTUAL question directly - don't dump data they didn't ask for
- Chat naturally like texting a friend - use casual language, contractions (you're, let's, here's)
- Be enthusiastic and encouraging! Celebrate their wins, support them through challenges
- Use emojis occasionally to add warmth (💰 🎯 👏 💪 ✨) but don't overdo it
- ONLY mention specific numbers if they're relevant to what they asked
- Give ONE practical tip or insight they can act on
- Be empathetic - acknowledge their feelings about money
- Use phrases like "Hey!", "Nice!", "You got this!", "Here's the thing..."
- Sound excited when they're doing well, supportive when they need help
- Avoid corporate jargon - talk like a real person
- If they just say "hey" or "hi", greet them warmly and ask how you can help with their finances
- If they ask a casual question, respond casually without forcing financial data into it

FORMATTING RULES (VERY IMPORTANT):
- ALWAYS format your response in MARKDOWN
- Don't Use **bold**
- Don't Use *italics*
- NEVER USE ASTERISKS (*) FOR BOLD OR ITALICS
- Use bullet points or numbered lists for clarity
- Use line breaks to organize your response - DON'T write one giant paragraph
- Start with a friendly greeting or acknowledgment (1-2 sentences)
- Add a line break, then provide your main points
- If listing multiple items/goals, put each on a NEW LINE with a number or emoji
- Add another line break before your closing encouragement
- Make it scannable and easy to read - think text messages, not essays!

Example format:
Hey! That's awesome you're thinking about this! 🎯

Here are my top suggestions:
1. answer 1
2. answer 2
3. answer 3

Answer as their friendly money buddy (NOT as a data report):`;

    // Generate response with retry logic for rate limits
    const result = await withRetry(async () => {
      return await model.generateContent(prompt);
    }, 3, 2000);
    
    const response = await result.response;
    const answer = response.text();

    console.log('[AI Controller] Successfully generated response');

    // Return successful response
    return res.status(200).json({
      success: true,
      answer,
    });

  } catch (error: any) {
    console.error('[AI Controller] Error processing request:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('[AI Controller] Error name:', error.name);
      console.error('[AI Controller] Error message:', error.message);
      console.error('[AI Controller] Error stack:', error.stack);
    }

    // Check for rate limit errors
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('Too Many Requests')) {
      return res.status(429).json({
        success: false,
        error: 'AI service is temporarily busy. Please wait a moment and try again.',
        retryAfter: 30,
      });
    }

    // Return error response
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your question. Please try again.',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : undefined,
    });
  }
};

/**
 * Health check for AI service
 * GET /api/ai/health
 */
export const aiHealthCheck = (_req: Request, res: Response) => {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  
  return res.json({
    success: true,
    status: 'ok',
    service: 'Budgee AI',
    configured: isConfigured,
    message: isConfigured 
      ? 'AI service is ready' 
      : 'AI service is not configured - GEMINI_API_KEY missing',
  });
};
