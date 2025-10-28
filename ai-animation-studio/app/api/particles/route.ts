import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Enhanced keyword mapping for better results
const ENHANCED_KEYWORD_MAPPING = {
  // Colors
  'blue': '#00aaff', 'red': '#ff4400', 'green': '#00ff44', 'purple': '#8844ff',
  'yellow': '#ffff00', 'white': '#ffffff', 'pink': '#ff00ff', 'orange': '#ff8800',
  'gold': '#ffaa00', 'silver': '#cccccc', 'cyan': '#00ffff', 'magenta': '#ff00ff',
  
  // Motions
  'swirl': 'vortex', 'vortex': 'vortex', 'spin': 'vortex', 'rotate': 'orbit',
  'explode': 'explode', 'burst': 'explode', 'bang': 'explode', 
  'pulse': 'pulse', 'beat': 'pulse', 'throb': 'pulse',
  'rise': 'rise', 'float': 'float', 'up': 'rise', 'fall': 'rise',
  'orbit': 'orbit', 'circle': 'orbit', 'dance': 'float'
};

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // Enhanced local interpretation as primary method
    const localConfig = enhancedInterpretPrompt(prompt);
    
    // Use AI as enhancement, not primary
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Enhance this particle configuration based on the user's description. 
            Current config: ${JSON.stringify(localConfig)}
            User wants: "${prompt}"
            Suggest small improvements to color, motion, or intensity if needed.
            Return JSON with color, motion, intensity.`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      });

      const response = completion.choices[0].message.content;
      if (response) {
        try {
          const aiConfig = JSON.parse(response);
          // Blend AI suggestions with local config
          const blendedConfig = {
            color: aiConfig.color || localConfig.color,
            motion: aiConfig.motion || localConfig.motion,
            intensity: aiConfig.intensity || localConfig.intensity
          };
          return NextResponse.json({ config: blendedConfig });
        } catch (e) {
          // If AI response isn't valid JSON, use local config
          console.log('AI response not valid JSON, using local config');
        }
      }
    } catch (aiError) {
      console.log('AI enhancement failed, using local config');
    }

    return NextResponse.json({ config: localConfig });

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

function enhancedInterpretPrompt(userPrompt: string) {
  const prompt = userPrompt.toLowerCase();
  
  // Default configuration
  let config = {
    color: '#00ff88',
    motion: 'float',
    intensity: 5
  };

  // Color detection with context
  if (prompt.includes('snow') || prompt.includes('ice') || prompt.includes('winter')) config.color = '#ffffff';
  if (prompt.includes('fire') || prompt.includes('lava') || prompt.includes('burn')) config.color = '#ff4400';
  if (prompt.includes('water') || prompt.includes('ocean') || prompt.includes('sea')) config.color = '#00aaff';
  if (prompt.includes('nature') || prompt.includes('forest') || prompt.includes('grass')) config.color = '#00ff44';
  if (prompt.includes('magic') || prompt.includes('fairy') || prompt.includes('enchanted')) config.color = '#8844ff';
  if (prompt.includes('energy') || prompt.includes('electric') || prompt.includes('power')) config.color = '#00ffff';
  if (prompt.includes('sun') || prompt.includes('gold') || prompt.includes('light')) config.color = '#ffff00';
  if (prompt.includes('bubble') || prompt.includes('pink') || prompt.includes('cotton')) config.color = '#ff00ff';
  
  // Motion detection with context
  if (prompt.includes('galaxy') || prompt.includes('vortex') || prompt.includes('swirl')) config.motion = 'vortex';
  if (prompt.includes('explosion') || prompt.includes('burst') || prompt.includes('bang')) config.motion = 'explode';
  if (prompt.includes('heartbeat') || prompt.includes('pulse') || prompt.includes('breath')) config.motion = 'pulse';
  if (prompt.includes('snow') || prompt.includes('rain') || prompt.includes('fall')) config.motion = 'rise';
  if (prompt.includes('orbit') || prompt.includes('planet') || prompt.includes('solar')) config.motion = 'orbit';
  if (prompt.includes('dance') || prompt.includes('float') || prompt.includes('gentle')) config.motion = 'float';
  
  // Intensity based on context
  if (prompt.includes('gentle') || prompt.includes('soft') || prompt.includes('calm')) config.intensity = 3;
  if (prompt.includes('intense') || prompt.includes('storm') || prompt.includes('chaos')) config.intensity = 8;
  if (prompt.includes('explosion') || prompt.includes('violent') || prompt.includes('wild')) config.intensity = 10;

  return config;
}