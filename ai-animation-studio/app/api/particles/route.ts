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
          content: `You are a particle effects designer. Analyze the description and return a JSON configuration for particle effects.
          Return format: { "color": "#hexcolor", "motion": "float|explode|vortex|pulse", "intensity": numberBetween1-10 }`
        },
        {
          role: "user",
          content: `Create particle configuration for: "${prompt}"`
        }
      ],
      response_format: { type: "json_object" }
    });

    const config = JSON.parse(completion.choices[0].message.content || '{}');

    // Validate and set defaults
    const validatedConfig = {
      color: config.color || '#00ff88',
      motion: config.motion || 'float',
      intensity: Math.min(Math.max(config.intensity || 5, 1), 10)
    };

    return NextResponse.json({ config: validatedConfig });
  } catch (error) {
    console.error('Particles API error:', error);
    return NextResponse.json({
      config: {
        color: '#00ff88',
        motion: 'float',
        intensity: 5
      }
    });
  }
}