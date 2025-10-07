'use server';

/**
 * @fileOverview A flow that analyzes smartphone usage and provides advice.
 *
 * - analyzeUsageAndAdvise - A function that analyzes user's survey responses and provides a summary and advice.
 * - AnalyzeUsageAndAdviseInput - The input type for the analyzeUsageAndAdvise function.
 * - AnalyzeUsageAndAdviseOutput - The return type for the analyzeUsageAndAdvise function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUsageAndAdviseInputSchema = z.object({
  usageData: z.string().describe('A JSON string representing the user\'s answers to smartphone usage questions.'),
  questions: z.string().describe('A JSON string of the questions that were answered.')
});
export type AnalyzeUsageAndAdviseInput = z.infer<typeof AnalyzeUsageAndAdviseInputSchema>;

const AnalyzeUsageAndAdviseOutputSchema = z.object({
  summary: z.string().describe("A personalized summary of the user's smartphone and social media habits in English."),
  advice: z.object({
    english: z.string().describe('Actionable advice for the user in English, presented as a markdown list.'),
    sinhala: z.string().describe('Actionable advice for the user in Sinhala, presented as a markdown list.'),
  }).describe('Actionable advice in both English and Sinhala.'),
});
export type AnalyzeUsageAndAdviseOutput = z.infer<typeof AnalyzeUsageAndAdviseOutputSchema>;

export async function analyzeUsageAndAdvise(input: AnalyzeUsageAndAdviseInput): Promise<AnalyzeUsageAndAdviseOutput> {
  return analyzeUsageAndAdviseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUsageAndAdvisePrompt',
  input: {schema: AnalyzeUsageAndAdviseInputSchema},
  output: {schema: AnalyzeUsageAndAdviseOutputSchema},
  prompt: `You are a digital wellbeing coach. Analyze the following survey responses about a student's smartphone and social media usage.

  The questions were:
  {{{questions}}}

  The user's answers are:
  {{{usageData}}}

  Based on their answers, provide:
  1. A concise, non-judgmental summary of their habits in English.
  2. Offer 3-5 actionable and personalized pieces of advice to help them maintain a healthy digital-life balance. The advice should be encouraging and practical.
  3. Provide the advice in both English and Sinhala.
  4. Format both lists of advice as a markdown list.
`,
});

const analyzeUsageAndAdviseFlow = ai.defineFlow(
  {
    name: 'analyzeUsageAndAdviseFlow',
    inputSchema: AnalyzeUsageAndAdviseInputSchema,
    outputSchema: AnalyzeUsageAndAdviseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
