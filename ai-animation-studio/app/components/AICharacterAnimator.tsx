'use client'
import { useState, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

type AnimationType = 'idle' | 'bounce' | 'wave' | 'spin' | 'dance' | 'jump'

export default function AICharacterAnimator() {
  const [image, setImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [animationType, setAnimationType] = useState<AnimationType>('idle')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const controls = useAnimation()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setAnimationType('idle')
      }
      reader.readAsDataURL(file)
    }
  }

  const generateAnimation = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    
    try {
      const response = await fetch('/api/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      
      const data = await response.json()
      setAnimationType(data.animationType || 'idle')
      
      // Start the animation
      await controls.start(getAnimationVariant(data.animationType))
    } catch (error) {
      console.error('Error generating animation:', error)
      alert('Failed to generate animation')
    } finally {
      setLoading(false)
    }
  }

  const getAnimationVariant = (type: AnimationType) => {
    switch (type) {
      case 'bounce':
        return {
          y: [0, -30, 0],
          transition: { duration: 0.6, repeat: Infinity }
        }
      case 'wave':
        return {
          rotate: [0, 15, -15, 0],
          transition: { duration: 1, repeat: Infinity }
        }
      case 'spin':
        return {
          rotate: 360,
          transition: { duration: 2, repeat: Infinity, ease: 'linear' }
        }
      case 'dance':
        return {
          x: [0, 20, -20, 0],
          y: [0, -10, 0],
          rotate: [0, 10, -10, 0],
          transition: { duration: 1.5, repeat: Infinity }
        }
      case 'jump':
        return {
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
          transition: { duration: 0.8, repeat: Infinity }
        }
      default:
        return {}
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
          <span className="text-lg">👤</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Character Animator</h2>
          <p className="text-gray-400">Upload a character and bring it to life with AI</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Image Upload */}
        <div className="flex gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={triggerFileInput}
            className="flex-1 bg-black/30 border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl p-6 text-center transition-colors"
          >
            <div className="text-3xl mb-2">📁</div>
            <p className="text-white font-semibold">Upload Character</p>
            <p className="text-gray-400 text-sm">PNG, JPG, SVG</p>
          </button>
          
          {image && (
            <div className="flex-1 bg-black/30 rounded-2xl p-4 border border-white/10">
              <img src={image} alt="Uploaded character" className="w-full h-24 object-contain rounded-lg" />
            </div>
          )}
        </div>

        {/* Animation Prompt */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe how you want the character to move... (e.g., 'Make it bounce happily with excitement')"
          className="w-full h-24 p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
        
        <button
          onClick={generateAnimation}
          disabled={loading || !image || !prompt.trim()}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Animating Character...
            </div>
          ) : (
            'Animate Character'
          )}
        </button>
      </div>

      {/* Character Display */}
      <div className="flex justify-center mt-8">
        <div className="relative">
          {image ? (
            <motion.div
              animate={controls}
              className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-white/20"
            >
              <img src={image} alt="Animated character" className="w-full h-full object-cover" />
            </motion.div>
          ) : (
            <div className="w-48 h-48 bg-black/30 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
              <span className="text-4xl">🔄</span>
            </div>
          )}
          
          {/* Animation Status */}
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {animationType}
          </div>
        </div>
      </div>

      {/* Animation Controls */}
      {image && (
        <div className="bg-black/30 rounded-2xl p-4 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-3">Quick Animations</h4>
          <div className="grid grid-cols-3 gap-2">
            {(['bounce', 'wave', 'spin', 'dance', 'jump', 'idle'] as AnimationType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setAnimationType(type)
                  controls.start(getAnimationVariant(type))
                }}
                className={`p-2 rounded-lg text-sm font-semibold transition-colors ${
                  animationType === type 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}