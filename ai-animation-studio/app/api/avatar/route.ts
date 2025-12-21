import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Check if OpenAI API key is available
const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
let openai: any = null;

if (hasOpenAIKey) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
    console.log('OpenAI TTS enabled');
  } catch (error) {
    console.error('OpenAI initialization failed:', error);
  }
} else {
  console.log('OpenAI API key not found. Using browser fallback only.');
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // Limit text length
    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 1000 characters allowed.' },
        { status: 400 }
      );
    }

    // If OpenAI is available, use it
    if (openai) {
      try {
        console.log('Generating speech with OpenAI TTS');
        const mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: "alloy",
          input: text,
          speed: 1.0,
        });

        const buffer = await mp3.arrayBuffer();
        const base64Audio = Buffer.from(buffer).toString('base64');
        const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

        return NextResponse.json({ 
          audioUrl,
          source: 'openai-tts',
          message: 'Speech generated successfully with OpenAI'
        });
      } catch (openaiError: any) {
        console.error('OpenAI TTS failed:', openaiError);
        // Fall through to browser synthesis message
      }
    }

    // If OpenAI is not available or failed, return message to use browser fallback
    return NextResponse.json({
      message: 'OpenAI TTS not available. Please use browser speech synthesis.',
      source: 'browser-fallback',
      text: text
    });

  } catch (error: any) {
    console.error('Avatar API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Request processing failed',
        message: error?.message || 'Unknown error occurred',
        source: 'error'
      },
      { status: 500 }
    );
  }
}