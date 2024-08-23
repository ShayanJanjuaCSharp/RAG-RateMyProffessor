import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
import { Pinecone, index, query } from "@pinecone-database/pinecone";

const systemPrompt='You are a rate my professor agent to help students find classes, that takes in user questions and answers them. For every user question, the top 3 professors that match the user question are returned. Use them to answer the question if needed.'

const model = genAI.getGenerativeModel({model:'gemini-1.5-flash',systemInstruction: systemPrompt});
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004"});


export async function POST(req){
    const data = await req.json()
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    })
    const index = pc.index('rag').namespace('ns1')
    const text = data[data.length - 1].content
    const response = await embedModel.embedContent(text);
    const embedding = response['embedding']
    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding.values
    })

    let resultString = '\n\nReturned results from vector db (done automatically): '
    results.matches.forEach(match => {
        resultString+=`\n
        Professor:${match.id}
        Review:${match.metadata.review}
        Subject:${match.metadata.subject}
        Stars:${match.metadata.stars}
        \n\n
        `
    });

    const lastMessage = data[data.length - 1]
    const lastMcontent = lastMessage.content + resultString
    const lastdata = data.slice(0,data.length-2)
    const chat = model.startChat({
        history: [
          ...lastdata, 
        ],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });
      const result = await chat.sendMessageStream(lastMcontent);

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of result.stream) {
              const content = chunk.text();
              if (content) {
                console.log(content);
                controller.enqueue(encoder.encode(content));
              }
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        }
      })
      return new NextResponse(stream);
}