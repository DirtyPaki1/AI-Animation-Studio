import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { prompt, type } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert animation designer. Create detailed animation concepts based on user prompts. 
          Return a JSON object with: title, description, keyframes (array of strings), duration (in seconds), and easing function.`
        },
        {
          role: "user",
          content: `Create an animation concept for: ${prompt}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const concept = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({ concept });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate animation concept' },
      { status: 500 }
    );
  }
}