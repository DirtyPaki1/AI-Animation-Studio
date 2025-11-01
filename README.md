# AI Animation Studio 🎬

A comprehensive Next.js application that combines multiple AI-driven animation and creation tools in one powerful platform. Generate animations, create talking avatars, design characters, and build particle systems - all powered by artificial intelligence.

## 🌟 Features

### 1. Text to Animation
- **AI-Powered Animation Concepts**: Describe any animation and get detailed concepts with keyframes
- **Live Preview**: See your animations come to life with real-time previews
- **Professional Workflow**: Get duration, easing functions, and sequential keyframes
- **Quick Templates**: Bouncing balls, floating objects, spinning logos, and pulsing effects

### 2. AI Talking Avatar
- **Real-time Speech Synthesis**: Convert text to natural-sounding speech using OpenAI TTS
- **Lip Sync Animation**: Animated mouth movements synchronized with speech
- **Multiple Voice Options**: Different voice personalities and styles
- **Audio Export**: Download generated speech as MP3 files

### 3. AI Character Creator
- **Detailed Character Generation**: Create characters with physical features, personality, and style
- **Visual Representation**: Auto-generated character visuals based on descriptions
- **Multiple Animations**: 8 animation types (idle, walk, run, jump, dance, attack, castSpell, greet)
- **Comprehensive Profiles**: Height, weight, body type, hair, eyes, skin, distinctive features
- **Personality System**: Traits, clothing style, and posture descriptions

### 4. AI Particle Playground
- **Instant Particle Generation**: Type any description and see immediate particle effects
- **Smart Interpretation**: AI understands colors, motion types, and intensity from natural language
- **Multiple Motion Patterns**: Float, vortex, explode, pulse, rise, orbit, wave
- **Real-time 3D Visualization**: Powered by Three.js and React Three Fiber
- **Quick Presets**: Snow, fire, magic, galaxy, energy, and more

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-animation-studio
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create `.env.local`:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Graphics**: Three.js, React Three Fiber, Drei
- **AI Integration**: OpenAI API (GPT-4, TTS)
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
ai-animation-studio/
├── app/
│   ├── api/
│   │   ├── ai/route.ts          # Text to animation concepts
│   │   ├── avatar/route.ts      # Text to speech generation
│   │   ├── character/route.ts   # Character creation & animation
│   │   └── particles/route.ts   # Particle system configuration
│   ├── components/
│   │   ├── TextToAnimation.tsx
│   │   ├── TalkingAvatar.tsx
│   │   ├── AICharacterAnimator.tsx
│   │   └── ParticlePlayground.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
└── Configuration files
```

## 🎯 Usage Examples

### Text to Animation
- "A bouncing ball with gravity and squash/stretch effect"
- "Floating ghost with gentle up and down motion"
- "Spinning logo with smooth rotation"
- "Pulsing heart with scale animation"

### Talking Avatar
- "Hello! Welcome to our AI Animation Studio!"
- "This is a demonstration of text to speech technology."
- "Create amazing animations with artificial intelligence."

### Character Creator
- "A tall muscular knight with scarred face and plate armor"
- "Graceful elf with silver hair and pointed ears"
- "Futuristic android with glowing blue eyes"
- "Wise old wizard with long white beard and staff"

### Particle Playground
- "Gentle snowfall in winter forest"
- "Swirling galaxy of stars"
- "Blue energy particles"
- "Fire explosion with yellow sparks"

## 🔧 API Routes

### `/api/ai`
- **Purpose**: Generate animation concepts from text descriptions
- **Input**: `{ prompt: string, type: 'animation' }`
- **Output**: Animation concept with title, description, keyframes, duration, easing

### `/api/avatar`
- **Purpose**: Convert text to speech
- **Input**: `{ text: string }`
- **Output**: Base64 encoded audio file

### `/api/character`
- **Purpose**: Create character descriptions and suggest animations
- **Input**: `{ prompt: string, type: 'character-description' | 'animation' }`
- **Output**: Character profile or animation type

### `/api/particles`
- **Purpose**: Generate particle system configurations
- **Input**: `{ prompt: string }`
- **Output**: Particle configuration (color, motion, intensity)

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `OPENAI_API_KEY`
   - Deploy

3. **Your app will be live at**: `https://your-app.vercel.app`

### Environment Variables for Production
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_APP_URL`: Your production URL (optional)

## 💡 Pro Tips

### For Best Text to Animation Results:
- Be specific about motion types (bounce, float, spin, pulse)
- Include timing details (slow, fast, gentle)
- Describe physical properties (gravity, elasticity)

### For Character Creation:
- Include physical details: height, weight, hair, eyes, skin
- Mention personality traits and style
- Add distinctive features and clothing

### For Particle Effects:
- Specify colors explicitly
- Use motion words: swirling, floating, exploding, pulsing
- Set intensity: gentle, intense, subtle, extreme

## 🐛 Troubleshooting

### Common Issues:

1. **WebGL Errors in Particle Playground**
   - Solution: The component includes proper buffer management and particle limits
   - Ensure your browser supports WebGL

2. **API Timeouts**
   - Solution: Built-in fallback systems provide instant results even if AI fails
   - All components work offline with local interpretation

3. **Animation Not Playing**
   - Solution: Uses Framer Motion with validated easing functions
   - Check browser console for specific errors

4. **Audio Not Generating**
   - Solution: Verify OpenAI TTS permissions
   - Check browser audio permissions

## 🔮 Future Enhancements

- [ ] Image generation for characters
- [ ] Advanced animation timelines
- [ ] Voice cloning capabilities
- [ ] Particle system export
- [ ] Character animation blending
- [ ] Real-time collaboration
- [ ] Mobile app version

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🆘 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Ensure your OpenAI API key is valid
4. Verify all environment variables are set

---

**Built with ❤️ using Next.js, React, Three.js, Framer Motion, and OpenAI**

Transform your creative ideas into stunning animations with AI Animation Studio! 🚀