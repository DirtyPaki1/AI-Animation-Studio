import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
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

// Character templates
const CHARACTER_TEMPLATES = {
  warrior: {
    name: 'Brave Warrior',
    description: 'A strong and courageous fighter ready for battle',
    physicalFeatures: {
      height: 'Tall',
      weight: 'Heavy',
      bodyType: 'Muscular',
      hair: 'Short brown',
      eyes: 'Determined brown',
      skin: 'Tanned',
      distinctiveFeatures: ['Scar on cheek', 'Broad shoulders', 'Battle-ready stance']
    },
    personality: {
      traits: ['Brave', 'Strong', 'Loyal', 'Protective'],
      style: 'Armor and weapons',
      posture: 'Confident and ready'
    },
    animationStyle: 'powerful'
  },
  wizard: {
    name: 'Ancient Wizard',
    description: 'A wise magic user with arcane knowledge',
    physicalFeatures: {
      height: 'Tall',
      weight: 'Slender',
      bodyType: 'Thin',
      hair: 'Long white beard',
      eyes: 'Piercing blue',
      skin: 'Pale',
      distinctiveFeatures: ['Staff', 'Robe', 'Wise expression', 'Long fingers']
    },
    personality: {
      traits: ['Wise', 'Patient', 'Knowledgeable', 'Mysterious'],
      style: 'Robes and arcane symbols',
      posture: 'Thoughtful and deliberate'
    },
    animationStyle: 'magical'
  },
  elf: {
    name: 'Ethereal Elf',
    description: 'A graceful magical being from ancient forests',
    physicalFeatures: {
      height: 'Tall and slender',
      weight: 'Light',
      bodyType: 'Slim',
      hair: 'Long silver',
      eyes: 'Bright green',
      skin: 'Fair',
      distinctiveFeatures: ['Pointed ears', 'Graceful movements', 'Nature affinity']
    },
    personality: {
      traits: ['Graceful', 'Wise', 'Nature-loving', 'Mysterious'],
      style: 'Nature-inspired clothing',
      posture: 'Elegant and poised'
    },
    animationStyle: 'graceful'
  }
};

// Particle templates
const PARTICLE_TEMPLATES = {
  snow: { color: '#ffffff', motion: 'rise', intensity: 5 },
  fire: { color: '#ff4400', motion: 'rise', intensity: 6 },
  magic: { color: '#8844ff', motion: 'float', intensity: 4 },
  energy: { color: '#00ffff', motion: 'orbit', intensity: 7 },
  galaxy: { color: '#8b5cf6', motion: 'vortex', intensity: 6 },
  sparkle: { color: '#ffff00', motion: 'float', intensity: 4 }
};

export async function POST(request: Request) {
  try {
    const { prompt, type, text } = await request.json();

    // Handle different request types
    switch (type) {
      case 'animation':
        return handleAnimationRequest(prompt);
      
      case 'character-description':
        return handleCharacterRequest(prompt);
      
      case 'character-animation':
        return handleCharacterAnimationRequest(prompt);
      
      case 'particles':
        return handleParticlesRequest(prompt);
      
      case 'speech':
        return handleSpeechRequest(text);
      
      default:
        // Auto-detect type based on content
        return handleAutoDetectRequest(prompt, text);
    }

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Handle animation concept requests
async function handleAnimationRequest(prompt: string) {
  const promptLower = prompt.toLowerCase();
  let templateMatch = null;

  // Match with common animation patterns
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
    const concept = {
      title: `Animation: ${prompt.substring(0, 20)}...`,
      description: `A ${Object.keys(ANIMATION_TEMPLATES).find(key => ANIMATION_TEMPLATES[key as keyof typeof ANIMATION_TEMPLATES] === templateMatch)} animation based on: ${prompt}`,
      keyframes: templateMatch.keyframes,
      duration: templateMatch.duration,
      easing: templateMatch.easing
    };
    return NextResponse.json({ concept });
  }

  // Use AI for custom animations
  try {
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
    let concept = parseAnimationResponse(content, prompt);
    
    const validatedConcept = {
      title: concept.title || `Animation: ${prompt.substring(0, 20)}...`,
      description: concept.description || `An animation based on: ${prompt}`,
      keyframes: Array.isArray(concept.keyframes) ? concept.keyframes : ['Start', 'Middle', 'End'],
      duration: Math.max(0.5, Math.min(concept.duration || 2, 10)),
      easing: VALID_EASING_FUNCTIONS.includes(concept.easing) ? concept.easing : 'easeInOut'
    };

    return NextResponse.json({ concept: validatedConcept });

  } catch (error) {
    console.error('Animation AI error:', error);
    return NextResponse.json({
      concept: {
        title: "Animation Concept",
        description: `An animation based on: ${prompt}`,
        keyframes: ["Starting position", "Main action", "Ending position"],
        duration: 2,
        easing: "easeInOut"
      }
    });
  }
}

// Handle character description requests
async function handleCharacterRequest(prompt: string) {
  const promptLower = prompt.toLowerCase();
  let templateMatch = null;

  // Match with character templates
  if (promptLower.includes('warrior') || promptLower.includes('fighter') || promptLower.includes('knight')) {
    templateMatch = CHARACTER_TEMPLATES.warrior;
  } else if (promptLower.includes('wizard') || promptLower.includes('mage') || promptLower.includes('sorcerer')) {
    templateMatch = CHARACTER_TEMPLATES.wizard;
  } else if (promptLower.includes('elf') || promptLower.includes('fairy') || promptLower.includes('magical')) {
    templateMatch = CHARACTER_TEMPLATES.elf;
  }

  if (templateMatch) {
    return NextResponse.json({ character: templateMatch });
  }

  // Use AI for custom characters
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Create a detailed character description. Return JSON with:
          - name: character name
          - description: brief character description
          - physicalFeatures: object with height, weight, bodyType, hair, eyes, skin, distinctiveFeatures (array)
          - personality: object with traits (array), style, posture
          - animationStyle: string describing movement style`
        },
        {
          role: "user",
          content: `Create a character based on: "${prompt}"`
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const content = completion.choices[0].message.content;
    let character = parseCharacterResponse(content, prompt);
    
    return NextResponse.json({ character });

  } catch (error) {
    console.error('Character AI error:', error);
    return NextResponse.json({
      character: {
        name: "Generated Character",
        description: `A character based on: ${prompt}`,
        physicalFeatures: {
          height: "Average",
          weight: "Medium",
          bodyType: "Average",
          hair: "Brown",
          eyes: "Brown",
          skin: "Light",
          distinctiveFeatures: ["None specified"]
        },
        personality: {
          traits: ["Adaptable"],
          style: "Casual",
          posture: "Neutral"
        },
        animationStyle: "neutral"
      }
    });
  }
}

// Handle character animation type requests
async function handleCharacterAnimationRequest(prompt: string) {
  const promptLower = prompt.toLowerCase();
  
  // Simple keyword matching for animation types
  if (promptLower.includes('walk') || promptLower.includes('move')) {
    return NextResponse.json({ animationType: 'walk' });
  } else if (promptLower.includes('run') || promptLower.includes('sprint')) {
    return NextResponse.json({ animationType: 'run' });
  } else if (promptLower.includes('jump') || promptLower.includes('leap')) {
    return NextResponse.json({ animationType: 'jump' });
  } else if (promptLower.includes('dance') || promptLower.includes('party')) {
    return NextResponse.json({ animationType: 'dance' });
  } else if (promptLower.includes('attack') || promptLower.includes('fight')) {
    return NextResponse.json({ animationType: 'attack' });
  } else if (promptLower.includes('cast') || promptLower.includes('spell') || promptLower.includes('magic')) {
    return NextResponse.json({ animationType: 'castSpell' });
  } else if (promptLower.includes('greet') || promptLower.includes('hello') || promptLower.includes('wave')) {
    return NextResponse.json({ animationType: 'greet' });
  }

  // Use AI for complex animation detection
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze the animation description and return ONLY one word - the animation type. 
          Choose from: idle, walk, run, jump, dance, attack, castSpell, greet.
          Return only the single word, nothing else.`
        },
        {
          role: "user",
          content: `What animation type best matches: "${prompt}"? Return only one word.`
        }
      ],
      max_tokens: 10,
      temperature: 0.3,
    });

    const animationType = completion.choices[0].message.content?.toLowerCase().trim() || 'idle';
    const validTypes = ['idle', 'walk', 'run', 'jump', 'dance', 'attack', 'castSpell', 'greet'];
    const finalAnimationType = validTypes.includes(animationType) ? animationType : 'idle';

    return NextResponse.json({ animationType: finalAnimationType });

  } catch (error) {
    console.error('Character animation AI error:', error);
    return NextResponse.json({ animationType: 'idle' });
  }
}

// Handle particle configuration requests
async function handleParticlesRequest(prompt: string) {
  const promptLower = prompt.toLowerCase();
  
  // Match with particle templates
  if (promptLower.includes('snow') || promptLower.includes('winter') || promptLower.includes('ice')) {
    return NextResponse.json({ config: PARTICLE_TEMPLATES.snow });
  } else if (promptLower.includes('fire') || promptLower.includes('flame') || promptLower.includes('burn')) {
    return NextResponse.json({ config: PARTICLE_TEMPLATES.fire });
  } else if (promptLower.includes('magic') || promptLower.includes('fairy') || promptLower.includes('sparkle')) {
    return NextResponse.json({ config: PARTICLE_TEMPLATES.magic });
  } else if (promptLower.includes('energy') || promptLower.includes('electric') || promptLower.includes('power')) {
    return NextResponse.json({ config: PARTICLE_TEMPLATES.energy });
  } else if (promptLower.includes('galaxy') || promptLower.includes('space') || promptLower.includes('cosmic')) {
    return NextResponse.json({ config: PARTICLE_TEMPLATES.galaxy });
  } else if (promptLower.includes('sparkle') || promptLower.includes('glitter') || promptLower.includes('shiny')) {
    return NextResponse.json({ config: PARTICLE_TEMPLATES.sparkle });
  }

  // Use AI for custom particle configurations
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze the description and return a JSON configuration for particle effects.
          Return format: { "color": "#hexcolor", "motion": "float|explode|vortex|pulse|rise|orbit", "intensity": numberBetween1-10 }
          Return ONLY valid JSON, no other text.`
        },
        {
          role: "user",
          content: `Create particle configuration for: "${prompt}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = completion.choices[0].message.content;
    let config = parseParticleResponse(content);
    
    return NextResponse.json({ config });

  } catch (error) {
    console.error('Particles AI error:', error);
    return NextResponse.json({
      config: {
        color: '#00ff88',
        motion: 'float',
        intensity: 5
      }
    });
  }
}

// Handle text-to-speech requests
async function handleSpeechRequest(text: string) {
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

  try {
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
      message: 'Speech generated successfully'
    });

  } catch (error: any) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate speech',
        message: error?.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Auto-detect request type based on content
async function handleAutoDetectRequest(prompt: string, text?: string) {
  if (text) {
    return handleSpeechRequest(text);
  }

  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('character') || promptLower.includes('person') || promptLower.includes('warrior') || promptLower.includes('wizard')) {
    return handleCharacterRequest(prompt);
  } else if (promptLower.includes('particle') || promptLower.includes('effect') || promptLower.includes('spark') || promptLower.includes('snow') || promptLower.includes('fire')) {
    return handleParticlesRequest(prompt);
  } else {
    return handleAnimationRequest(prompt);
  }
}

// Helper functions for parsing responses
function parseAnimationResponse(content: string | null, prompt: string) {
  if (!content) {
    return createFallbackAnimation(prompt);
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : createFallbackAnimation(prompt);
  } catch (e) {
    return createFallbackAnimation(prompt);
  }
}

function parseCharacterResponse(content: string | null, prompt: string) {
  if (!content) {
    return createFallbackCharacter(prompt);
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : createFallbackCharacter(prompt);
  } catch (e) {
    return createFallbackCharacter(prompt);
  }
}

function parseParticleResponse(content: string | null) {
  const defaultConfig = { color: '#00ff88', motion: 'float', intensity: 5 };
  
  if (!content) {
    return defaultConfig;
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const config = jsonMatch ? JSON.parse(jsonMatch[0]) : defaultConfig;
    
    // Validate config
    return {
      color: config.color && isValidColor(config.color) ? config.color : defaultConfig.color,
      motion: config.motion && ['float', 'explode', 'vortex', 'pulse', 'rise', 'orbit'].includes(config.motion) ? config.motion : defaultConfig.motion,
      intensity: Math.min(Math.max(parseInt(config.intensity) || defaultConfig.intensity, 1), 10)
    };
  } catch (e) {
    return defaultConfig;
  }
}

function createFallbackAnimation(prompt: string) {
  return {
    title: "Animation Concept",
    description: `An animation based on: ${prompt}`,
    keyframes: ["Starting position", "Main action", "Ending position"],
    duration: 2,
    easing: "easeInOut"
  };
}

function createFallbackCharacter(prompt: string) {
  return {
    name: "Generated Character",
    description: `A character based on: ${prompt}`,
    physicalFeatures: {
      height: "Average",
      weight: "Medium",
      bodyType: "Average",
      hair: "Brown",
      eyes: "Brown",
      skin: "Light",
      distinctiveFeatures: ["None specified"]
    },
    personality: {
      traits: ["Adaptable"],
      style: "Casual",
      posture: "Neutral"
    },
    animationStyle: "neutral"
  };
}

function isValidColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}