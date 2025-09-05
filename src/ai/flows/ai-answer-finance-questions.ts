'use server';
/**
 * @fileOverview An AI agent to answer user questions about their finances.
 *
 * - answerFinanceQuestion - A function that answers the user's question about their finances.
 * - AnswerFinanceQuestionInput - The input type for the answerFinanceQuestion function.
 * - AnswerFinanceQuestionOutput - The return type for the answerFinanceQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerFinanceQuestionInputSchema = z.object({
  question: z.string().describe('The user question about their finances.'),
});
export type AnswerFinanceQuestionInput = z.infer<typeof AnswerFinanceQuestionInputSchema>;

const AnswerFinanceQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type AnswerFinanceQuestionOutput = z.infer<typeof AnswerFinanceQuestionOutputSchema>;

export async function answerFinanceQuestion(input: AnswerFinanceQuestionInput): Promise<AnswerFinanceQuestionOutput> {
  return answerFinanceQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerFinanceQuestionPrompt',
  input: {schema: AnswerFinanceQuestionInputSchema},
  output: {schema: AnswerFinanceQuestionOutputSchema},
  prompt: `You are Budgee, an AI assistant that answers user questions about their finances. Use the context provided to answer the question to the best of your ability. If the answer is not in the context, respond that you are unable to answer the question.

Question: {{{question}}}`,
});

const answerFinanceQuestionFlow = ai.defineFlow(
  {
    name: 'answerFinanceQuestionFlow',
    inputSchema: AnswerFinanceQuestionInputSchema,
    outputSchema: AnswerFinanceQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
