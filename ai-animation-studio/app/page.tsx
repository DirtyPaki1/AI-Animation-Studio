'use client'
import { useState } from 'react'
import TextToAnimation from './components/TextToAnimation'
import TalkingAvatar from './components/TalkingAvatar'
import AICharacterAnimator from './components/AICharacterAnimator'
import ParticlePlayground from './components/ParticlePlayground'

export default function Home() {
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const tools = [
    { id: 'text-to-animation', name: 'Text to Animation', component: TextToAnimation, color: 'from-purple-500 to-pink-500' },
    { id: 'talking-avatar', name: 'AI Talking Avatar', component: TalkingAvatar, color: 'from-blue-500 to-cyan-500' },
    { id: 'character-animator', name: 'Character Animator', component: AICharacterAnimator, color: 'from-green-500 to-emerald-500' },
    { id: 'particle-playground', name: 'Particle Playground', component: ParticlePlayground, color: 'from-orange-500 to-red-500' },
  ]

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🎬</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            AI Animation <span className="gradient-text">Studio</span>
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Create stunning animations, talking avatars, character motions, and mesmerizing particle effects 
          powered by cutting-edge AI technology.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto">
        {!activeTool ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`
                  group relative p-8 rounded-3xl text-left transition-all duration-300 
                  hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${tool.color}
                  backdrop-blur-lg border border-white/20 overflow-hidden
                `}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="relative z-10">
                  <div className="text-3xl mb-4">✨</div>
                  <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
                  <p className="text-white/80 text-sm">Click to open</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Back Button */}
            <button
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
            >
              <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
              Back to Tools
            </button>

            {/* Active Tool */}
            <div className="glass rounded-3xl p-6 md:p-8">
              {tools.map((tool) => 
                activeTool === tool.id && <tool.component key={tool.id} />
              )}
            </div>
          </div>
        )}

        {/* Features Grid */}
        {!activeTool && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Generation</h3>
              <p className="text-gray-400">Instant AI-powered animation creation</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multiple Formats</h3>
              <p className="text-gray-400">Text, audio, images, and 3D particles</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Easy Export</h3>
              <p className="text-gray-400">Download and share your creations</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-16 text-center text-gray-400">
        <p>Built with Next.js, Framer Motion, Three.js, and OpenAI</p>
      </footer>
    </main>
  )
}