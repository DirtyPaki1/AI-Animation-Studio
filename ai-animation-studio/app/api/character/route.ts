import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze the animation description and return a single animation type. 
          Choose from: idle, bounce, wave, spin, dance, jump.
          Return only the animation type as a string.`
        },
        {
          role: "user",
          content: `What animation type best matches: "${prompt}"`
        }
      ]
    });

    const animationType = completion.choices[0].message.content?.toLowerCase().trim() || 'idle';

    return NextResponse.json({ animationType });
  } catch (error) {
    console.error('Character API error:', error);
    return NextResponse.json(
      { animationType: 'idle' }
    );
  }
}