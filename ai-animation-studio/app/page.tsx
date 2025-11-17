'use client'
import { useState } from 'react'
import AICharacterAnimator from './components/AICharacterAnimator'
import TalkingAvatar from './components/TalkingAvatar'
import TextToAnimation from './components/TextToAnimation'
import ParticlePlayground from './components/ParticlePlayground'

type Tab = 'characters' | 'animations' | 'speech' | 'particles'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('characters')

  const tabs = [
    { id: 'characters' as Tab, name: '🎭 Character Builder', icon: '👤' },
    { id: 'animations' as Tab, name: '🎬 Animation Studio', icon: '✨' },
    { id: 'speech' as Tab, name: '🗣️ Voice Generator', icon: '🎤' },
    { id: 'particles' as Tab, name: '🌟 Particle Effects', icon: '⚡' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI Animation Studio</h1>
                <p className="text-gray-300">Create Characters, Stories & Animations with AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/30 rounded-2xl p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-semibold">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'characters' && <AICharacterAnimator />}
        {activeTab === 'animations' && <TextToAnimation />}
        {activeTab === 'speech' && <TalkingAvatar />}
        {activeTab === 'particles' && <ParticlePlayground />}
      </div>

      {/* Footer */}
      <div className="bg-black/30 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400">
          <p>Powered by OpenAI • Create Amazing Animations & Stories</p>
        </div>
      </div>
    </div>
  )
}