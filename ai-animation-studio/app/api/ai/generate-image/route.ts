import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, style = 'fantasy', service = 'pollinations' } = await request.json();

    console.log('🎨 Generating character image:', prompt);
    
    // Use Pollinations.ai - completely free, no API key required
    const enhancedPrompt = `${prompt}, ${style} style, character portrait, detailed, high quality, digital art`;
    
    // Generate image URL using Pollinations.ai
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&nologo=true`;
    
    // Verify the image exists
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Image generation service failed');
    }

    return NextResponse.json({
      imageUrl: imageUrl,
      prompt: prompt,
      style: style,
      service: 'pollinations',
      success: true
    });

  } catch (error) {
    console.error('Error generating image:', error);
    
    // Fallback to Picsum placeholder
    const fallbackImages = [
      'https://picsum.photos/512/512',
      'https://picsum.photos/512/512?1',
      'https://picsum.photos/512/512?2',
      'https://picsum.photos/512/512?3'
    ];
    
    const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    
    return NextResponse.json({
      imageUrl: randomImage,
      prompt: 'Character',
      style: 'fantasy',
      service: 'picsum-fallback',
      success: true,
      note: 'Using fallback image service'
    });
  }
}