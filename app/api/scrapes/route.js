import { NextResponse } from 'next/server'; // Import NextResponse from Next.js for handling responses
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const systemPrompt = "given a html string return a json with this form name: { type: 'STRING' },uni: { type: 'STRING' },rating: { type: 'STRING' },reviews: {type: 'ARRAY',review: {type: 'OBJECT',properties: {course: { type: 'string' },date: { type: 'string' },quality: { type: 'string' },difficulty: { type: 'string' },comment: { type: 'string' },},},},";

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: systemPrompt,
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export async function POST(req) {
  const prompt = await req.text();

  const result = await model.generateContent(prompt);
  const response = result.response;
  
  return response
}

// Export other methods like GET, PUT, DELETE if needed
export async function GET(req) {
  // Handle GET request here, if necessary
  return NextResponse.json({ message: 'GET method is not implemented' });
}
