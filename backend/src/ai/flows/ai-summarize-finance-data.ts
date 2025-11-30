/**
 * @fileOverview An AI agent that summarizes user's financial data.
 *
 * - summarizeFinanceData - A function that handles the summarization process.
 * - SummarizeFinanceDataInput - The input type for the summarizeFinanceData function.
 * - SummarizeFinanceDataOutput - The return type for the summarizeFinanceData function.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const SummarizeFinanceDataInputSchema = z.object({
  income: z.string().describe('The user income information.'),
  expenses: z.string().describe('The user expenses information.'),
  savings: z.string().describe('The user savings information.'),
});
export type SummarizeFinanceDataInput = z.infer<typeof SummarizeFinanceDataInputSchema>;

const SummarizeFinanceDataOutputSchema = z.object({
  summary: z.string().describe('The summary of the user financial data.'),
});
export type SummarizeFinanceDataOutput = z.infer<typeof SummarizeFinanceDataOutputSchema>;

export async function summarizeFinanceData(input: SummarizeFinanceDataInput): Promise<SummarizeFinanceDataOutput> {
  return summarizeFinanceDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFinanceDataPrompt',
  input: {schema: SummarizeFinanceDataInputSchema},
  output: {schema: SummarizeFinanceDataOutputSchema},
  prompt: `You are Budgee, an AI assistant that provides summaries of user's financial data.

  Summarize the following financial data:

  Income: {{{income}}}
  Expenses: {{{expenses}}}
  Savings: {{{savings}}}

  Provide a concise and informative summary.
  `,
});

const summarizeFinanceDataFlow = ai.defineFlow(
  {
    name: 'summarizeFinanceDataFlow',
    inputSchema: SummarizeFinanceDataInputSchema,
    outputSchema: SummarizeFinanceDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
