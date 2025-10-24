'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimationConcept {
  title: string
  description: string
  keyframes: string[]
  duration: number
  easing: string
}

export default function TextToAnimation() {
  const [prompt, setPrompt] = useState('')
  const [concept, setConcept] = useState<AnimationConcept | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)

  const generateAnimation = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'animation' }),
      })
      
      const data = await response.json()
      setConcept(data.concept)
    } catch (error) {
      console.error('Error generating animation:', error)
      alert('Failed to generate animation concept')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <span className="text-lg">🎬</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Text to Animation</h2>
          <p className="text-gray-400">Describe your animation and get AI-generated concepts</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the animation you want to create... (e.g., 'A bouncing ball with gravity and squash/stretch effect')"
          className="w-full h-32 p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        
        <button
          onClick={generateAnimation}
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Animation Concept...
            </div>
          ) : (
            'Generate Animation Concept'
          )}
        </button>
      </div>

      <AnimatePresence>
        {concept && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3">{concept.title}</h3>
              <p className="text-gray-300 mb-4">{concept.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-black/50 rounded-lg p-3">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white ml-2">{concept.duration}s</span>
                </div>
                <div className="bg-black/50 rounded-lg p-3">
                  <span className="text-gray-400">Easing:</span>
                  <span className="text-white ml-2">{concept.easing}</span>
                </div>
                <div className="bg-black/50 rounded-lg p-3">
                  <span className="text-gray-400">Keyframes:</span>
                  <span className="text-white ml-2">{concept.keyframes.length}</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-semibold text-white mb-2">Keyframes:</h4>
                <div className="space-y-2">
                  {concept.keyframes.map((keyframe, index) => (
                    <div key={index} className="flex items-center gap-3 bg-black/30 rounded-lg p-3">
                      <span className="text-purple-400 font-mono text-sm">{index * (concept.duration / (concept.keyframes.length - 1))}s</span>
                      <span className="text-gray-300">{keyframe}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Toggle */}
            <button
              onClick={() => setPreview(!preview)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl transition-colors"
            >
              {preview ? 'Hide Preview' : 'Show Animation Preview'}
            </button>

            {/* Animation Preview */}
            {preview && concept && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/30 rounded-2xl p-6 border border-white/10"
              >
                <h4 className="text-lg font-semibold text-white mb-4">Animation Preview</h4>
                <div className="flex justify-center">
                  <motion.div
                    animate={{
                      y: [0, -50, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: concept.duration,
                      ease: concept.easing as any,
                      repeat: Infinity,
                    }}
                    className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}