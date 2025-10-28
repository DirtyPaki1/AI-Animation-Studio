import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { prompt, type } = await request.json();

    if (type === 'character-description') {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a character designer. Create detailed character descriptions based on user prompts.
            Return a JSON object with:
            - name: character name
            - description: brief character description
            - physicalFeatures: object with height, weight, bodyType, hair, eyes, skin, distinctiveFeatures (array)
            - personality: object with traits (array), style, posture
            - animationStyle: string describing movement style
            
            Make the character detailed and imaginative.`
          },
          {
            role: "user",
            content: `Create a character based on: "${prompt}"`
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const content = completion.choices[0].message.content;
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = content?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const character = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ character });
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        // If JSON parsing fails, create character from text
        const character = createCharacterFromText(content || '', prompt);
        return NextResponse.json({ character });
      }
    }

    // Original animation type functionality (fallback)
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
    console.error('Character API error:', error);
    return NextResponse.json({
      character: {
        name: "Generated Character",
        description: `A character based on: ${(await request.json()).prompt}`,
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

function createCharacterFromText(content: string, prompt: string) {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Extract name from first line or use default
  const name = lines[0]?.replace(/^(Name|Character):?\s*/i, '') || `Character from: ${prompt.substring(0, 20)}...`;
  
  // Extract description
  const description = lines.find(line => 
    line.toLowerCase().includes('description') || 
    (line.length > 30 && line.length < 200)
  )?.replace(/^(Description|About):?\s*/i, '') || `A character based on: ${prompt}`;

  // Simple extraction for physical features (in a real app, you'd use more sophisticated parsing)
  return {
    name,
    description,
    physicalFeatures: {
      height: extractFeature(content, ['height', 'tall', 'short']) || 'Average',
      weight: extractFeature(content, ['weight', 'heavy', 'light']) || 'Medium',
      bodyType: extractFeature(content, ['body', 'build', 'muscular', 'slim']) || 'Average',
      hair: extractFeature(content, ['hair']) || 'Brown',
      eyes: extractFeature(content, ['eyes']) || 'Brown',
      skin: extractFeature(content, ['skin', 'complexion']) || 'Light',
      distinctiveFeatures: extractDistinctiveFeatures(content)
    },
    personality: {
      traits: extractTraits(content),
      style: extractFeature(content, ['style', 'clothing', 'wear']) || 'Casual',
      posture: extractFeature(content, ['posture', 'stance']) || 'Neutral'
    },
    animationStyle: 'neutral'
  };
}

function extractFeature(text: string, keywords: string[]): string {
  const lowerText = text.toLowerCase();
  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      // Find the line containing the keyword and extract the value
      const lines = text.split('\n');
      const relevantLine = lines.find(line => line.toLowerCase().includes(keyword));
      if (relevantLine) {
        return relevantLine.split(':')[1]?.trim() || 'Unknown';
      }
    }
  }
  return 'Unknown';
}

function extractDistinctiveFeatures(text: string): string[] {
  const features: string[] = [];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    if (line.toLowerCase().includes('distinctive') || line.toLowerCase().includes('feature') || line.includes('-')) {
      const cleanLine = line.replace(/^[•\-]\s*/, '').trim();
      if (cleanLine && cleanLine.length < 100) {
        features.push(cleanLine);
      }
    }
  });
  
  return features.length > 0 ? features : ['None specified'];
}

function extractTraits(text: string): string[] {
  const traits: string[] = [];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    if (line.toLowerCase().includes('personality') || line.toLowerCase().includes('trait')) {
      const words = line.split(/[,.]/);
      words.forEach(word => {
        const cleanWord = word.trim();
        if (cleanWord && cleanWord.length < 20 && /^[A-Z]/.test(cleanWord)) {
          traits.push(cleanWord);
        }
      });
    }
  });
  
  return traits.length > 0 ? traits.slice(0, 4) : ['Adaptable'];
}