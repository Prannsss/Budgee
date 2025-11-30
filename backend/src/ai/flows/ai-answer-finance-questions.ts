/**
 * @fileOverview An AI agent to answer user questions about their finances.
 *
 * - answerFinanceQuestion - A function that answers the user's question about their finances.
 * - AnswerFinanceQuestionInput - The input type for the answerFinanceQuestion function.
 * - AnswerFinanceQuestionOutput - The return type for the answerFinanceQuestion function.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const AnswerFinanceQuestionInputSchema = z.object({
  question: z.string().describe('The user question about their finances.'),
  userId: z.string().describe('The user ID.'),
  financialData: z.object({
    totalIncome: z.number(),
    totalExpenses: z.number(),
    savings: z.number(),
    accounts: z.array(z.object({
      name: z.string(),
      type: z.string(),
      balance: z.number(),
      lastFour: z.string(),
    })),
    recentTransactions: z.array(z.object({
      date: z.string(),
      description: z.string(),
      amount: z.number(),
      category: z.string(),
    })),
    categoryTotals: z.record(z.string(), z.number()),
  }).describe('The user\'s financial data'),
});
export type AnswerFinanceQuestionInput = z.infer<typeof AnswerFinanceQuestionInputSchema>;

const AnswerFinanceQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type AnswerFinanceQuestionOutput = z.infer<typeof AnswerFinanceQuestionOutputSchema>;

export async function answerFinanceQuestion(input: AnswerFinanceQuestionInput): Promise<AnswerFinanceQuestionOutput> {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      const errorMsg = 'GEMINI_API_KEY is not configured in environment variables';
      console.error('[Budgee AI Error]', errorMsg);
      console.error('[Budgee AI] Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('GENAI')));
      throw new Error('AI service is not properly configured. Please add GEMINI_API_KEY to your environment variables.');
    }
    
    console.log('[Budgee AI] Processing question for user:', input.userId);
    return await answerFinanceQuestionFlow(input);
  } catch (error) {
    console.error('[Budgee AI] Error in answerFinanceQuestion:', error);
    if (error instanceof Error) {
      console.error('[Budgee AI] Error message:', error.message);
      console.error('[Budgee AI] Error stack:', error.stack);
    }
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'answerFinanceQuestionPrompt',
  input: {
    schema: z.object({
      question: z.string(),
      financialContext: z.string(),
    }),
  },
  output: {schema: AnswerFinanceQuestionOutputSchema},
  prompt: `You are Budgee, a friendly and supportive financial buddy! Talk to the user like a close friend who's good with money - be warm, encouraging, and genuinely helpful.

IMPORTANT: The financial data below is FOR YOUR REFERENCE ONLY. DO NOT include this raw data in your response. Use it to understand their situation and answer their question naturally.

Financial Data (REFERENCE ONLY - DO NOT REPEAT THIS):
{{{financialContext}}}

User Question: {{{question}}}

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

Answer as their friendly money buddy (NOT as a data report):`,
});

const answerFinanceQuestionFlow = ai.defineFlow(
  {
    name: 'answerFinanceQuestionFlow',
    inputSchema: AnswerFinanceQuestionInputSchema,
    outputSchema: AnswerFinanceQuestionOutputSchema,
  },
  async input => {
    try {
      const { financialData } = input;

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

      console.log('[Budgee AI] Calling Gemini API...');
      const {output} = await prompt({
        question: input.question,
        financialContext,
      });
      
      console.log('[Budgee AI] Successfully received response from Gemini');
      return output!;
    } catch (error) {
      console.error('[Budgee AI] Error in flow execution:', error);
      throw error;
    }
  }
);

