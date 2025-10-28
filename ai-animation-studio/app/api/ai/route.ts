import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Valid easing functions for Framer Motion
const VALID_EASING_FUNCTIONS = [
  'linear', 'easeIn', 'easeOut', 'easeInOut', 
  'circIn', 'circOut', 'circInOut', 
  'backIn', 'backOut', 'backInOut', 'anticipate'
];

// Common animation templates
const ANIMATION_TEMPLATES = {
  bounce: {
    keyframes: [
      'Object at highest point, ready to fall',
      'Object falling with increasing speed',
      'Object hitting surface with compression',
      'Object rebounding with decreasing speed',
      'Object reaching peak height again'
    ],
    duration: 1.5,
    easing: 'easeInOut'
  },
  float: {
    keyframes: [
      'Object at resting position',
      'Object beginning to rise slowly',
      'Object at peak height, slight rotation',
      'Object starting to descend',
      'Object returning to start position'
    ],
    duration: 3,
    easing: 'easeInOut'
  },
  spin: {
    keyframes: [
      'Starting rotation at 0 degrees',
      'Quarter rotation at 90 degrees',
      'Half rotation at 180 degrees',
      'Three-quarters rotation at 270 degrees',
      'Full rotation at 360 degrees'
    ],
    duration: 2,
    easing: 'linear'
  },
  pulse: {
    keyframes: [
      'Normal size and appearance',
      'Beginning to grow and brighten',
      'Maximum size and brightness',
      'Starting to shrink and fade',
      'Back to normal state'
    ],
    duration: 2,
    easing: 'easeInOut'
  }
};

export async function POST(request: Request) {
  try {
    const { prompt, type } = await request.json();

    // First, try to match with common animation patterns
    const promptLower = prompt.toLowerCase();
    let templateMatch = null;

    if (promptLower.includes('bounce') || promptLower.includes('ball')) {
      templateMatch = ANIMATION_TEMPLATES.bounce;
    } else if (promptLower.includes('float') || promptLower.includes('hover') || promptLower.includes('fly')) {
      templateMatch = ANIMATION_TEMPLATES.float;
    } else if (promptLower.includes('spin') || promptLower.includes('rotate') || promptLower.includes('turn')) {
      templateMatch = ANIMATION_TEMPLATES.spin;
    } else if (promptLower.includes('pulse') || promptLower.includes('glow') || promptLower.includes('beat')) {
      templateMatch = ANIMATION_TEMPLATES.pulse;
    }

    if (templateMatch) {
      // Use template for reliable results
      const concept = {
        title: `Animation: ${prompt.substring(0, 20)}...`,
        description: `A ${Object.keys(ANIMATION_TEMPLATES).find(key => ANIMATION_TEMPLATES[key as keyof typeof ANIMATION_TEMPLATES] === templateMatch)} animation based on: ${prompt}`,
        keyframes: templateMatch.keyframes,
        duration: templateMatch.duration,
        easing: templateMatch.easing
      };
      return NextResponse.json({ concept });
    }

    // Fall back to AI for custom animations
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Create an animation concept. Return JSON with: title, description, keyframes (array of 3-5 strings), duration (1-5 seconds), easing (only use: ${VALID_EASING_FUNCTIONS.join(', ')}).`
        },
        {
          role: "user",
          content: `Create animation for: "${prompt}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content;
    let concept;
    
    try {
      // Try to parse JSON response
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        concept = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      // If parsing fails, create concept from text
      concept = createConceptFromText(content || '', prompt);
    }

    // Validate and ensure all fields
    const validatedConcept = {
      title: concept.title || `Animation: ${prompt.substring(0, 20)}...`,
      description: concept.description || `An animation based on: ${prompt}`,
      keyframes: Array.isArray(concept.keyframes) ? concept.keyframes : ['Start', 'Middle', 'End'],
      duration: Math.max(0.5, Math.min(concept.duration || 2, 10)),
      easing: VALID_EASING_FUNCTIONS.includes(concept.easing) ? concept.easing : 'easeInOut'
    };

    return NextResponse.json({ concept: validatedConcept });

  } catch (error) {
    console.error('AI API error:', error);
    // Return a reliable fallback concept
    return NextResponse.json({
      concept: {
        title: "Animation Concept",
        description: `An animation based on: ${(await request.json()).prompt}`,
        keyframes: ["Starting position", "Main action", "Ending position"],
        duration: 2,
        easing: "easeInOut"
      }
    });
  }
}

function createConceptFromText(content: string, prompt: string) {
  // Extract information from text response
  const lines = content.split('\n').filter(line => line.trim());
  
  return {
    title: lines[0]?.replace(/^#+\s*/, '') || `Animation: ${prompt}`,
    description: lines.find(line => line.length > 20 && line.length < 100) || `Animation based on: ${prompt}`,
    keyframes: lines.filter(line => line.includes('-') || line.includes('•')).map(line => line.replace(/[•\-]\s*/, '')) || ['Start', 'Middle', 'End'],
    duration: 2,
    easing: 'easeInOut'
  };
}