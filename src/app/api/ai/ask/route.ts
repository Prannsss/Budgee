import { NextRequest, NextResponse } from 'next/server';
import { answerFinanceQuestion, type AnswerFinanceQuestionInput } from '@/ai/flows/ai-answer-finance-questions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/ask
 * 
 * Handles AI question answering for authenticated users.
 * This API route acts as a server-side proxy for Genkit AI calls.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.question || typeof body.question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.userId || typeof body.userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    if (!body.financialData || typeof body.financialData !== 'object') {
      return NextResponse.json(
        { error: 'Financial data is required' },
        { status: 400 }
      );
    }

    // Check if API key is configured (server-side only)
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error('[API /ai/ask] GOOGLE_GENAI_API_KEY is not configured');
      console.error('[API /ai/ask] Available env vars:', Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('GENAI')));
      
      return NextResponse.json(
        { error: 'AI service is not properly configured. Please contact support.' },
        { status: 503 }
      );
    }

    console.log('[API /ai/ask] Processing question for user:', body.userId);
    console.log('[API /ai/ask] Question:', body.question);

    // Prepare input for the AI function
    const input: AnswerFinanceQuestionInput = {
      question: body.question,
      userId: body.userId,
      financialData: body.financialData,
    };

    // Call the server action
    const result = await answerFinanceQuestion(input);
    
    console.log('[API /ai/ask] Successfully generated response');
    
    // Return successful response
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('[API /ai/ask] Error processing request:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('[API /ai/ask] Error name:', error.name);
      console.error('[API /ai/ask] Error message:', error.message);
      console.error('[API /ai/ask] Error stack:', error.stack);
    }

    // Return generic error to client
    return NextResponse.json(
      { 
        error: 'An error occurred while processing your question. Please try again.',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/ask
 * 
 * Health check endpoint
 */
export async function GET() {
  const isConfigured = !!process.env.GOOGLE_GENAI_API_KEY;
  
  return NextResponse.json({
    status: 'ok',
    service: 'Budgee AI',
    configured: isConfigured,
    message: isConfigured 
      ? 'AI service is ready' 
      : 'AI service is not configured - GOOGLE_GENAI_API_KEY missing'
  });
}
