
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-1.5-flash';

console.log('Testing Gemini API...');
console.log('API Key present:', !!API_KEY);
console.log('Model:', MODEL_NAME);

async function test() {
  if (!API_KEY) {
    console.error('No API Key found');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    
    for (const modelName of modelsToTry) {
        console.log(`\nTrying model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = 'Hello';
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log(`SUCCESS with ${modelName}:`, response.text());
            break; 
        } catch (e: any) {
            console.log(`FAILED with ${modelName}: ${e.message}`);
        }
    }

  } catch (error: any) {
    console.error('Error:', error);
  }
}

test();
