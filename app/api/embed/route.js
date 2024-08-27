import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
import { createClient } from "@pinecone-database/pinecone";

const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function POST(req) {
    try {
        const review = await req.json();

        // Initialize Pinecone client
        const client = createClient({
            apiKey: process.env.PINECONE_API_KEY,
            environment: process.env.PINECONE_ENVIRONMENT || 'us-west1-gcp'
        });

        // Get the Pinecone index
        const index = client.Index('rag');

        // Embed content using the Generative AI model
        const response = await embedModel.embedContent(JSON.stringify(review));
        const embedding = response['embedding'];

        const processed_data = [
            {
                values: embedding,
                id: review.name,
                metadata: {
                    name: review.name,
                    uni: review.uni,
                    rating: review.rating,
                    reviews: review.reviews,
                }
            }
        ];

        // Upsert data into the index with the specified namespace
        const upsert_response = await index.upsert({
            vectors: processed_data,
            namespace: "ns1", // Specify namespace here
        });

        console.log('success');
        return NextResponse.json({ success: true, upsert_response });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
