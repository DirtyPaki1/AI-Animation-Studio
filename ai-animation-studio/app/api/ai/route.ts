import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, type, style = 'fantasy' } = await request.json();

    console.log('AI API Request:', { type, prompt });

    // Handle different request types
    switch (type) {
      case 'character-description':
        const characterData = generateCharacterData(prompt, style);
        return NextResponse.json({ character: characterData });

      case 'character-image':
        // Redirect to image generation endpoint
        const imageResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, style })
        });
        return imageResponse;

      case 'character-animation':
        const sceneData = generateSceneData(prompt);
        return NextResponse.json({ scene: sceneData });

      case 'animation':
        const animationConcept = generateAnimationConcept(prompt);
        return NextResponse.json({ concept: animationConcept });

      case 'particles':
        const particleConfig = generateParticleConfig(prompt);
        return NextResponse.json({ config: particleConfig });

      case 'speech':
        const speechData = await generateSpeech(prompt);
        return NextResponse.json(speechData);

      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in AI API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper functions
function generateCharacterData(prompt: string, style: string) {
  const characterType = extractCharacterType(prompt);
  
  return {
    name: generateCharacterName(prompt),
    description: `A ${style} ${characterType} character ready for adventure`,
    physicalFeatures: {
      height: getRandomHeight(),
      weight: getRandomWeight(),
      bodyType: getRandomBodyType(),
      hair: extractHairColor(prompt),
      eyes: extractEyeColor(prompt),
      skin: getRandomSkinTone(),
      distinctiveFeatures: getDistinctiveFeatures(characterType)
    },
    personality: {
      traits: getPersonalityTraits(characterType),
      style: `${style} style`,
      posture: getCharacterPosture(characterType)
    },
    animationStyle: getAnimationStyle(characterType)
  };
}

function generateSceneData(prompt: string) {
  return {
    description: `A dynamic scene featuring: ${prompt}`,
    environment: getRandomEnvironment(),
    mood: getRandomMood(),
    actions: ['idle', 'walk', 'interact', 'battle'],
    characters: []
  };
}

function generateAnimationConcept(prompt: string) {
  return {
    title: `Animation: ${prompt.substring(0, 30)}...`,
    description: `An animated sequence showing ${prompt}`,
    keyframes: [
      'Starting position',
      'Action buildup',
      'Main movement',
      'Action completion',
      'Return to rest'
    ],
    duration: 2,
    easing: 'easeInOut'
  };
}

function generateParticleConfig(prompt: string) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  const motions = ['rise', 'fall', 'float', 'orbit', 'vortex', 'explode'];
  
  return {
    color: colors[Math.floor(Math.random() * colors.length)],
    motion: motions[Math.floor(Math.random() * motions.length)],
    intensity: Math.floor(Math.random() * 5) + 3
  };
}

async function generateSpeech(text: string) {
  // For now, return a placeholder
  // In a real implementation, you'd integrate with OpenAI TTS or similar
  return {
    audioUrl: null,
    text: text,
    note: 'Speech generation would require OpenAI TTS API setup'
  };
}

// Existing helper functions
function extractCharacterType(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('pirate')) return 'pirate';
  if (promptLower.includes('wizard') || promptLower.includes('mage')) return 'wizard';
  if (promptLower.includes('knight') || promptLower.includes('warrior')) return 'knight';
  if (promptLower.includes('ninja') || promptLower.includes('assassin')) return 'ninja';
  if (promptLower.includes('elf')) return 'elf';
  if (promptLower.includes('dwarf')) return 'dwarf';
  return 'adventurer';
}

function generateCharacterName(prompt: string): string {
  const names: { [key: string]: string[] } = {
    pirate: ['Captain Redbeard', 'Blackfin Morgan', 'Sea Wolf Jack'],
    wizard: ['Eldrin the Wise', 'Mystic Alatar', 'Arcane Zephyr'],
    knight: ['Sir Gideon', 'Lady Isolde', 'Valiant Marcus'],
    ninja: ['Shadow Kaito', 'Silent Hana', 'Ghost Walker Ren'],
    elf: ['Aelar Swiftwind', 'Lyra Moonlight', 'Thalanor Greenleaf'],
    dwarf: ['Thrain Ironfist', 'Borin Stonehammer', 'Fargrim Goldseeker']
  };
  
  const type = extractCharacterType(prompt);
  return names[type]?.[Math.floor(Math.random() * names[type].length)] || 'Brave Hero';
}

function getRandomHeight(): string {
  const heights = ['Short', 'Average', 'Tall', 'Very Tall'];
  return heights[Math.floor(Math.random() * heights.length)];
}

function getRandomWeight(): string {
  const weights = ['Light', 'Average', 'Heavy', 'Powerful'];
  return weights[Math.floor(Math.random() * weights.length)];
}

function getRandomBodyType(): string {
  const bodyTypes = ['Slim', 'Athletic', 'Muscular', 'Stocky', 'Curvy'];
  return bodyTypes[Math.floor(Math.random() * bodyTypes.length)];
}

function extractHairColor(prompt: string): string {
  const colors = ['Blonde', 'Brunette', 'Black', 'Red', 'Silver', 'White', 'Blue', 'Purple'];
  const found = colors.find(color => prompt.toLowerCase().includes(color.toLowerCase()));
  return found || colors[Math.floor(Math.random() * colors.length)];
}

function extractEyeColor(prompt: string): string {
  const colors = ['Blue', 'Green', 'Brown', 'Hazel', 'Gray', 'Amber', 'Violet'];
  const found = colors.find(color => prompt.toLowerCase().includes(color.toLowerCase()));
  return found || colors[Math.floor(Math.random() * colors.length)];
}

function getRandomSkinTone(): string {
  const tones = ['Pale', 'Fair', 'Olive', 'Tanned', 'Bronze', 'Dark'];
  return tones[Math.floor(Math.random() * tones.length)];
}

function getDistinctiveFeatures(characterType: string): string[] {
  const features: { [key: string]: string[] } = {
    pirate: ['Eye patch', 'Scarred face', 'Gold tooth', 'Tattoos'],
    wizard: ['Long beard', 'Glowing eyes', 'Robe covered in runes', 'Staff'],
    knight: ['Shining armor', 'Family crest', 'Battle scars', 'Noble bearing'],
    ninja: ['Mask', 'Silent movement', 'Multiple weapons', 'Shadowy presence'],
    elf: ['Pointed ears', 'Graceful movements', 'Ancient jewelry', 'Mystical aura'],
    dwarf: ['Long beard', 'Stocky build', 'Mining tools', 'Ale mug']
  };
  
  return features[characterType] || ['Unique appearance', 'Confident posture'];
}

function getPersonalityTraits(characterType: string): string[] {
  const traits: { [key: string]: string[] } = {
    pirate: ['Bold', 'Resourceful', 'Greedy', 'Charismatic'],
    wizard: ['Wise', 'Patient', 'Curious', 'Powerful'],
    knight: ['Honorable', 'Brave', 'Loyal', 'Just'],
    ninja: ['Stealthy', 'Disciplined', 'Deadly', 'Mysterious'],
    elf: ['Graceful', 'Ancient', 'Magical', 'Nature-loving'],
    dwarf: ['Stubborn', 'Hardy', 'Traditional', 'Wealth-loving']
  };
  
  return traits[characterType] || ['Adventurous', 'Courageous'];
}

function getCharacterPosture(characterType: string): string {
  const postures: { [key: string]: string } = {
    pirate: 'Swaggering gait',
    wizard: 'Upright and contemplative',
    knight: 'Proud and ready',
    ninja: 'Crouched and ready',
    elf: 'Graceful and elegant',
    dwarf: 'Sturdy and grounded'
  };
  
  return postures[characterType] || 'Confident stance';
}

function getAnimationStyle(characterType: string): string {
  const styles: { [key: string]: string } = {
    pirate: 'Exaggerated and dramatic',
    wizard: 'Fluid and mystical',
    knight: 'Powerful and deliberate',
    ninja: 'Quick and precise',
    elf: 'Graceful and flowing',
    dwarf: 'Strong and grounded'
  };
  
  return styles[characterType] || 'Natural and expressive';
}

function getRandomEnvironment(): string {
  const environments = [
    'Ancient forest with glowing mushrooms',
    'Stormy pirate ship on rough seas',
    'Grand castle courtyard with banners',
    'Mystical library with floating books',
    'Neon-lit cyberpunk city street',
    'Snowy mountain fortress',
    'Enchanted fairy garden',
    'Futuristic space station'
  ];
  return environments[Math.floor(Math.random() * environments.length)];
}

function getRandomMood(): string {
  const moods = ['Heroic', 'Mysterious', 'Dangerous', 'Magical', 'Epic', 'Serene'];
  return moods[Math.floor(Math.random() * moods.length)];
}