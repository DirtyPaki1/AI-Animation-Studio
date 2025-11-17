'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface ParticleConfig {
  color: string
  motion: string
  intensity: number
}

export default function ParticlePlayground() {
  const [prompt, setPrompt] = useState('')
  const [config, setConfig] = useState<ParticleConfig | null>(null)
  const [loading, setLoading] = useState(false)

  const particlePresets = [
    { name: 'Snow Storm', prompt: 'gentle snow falling from the sky', color: '#ffffff', motion: 'fall' },
    { name: 'Fire Magic', prompt: 'magical fire particles rising', color: '#ff4400', motion: 'rise' },
    { name: 'Energy Field', prompt: 'glowing energy particles orbiting', color: '#00ffff', motion: 'orbit' },
    { name: 'Magic Sparkles', prompt: 'sparkling magical dust floating', color: '#8844ff', motion: 'float' },
    { name: 'Galaxy Dust', prompt: 'cosmic particles swirling in vortex', color: '#8b5cf6', motion: 'vortex' },
    { name: 'Electric Sparks', prompt: 'electric sparks exploding outwards', color: '#ffff00', motion: 'explode' }
  ]

  const generateParticles = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          type: 'particles' 
        }),
      })
      
      if (!response.ok) {
        throw new Error('API request failed')
      }
      
      const data = await response.json()
      console.log('Particle API Response:', data)
      
      if (data.config) {
        setConfig(data.config)
      } else {
        throw new Error('No particle config in response')
      }
    } catch (error) {
      console.error('Error generating particles:', error)
      setConfig({
        color: '#00ff88',
        motion: 'float',
        intensity: 5
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreset = (preset: typeof particlePresets[0]) => {
    setPrompt(preset.prompt)
    setConfig({
      color: preset.color,
      motion: preset.motion as any,
      intensity: 6
    })
  }

  const getParticleMotion = (motionType: string, index: number) => {
    const base = index % 20
    
    switch (motionType) {
      case 'rise':
        return {
          x: [base * 20 - 200, base * 25 - 200],
          y: [300, -100],
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }
      case 'fall':
        return {
          x: [base * 25 - 250, base * 30 - 250],
          y: [-100, 300],
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }
      case 'float':
        return {
          x: [base * 30 - 300, base * 35 - 300],
          y: [150, 50, 150],
          scale: [0, 1, 0],
          opacity: [0, 1, 0.5, 0]
        }
      case 'orbit':
        return {
          x: [0, 100, 0, -100, 0],
          y: [0, 50, 100, 50, 0],
          scale: [0, 1, 0.8, 1, 0],
          opacity: [0, 1, 0.8, 1, 0]
        }
      case 'vortex':
        return {
          x: [0, 80, 0, -80, 0],
          y: [0, 0, 80, 0, 0],
          scale: [0, 1, 0.6, 1, 0],
          opacity: [0, 1, 0.6, 1, 0]
        }
      case 'explode':
        return {
          x: [0, Math.cos(base) * 150],
          y: [0, Math.sin(base) * 150],
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }
      default:
        return {
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }
    }
  }

  const getParticleTransition = (motionType: string, index: number) => {
    const baseDuration = motionType === 'orbit' || motionType === 'vortex' ? 4 : 3
    return {
      duration: baseDuration + (index % 3),
      repeat: Infinity,
      delay: index * 0.1,
      ease: "easeInOut"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
          <span className="text-lg">⚡</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Particle Playground</h2>
          <p className="text-gray-400">Create stunning particle effects with AI</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your particle effect... Examples: 'gentle snow falling', 'magical sparks floating', 'energy field glowing'"
          className="w-full h-24 p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
        
        <button
          onClick={generateParticles}
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Particles...
            </div>
          ) : (
            'Generate Particle Effect'
          )}
        </button>
      </div>

      {/* Particle Presets */}
      <div className="bg-black/30 rounded-2xl p-4 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-3">Quick Presets - Click to Try</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {particlePresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePreset(preset)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors group"
            >
              <div 
                className="w-6 h-6 rounded-full mb-2"
                style={{ background: preset.color }}
              />
              <div className="text-white font-semibold text-sm group-hover:text-orange-300 transition-colors">
                {preset.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Particle Preview */}
      {config && (
        <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Particle Effect Preview</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
            <div className="bg-black/50 rounded-lg p-3 text-center">
              <span className="text-gray-400">Color</span>
              <div 
                className="w-8 h-8 rounded-full mx-auto mt-2 border border-white/30"
                style={{ background: config.color }}
              />
            </div>
            <div className="bg-black/50 rounded-lg p-3 text-center">
              <span className="text-gray-400">Motion</span>
              <div className="text-white font-semibold mt-2 capitalize">{config.motion}</div>
            </div>
            <div className="bg-black/50 rounded-lg p-3 text-center">
              <span className="text-gray-400">Intensity</span>
              <div className="text-white font-semibold mt-2">{config.intensity}/10</div>
            </div>
          </div>

          <div className="relative h-64 bg-black/50 rounded-2xl border-2 border-white/10 overflow-hidden">
            {/* Particles */}
            {Array.from({ length: config.intensity * 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${4 + (i % 4)}px`,
                  height: `${4 + (i % 4)}px`,
                  background: config.color,
                  filter: 'blur(1px)',
                  left: '50%',
                  top: '50%'
                }}
                animate={getParticleMotion(config.motion, i)}
                transition={getParticleTransition(config.motion, i)}
              />
            ))}
          </div>

          <div className="mt-4 text-center text-sm text-gray-400">
            <p>Motion Type: <span className="text-white capitalize">{config.motion}</span></p>
            <p>Particle Count: <span className="text-white">{config.intensity * 8}</span></p>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-orange-900/30 border border-orange-700 rounded-xl p-4">
        <h4 className="text-white font-semibold mb-2">🎨 Particle Tips</h4>
        <ul className="text-orange-200 text-sm space-y-1">
          <li>• <strong>Motion Types:</strong> rise, fall, float, orbit, vortex, explode</li>
          <li>• <strong>Color Ideas:</strong> "blue energy", "red fire", "purple magic", "white snow"</li>
          <li>• <strong>Intensity:</strong> "gentle snow" (low) vs "intense explosion" (high)</li>
          <li>• <strong>Combinations:</strong> "swirling galaxy dust", "falling cherry blossoms"</li>
        </ul>
      </div>
    </div>
  )
}