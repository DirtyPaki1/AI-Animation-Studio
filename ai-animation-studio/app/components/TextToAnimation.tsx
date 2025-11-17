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

const VALID_EASING_FUNCTIONS = [
  'linear',
  'easeIn',
  'easeOut',
  'easeInOut',
  'circIn',
  'circOut',
  'circInOut',
  'backIn',
  'backOut',
  'backInOut',
  'anticipate'
]

const QUICK_ANIMATIONS = [
  {
    name: 'Bouncing Ball',
    prompt: 'A ball bouncing with gravity and squash/stretch effect',
    concept: {
      title: 'Bouncing Ball Animation',
      description: 'A realistic ball bounce with gravity physics and squash/stretch deformation',
      keyframes: [
        'Ball at highest point, slightly squashed',
        'Ball falling, stretching downward',
        'Ball hitting ground, heavily squashed',
        'Ball rebounding upward, stretching up',
        'Ball reaching peak height, slightly squashed'
      ],
      duration: 1.5,
      easing: 'easeInOut'
    }
  },
  {
    name: 'Floating Object',
    prompt: 'An object floating gently up and down',
    concept: {
      title: 'Floating Animation',
      description: 'Gentle floating motion with subtle rotation',
      keyframes: [
        'Object at lowest point',
        'Object rising slowly',
        'Object at highest point, slightly rotated',
        'Object descending gently',
        'Object back at start position'
      ],
      duration: 3,
      easing: 'easeInOut'
    }
  },
  {
    name: 'Pulse Effect',
    prompt: 'A pulsing glow effect that grows and shrinks',
    concept: {
      title: 'Pulsing Glow Animation',
      description: 'Rhythmic pulsing with scale and opacity changes',
      keyframes: [
        'Normal size, full opacity',
        'Growing larger, brighter glow',
        'Maximum size, brightest glow',
        'Shrinking back, glow fading',
        'Back to normal size and opacity'
      ],
      duration: 2,
      easing: 'circInOut'
    }
  },
  {
    name: 'Spin & Rotate',
    prompt: 'An object spinning continuously',
    concept: {
      title: 'Continuous Spin Animation',
      description: 'Smooth continuous rotation',
      keyframes: [
        'Starting position 0 degrees',
        'Quarter rotation 90 degrees',
        'Half rotation 180 degrees',
        'Three-quarters rotation 270 degrees',
        'Full rotation 360 degrees'
      ],
      duration: 2,
      easing: 'linear'
    }
  }
]

export default function TextToAnimation() {
  const [prompt, setPrompt] = useState('')
  const [concept, setConcept] = useState<AnimationConcept | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

  const generateAnimation = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setPreview(false)
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          type: 'animation' 
        }),
      })
      
      if (!response.ok) {
        throw new Error('API request failed')
      }
      
      const data = await response.json()
      console.log('API Response:', data)
      
      if (data.concept) {
        const validatedConcept = validateAnimationConcept(data.concept, prompt)
        setConcept(validatedConcept)
        setAnimationKey(prev => prev + 1)
      } else {
        throw new Error('No concept in response')
      }
    } catch (error) {
      console.error('Error generating animation:', error)
      const fallbackConcept = createFallbackConcept(prompt)
      setConcept(fallbackConcept)
      setAnimationKey(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  const validateAnimationConcept = (concept: any, prompt: string): AnimationConcept => {
    return {
      title: concept.title || `Animation: ${prompt.substring(0, 30)}...`,
      description: concept.description || `An animation based on: ${prompt}`,
      keyframes: Array.isArray(concept.keyframes) && concept.keyframes.length > 0 
        ? concept.keyframes 
        : ['Start position', 'Middle action', 'End position'],
      duration: typeof concept.duration === 'number' 
        ? Math.max(0.5, Math.min(concept.duration, 10))
        : 2,
      easing: VALID_EASING_FUNCTIONS.includes(concept.easing) ? concept.easing : 'easeInOut'
    }
  }

  const createFallbackConcept = (prompt: string): AnimationConcept => {
    const promptLower = prompt.toLowerCase()
    
    if (promptLower.includes('bounce') || promptLower.includes('ball')) {
      return {
        title: 'Bouncing Animation',
        description: `A bouncing motion based on: ${prompt}`,
        keyframes: [
          'Object at highest point',
          'Object falling down',
          'Object hitting surface',
          'Object bouncing back up',
          'Object reaching peak height'
        ],
        duration: 1.5,
        easing: 'easeInOut'
      }
    } else if (promptLower.includes('float') || promptLower.includes('hover')) {
      return {
        title: 'Floating Animation',
        description: `A floating motion based on: ${prompt}`,
        keyframes: [
          'Object at normal position',
          'Object rising gently',
          'Object at highest point',
          'Object descending slowly',
          'Object back to start'
        ],
        duration: 3,
        easing: 'easeInOut'
      }
    } else if (promptLower.includes('spin') || promptLower.includes('rotate')) {
      return {
        title: 'Rotation Animation',
        description: `A rotating motion based on: ${prompt}`,
        keyframes: [
          'Starting rotation 0°',
          'Quarter turn 90°',
          'Half rotation 180°',
          'Three-quarters 270°',
          'Full rotation 360°'
        ],
        duration: 2,
        easing: 'linear'
      }
    } else if (promptLower.includes('pulse') || promptLower.includes('glow')) {
      return {
        title: 'Pulsing Animation',
        description: `A pulsing effect based on: ${prompt}`,
        keyframes: [
          'Normal size and brightness',
          'Growing larger and brighter',
          'Maximum size and brightness',
          'Shrinking back to normal',
          'Back to starting state'
        ],
        duration: 2,
        easing: 'easeInOut'
      }
    } else {
      return {
        title: 'Custom Animation',
        description: `An animation based on: ${prompt}`,
        keyframes: [
          'Starting position and state',
          'Beginning of movement',
          'Mid-point action',
          'Completing movement',
          'Final position and state'
        ],
        duration: 2,
        easing: 'easeInOut'
      }
    }
  }

  const handleQuickAnimation = (quickAnim: typeof QUICK_ANIMATIONS[0]) => {
    setPrompt(quickAnim.prompt)
    setConcept(quickAnim.concept)
    setAnimationKey(prev => prev + 1)
    setPreview(true)
  }

  const getAnimationProperties = (concept: AnimationConcept) => {
    const titleLower = concept.title.toLowerCase()
    
    if (titleLower.includes('bounce')) {
      return {
        animate: {
          y: [0, -60, 0, -30, 0],
          scale: [1, 1.2, 0.8, 1.1, 1]
        }
      }
    } else if (titleLower.includes('float')) {
      return {
        animate: {
          y: [0, -40, -60, -40, 0],
          rotate: [0, 5, 0, -5, 0]
        }
      }
    } else if (titleLower.includes('spin') || titleLower.includes('rotate')) {
      return {
        animate: {
          rotate: 360
        }
      }
    } else if (titleLower.includes('pulse')) {
      return {
        animate: {
          scale: [1, 1.5, 1, 1.3, 1],
          opacity: [1, 0.8, 1, 0.9, 1]
        }
      }
    } else {
      return {
        animate: {
          y: [0, -30, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1]
        }
      }
    }
  }

  const getAnimationTransition = (concept: AnimationConcept) => {
    return {
      duration: concept.duration,
      ease: concept.easing,
      repeat: Infinity,
      repeatType: 'loop' as const
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
          <p className="text-gray-400">Describe your animation and see it come to life</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your animation... Examples: 'bouncing ball', 'floating ghost', 'spinning logo', 'pulsing heart'"
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
              Generating Animation...
            </div>
          ) : (
            'Generate Animation Concept'
          )}
        </button>
      </div>

      {/* Quick Animation Presets */}
      <div className="bg-black/30 rounded-2xl p-4 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-3">Quick Examples - Click to Try</h4>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ANIMATIONS.map((anim, index) => (
            <button
              key={index}
              onClick={() => handleQuickAnimation(anim)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">
                  {anim.name}
                </span>
              </div>
              <span className="text-gray-400 text-xs">{anim.prompt.substring(0, 40)}...</span>
            </button>
          ))}
        </div>
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
                  <span className="text-white ml-2 capitalize">{concept.easing}</span>
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
                      <span className="text-purple-400 font-mono text-sm">
                        {((index * concept.duration) / (concept.keyframes.length - 1 || 1)).toFixed(1)}s
                      </span>
                      <span className="text-gray-300">{keyframe}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <button
                onClick={() => setPreview(!preview)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl transition-colors"
              >
                {preview ? 'Hide Animation Preview' : 'Show Animation Preview'}
              </button>

              {/* Animation Preview */}
              {preview && concept && (
                <motion.div
                  key={animationKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-black/30 rounded-2xl p-6 border border-white/10"
                >
                  <h4 className="text-lg font-semibold text-white mb-4">Animation Preview</h4>
                  <div className="flex justify-center items-center h-48">
                    <motion.div
                      {...getAnimationProperties(concept)}
                      transition={getAnimationTransition(concept)}
                      className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
                    >
                      <span className="text-white text-lg">✨</span>
                    </motion.div>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-400">
                    <p>Animation Type: <span className="text-white">{concept.title}</span></p>
                    <p>Easing: <span className="text-white">{concept.easing}</span> | Duration: <span className="text-white">{concept.duration}s</span></p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips Section */}
      <div className="bg-purple-900/30 border border-purple-700 rounded-xl p-4">
        <h4 className="text-white font-semibold mb-2">💡 Animation Tips</h4>
        <ul className="text-purple-200 text-sm space-y-1">
          <li>• <strong>Be specific:</strong> "bouncing ball with gravity" vs "something moving"</li>
          <li>• <strong>Common types:</strong> bounce, float, spin, pulse, wave, shake</li>
          <li>• <strong>Add details:</strong> "slow floating", "fast spin", "gentle pulse"</li>
          <li>• <strong>Try examples:</strong> Use the quick examples above to see how it works</li>
        </ul>
      </div>
    </div>
  )
}