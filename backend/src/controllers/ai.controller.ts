import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Controller for Budgee Chatbot
 * Handles finance-related questions using Google Gemini API
 */

// Initialize Google Gemini API
let genAI: GoogleGenerativeAI | null = null;

// Use Gemini 2.0 Flash model
const GEMINI_MODEL = 'gemini-2.5-flash';

// Simple in-memory cache to reduce API calls
const responseCache = new Map<string, { answer: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

const initializeAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a cache key from the question and financial data summary
const generateCacheKey = (question: string, totalIncome: number, totalExpenses: number): string => {
  const normalizedQuestion = question.toLowerCase().trim();
  return `${normalizedQuestion}_${Math.round(totalIncome)}_${Math.round(totalExpenses)}`;
};

// Retry wrapper for API calls with better exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429) or resource exhausted
      const isRateLimitError = error?.status === 429 || 
        error?.message?.includes('429') || 
        error?.message?.includes('quota') ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('Too Many Requests');
      
      if (isRateLimitError && attempt < maxRetries - 1) {
        const waitTime = baseDelay * Math.pow(2, attempt) + Math.random() * 1000; // Add jitter
        console.log(`[AI Controller] Rate limited, waiting ${Math.round(waitTime)}ms before retry ${attempt + 1}/${maxRetries}`);
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

    // Check cache first for similar questions
    const cacheKey = generateCacheKey(question, financialData.totalIncome, financialData.totalExpenses);
    const cached = responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('[AI Controller] Returning cached response for:', question);
      return res.status(200).json({
        success: true,
        answer: cached.answer,
        cached: true,
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
    const prompt = `You are Budgee — a warm, supportive money buddy who talks like a close friend.

The financial data below is FOR REFERENCE ONLY. NEVER repeat or reveal it.
${financialContext}

User Question: ${question}

How to respond:
- Answer their question directly and simply
- Talk casually, like texting a friend (use contractions)
- Keep energy positive, supportive, and encouraging
- Use emojis sometimes but lightly
- Mention numbers ONLY if they help answer the question
- Give ONE practical tip they can act on
- Acknowledge their feelings about money
- Use friendly phrases like: Hey!, Nice!, You got this!, Here’s the thing…
- No jargon, no corporate tone
- If they say hi/hey, just greet and ask how you can help with their finances
- If they ask something casual, reply casually (don’t force financial data)

Formatting rules:
- Use MARKDOWN
- No bold, no italics, no asterisks
- Use bullet points or numbers
- Use line breaks for clarity
- Start with a friendly greeting (1–2 sentences)
- Put each item on its own line
- End with positive encouragement
- Keep it short and easy to scan

Example:
Hey! Love that you asked about this!

Here's what I suggest:
1. answer 1
2. answer 2

You got this!`;

    // Generate response with retry logic for rate limits
    const result = await withRetry(async () => {
      return await model.generateContent(prompt);
    }, 3, 2000);
    
    const response = await result.response;
    const answer = response.text();

    console.log('[AI Controller] Successfully generated response');

    // Cache the response for future similar questions
    responseCache.set(cacheKey, { answer, timestamp: Date.now() });
    
    // Clean up old cache entries periodically
    if (responseCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          responseCache.delete(key);
        }
      }
    }

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
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('Too Many Requests') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
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
