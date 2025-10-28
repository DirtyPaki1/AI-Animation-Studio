'use client'
import { useState, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface Character {
  name: string
  description: string
  physicalFeatures: {
    height: string
    weight: string
    bodyType: string
    hair: string
    eyes: string
    skin: string
    distinctiveFeatures: string[]
  }
  personality: {
    traits: string[]
    style: string
    posture: string
  }
  animationStyle: string
}

type AnimationType = 'idle' | 'walk' | 'run' | 'jump' | 'dance' | 'attack' | 'castSpell' | 'greet'

export default function AICharacterAnimator() {
  const [prompt, setPrompt] = useState('')
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(false)
  const [animationType, setAnimationType] = useState<AnimationType>('idle')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const controls = useAnimation()

  const generateCharacter = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    
    try {
      const response = await fetch('/api/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          type: 'character-description' 
        }),
      })
      
      if (!response.ok) {
        throw new Error('API request failed')
      }
      
      const data = await response.json()
      console.log('Character API Response:', data)
      
      if (data.character) {
        setCharacter(data.character)
        // Generate a visual representation based on the character
        generateCharacterVisual(data.character)
        setAnimationType('idle')
        await controls.start(getAnimationVariant('idle'))
      } else {
        throw new Error('No character data in response')
      }
    } catch (error) {
      console.error('Error generating character:', error)
      // Create a fallback character based on the prompt
      const fallbackCharacter = createFallbackCharacter(prompt)
      setCharacter(fallbackCharacter)
      generateCharacterVisual(fallbackCharacter)
    } finally {
      setLoading(false)
    }
  }

  const generateCharacterVisual = (char: Character) => {
    // Create a simple visual representation based on character features
    // In a real app, you'd call an image generation API here
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 200
    canvas.height = 300
    
    // Background
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Character body based on body type
    const bodyType = char.physicalFeatures.bodyType.toLowerCase()
    let bodyWidth = 60
    let bodyHeight = 120
    
    if (bodyType.includes('slim') || bodyType.includes('thin')) {
      bodyWidth = 50
      bodyHeight = 130
    } else if (bodyType.includes('muscular') || bodyType.includes('athletic')) {
      bodyWidth = 70
      bodyHeight = 130
    } else if (bodyType.includes('large') || bodyType.includes('heavy')) {
      bodyWidth = 80
      bodyHeight = 110
    }
    
    // Body color based on skin tone
    let skinColor = '#f0d9b5' // default
    if (char.physicalFeatures.skin.includes('pale') || char.physicalFeatures.skin.includes('light')) {
      skinColor = '#f8e0b0'
    } else if (char.physicalFeatures.skin.includes('tan') || char.physicalFeatures.skin.includes('olive')) {
      skinColor = '#e0b88a'
    } else if (char.physicalFeatures.skin.includes('dark') || char.physicalFeatures.skin.includes('brown')) {
      skinColor = '#b08c6c'
    } else if (char.physicalFeatures.skin.includes('ebony') || char.physicalFeatures.skin.includes('black')) {
      skinColor = '#8c6c4a'
    }
    
    // Draw character
    ctx.fillStyle = skinColor
    ctx.fillRect((canvas.width - bodyWidth) / 2, 100, bodyWidth, bodyHeight)
    
    // Head
    ctx.beginPath()
    ctx.arc(canvas.width / 2, 70, 25, 0, Math.PI * 2)
    ctx.fill()
    
    // Hair color
    let hairColor = '#8b4513' // default brown
    if (char.physicalFeatures.hair.includes('blonde') || char.physicalFeatures.hair.includes('golden')) {
      hairColor = '#d4b483'
    } else if (char.physicalFeatures.hair.includes('black')) {
      hairColor = '#2c2c2c'
    } else if (char.physicalFeatures.hair.includes('red') || char.physicalFeatures.hair.includes('auburn')) {
      hairColor = '#a52a2a'
    } else if (char.physicalFeatures.hair.includes('gray') || char.physicalFeatures.hair.includes('white')) {
      hairColor = '#d3d3d3'
    } else if (char.physicalFeatures.hair.includes('blue') || char.physicalFeatures.hair.includes('green') || char.physicalFeatures.hair.includes('pink')) {
      hairColor = '#ff6b9d' // fantasy colors
    }
    
    // Hair style
    ctx.fillStyle = hairColor
    if (char.physicalFeatures.hair.includes('long')) {
      ctx.fillRect((canvas.width - 40) / 2, 45, 40, 40)
    } else if (char.physicalFeatures.hair.includes('short')) {
      ctx.fillRect((canvas.width - 30) / 2, 45, 30, 20)
    } else {
      // Medium/default
      ctx.fillRect((canvas.width - 35) / 2, 45, 35, 30)
    }
    
    // Eyes
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(canvas.width / 2 - 8, 65, 4, 0, Math.PI * 2)
    ctx.arc(canvas.width / 2 + 8, 65, 4, 0, Math.PI * 2)
    ctx.fill()
    
    // Clothing based on style
    ctx.fillStyle = char.personality.style.includes('elegant') ? '#9370db' : 
                   char.personality.style.includes('casual') ? '#4682b4' :
                   char.personality.style.includes('armor') ? '#708090' :
                   char.personality.style.includes('fantasy') ? '#da70d6' : '#32cd32'
    
    ctx.fillRect((canvas.width - bodyWidth + 10) / 2, 120, bodyWidth - 20, 80)
    
    setGeneratedImage(canvas.toDataURL())
  }

  const createFallbackCharacter = (userPrompt: string): Character => {
    const promptLower = userPrompt.toLowerCase()
    
    // Determine character type based on prompt keywords
    let characterTemplate = {
      name: 'Unknown Character',
      description: `A character based on: ${userPrompt}`,
      physicalFeatures: {
        height: 'Average',
        weight: 'Medium',
        bodyType: 'Average',
        hair: 'Brown medium length',
        eyes: 'Brown',
        skin: 'Light',
        distinctiveFeatures: ['None specified']
      },
      personality: {
        traits: ['Adaptable'],
        style: 'Casual',
        posture: 'Neutral'
      },
      animationStyle: 'neutral'
    }

    if (promptLower.includes('warrior') || promptLower.includes('fighter') || promptLower.includes('knight')) {
      characterTemplate = {
        name: 'Brave Warrior',
        description: 'A strong and courageous fighter ready for battle',
        physicalFeatures: {
          height: 'Tall',
          weight: 'Heavy',
          bodyType: 'Muscular',
          hair: 'Short brown',
          eyes: 'Determined brown',
          skin: 'Tanned',
          distinctiveFeatures: ['Scar on cheek', 'Broad shoulders', 'Battle-ready stance']
        },
        personality: {
          traits: ['Brave', 'Strong', 'Loyal', 'Protective'],
          style: 'Armor and weapons',
          posture: 'Confident and ready'
        },
        animationStyle: 'powerful'
      }
    } else if (promptLower.includes('wizard') || promptLower.includes('mage') || promptLower.includes('sorcerer')) {
      characterTemplate = {
        name: 'Ancient Wizard',
        description: 'A wise magic user with arcane knowledge',
        physicalFeatures: {
          height: 'Tall',
          weight: 'Slender',
          bodyType: 'Thin',
          hair: 'Long white beard',
          eyes: 'Piercing blue',
          skin: 'Pale',
          distinctiveFeatures: ['Staff', 'Robe', 'Wise expression', 'Long fingers']
        },
        personality: {
          traits: ['Wise', 'Patient', 'Knowledgeable', 'Mysterious'],
          style: 'Robes and arcane symbols',
          posture: 'Thoughtful and deliberate'
        },
        animationStyle: 'magical'
      }
    } else if (promptLower.includes('elf') || promptLower.includes('fairy') || prompt.includes('magical')) {
      characterTemplate = {
        name: 'Ethereal Elf',
        description: 'A graceful magical being from ancient forests',
        physicalFeatures: {
          height: 'Tall and slender',
          weight: 'Light',
          bodyType: 'Slim',
          hair: 'Long silver',
          eyes: 'Bright green',
          skin: 'Fair',
          distinctiveFeatures: ['Pointed ears', 'Graceful movements', 'Nature affinity']
        },
        personality: {
          traits: ['Graceful', 'Wise', 'Nature-loving', 'Mysterious'],
          style: 'Nature-inspired clothing',
          posture: 'Elegant and poised'
        },
        animationStyle: 'graceful'
      }
    } else if (promptLower.includes('robot') || promptLower.includes('cyborg') || promptLower.includes('android')) {
      characterTemplate = {
        name: 'Advanced Android',
        description: 'A sophisticated robotic being with advanced AI',
        physicalFeatures: {
          height: 'Average human height',
          weight: 'Heavy metallic',
          bodyType: 'Mechanical',
          hair: 'None',
          eyes: 'Glowing blue',
          skin: 'Metallic silver',
          distinctiveFeatures: ['LED displays', 'Hydraulic joints', 'Sleek design', 'Glowing elements']
        },
        personality: {
          traits: ['Logical', 'Efficient', 'Curious', 'Precise'],
          style: 'Futuristic and sleek',
          posture: 'Mechanical and precise'
        },
        animationStyle: 'robotic'
      }
    }

    return characterTemplate
  }

  const getAnimationVariant = (type: AnimationType) => {
    switch (type) {
      case 'idle':
        return {
          y: [0, -5, 0],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }
      case 'walk':
        return {
          x: [0, 20, 0],
          y: [0, -2, 0],
          transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
        }
      case 'run':
        return {
          x: [0, 30, 0],
          y: [0, -10, 0],
          transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
        }
      case 'jump':
        return {
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
          transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
        }
      case 'dance':
        return {
          rotate: [0, 10, -10, 0],
          y: [0, -10, 0],
          transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
        }
      case 'attack':
        return {
          x: [0, 15, 0],
          scale: [1, 1.2, 1],
          transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' }
        }
      case 'castSpell':
        return {
          scale: [1, 1.3, 1],
          opacity: [1, 0.8, 1],
          transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
        }
      case 'greet':
        return {
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
          transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
        }
      default:
        return {}
    }
  }

  const handleAnimationChange = async (type: AnimationType) => {
    setAnimationType(type)
    await controls.start(getAnimationVariant(type))
  }

  const quickCharacterExamples = [
    {
      name: 'Medieval Knight',
      prompt: 'A tall muscular knight in full plate armor with a broad sword, scar on face, brown hair and beard, battle-worn but honorable'
    },
    {
      name: 'Forest Elf',
      prompt: 'A graceful elf with pointed ears, long silver hair, green eyes, slender build, wearing nature-inspired clothing, mystical and agile'
    },
    {
      name: 'Future Android',
      prompt: 'A sleek humanoid robot with metallic silver body, glowing blue eyes, advanced hydraulics, logical personality, futuristic design'
    },
    {
      name: 'Ancient Wizard',
      prompt: 'An old wise wizard with long white beard, blue eyes, tall thin frame, wearing robes with arcane symbols, staff in hand'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
          <span className="text-lg">👤</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Character Creator</h2>
          <p className="text-gray-400">Describe any character and see them come to life with animations</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your character in detail... Example: 'A tall muscular warrior with scarred face, wearing heavy armor, brown hair and beard, battle-ready stance'"
          className="w-full h-32 p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
        
        <button
          onClick={generateCharacter}
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Character...
            </div>
          ) : (
            'Generate Character'
          )}
        </button>
      </div>

      {/* Quick Character Examples */}
      <div className="bg-black/30 rounded-2xl p-4 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-3">Quick Examples - Click to Try</h4>
        <div className="grid grid-cols-2 gap-2">
          {quickCharacterExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setPrompt(example.prompt)
                setTimeout(() => generateCharacter(), 100)
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-semibold text-sm group-hover:text-green-300 transition-colors">
                  {example.name}
                </span>
              </div>
              <span className="text-gray-400 text-xs">{example.prompt.substring(0, 50)}...</span>
            </button>
          ))}
        </div>
      </div>

      {/* Character Display */}
      {character && (
        <div className="space-y-6">
          <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Character Visual */}
              <div className="lg:col-span-1">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={controls}
                    className="w-48 h-64 rounded-2xl border-4 border-green-500/30 bg-gradient-to-br from-green-900/20 to-emerald-900/20 flex items-center justify-center relative overflow-hidden"
                  >
                    {generatedImage ? (
                      <img 
                        src={generatedImage} 
                        alt="Generated character" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <span className="text-4xl">👤</span>
                        <p className="text-sm mt-2">Character Visual</p>
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Animation Controls */}
                  <div className="mt-4 w-full">
                    <h4 className="text-white font-semibold mb-2 text-center">Animations</h4>
                    <div className="grid grid-cols-4 gap-1">
                      {(['idle', 'walk', 'run', 'jump', 'dance', 'attack', 'castSpell', 'greet'] as AnimationType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleAnimationChange(type)}
                          className={`p-2 rounded text-xs font-semibold transition-colors ${
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
                </div>
              </div>

              {/* Character Details */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{character.name}</h3>
                  <p className="text-gray-300">{character.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Physical Features */}
                  <div className="bg-black/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Physical Features</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Height:</span>
                        <span className="text-white">{character.physicalFeatures.height}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Weight:</span>
                        <span className="text-white">{character.physicalFeatures.weight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Body Type:</span>
                        <span className="text-white">{character.physicalFeatures.bodyType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hair:</span>
                        <span className="text-white">{character.physicalFeatures.hair}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Eyes:</span>
                        <span className="text-white">{character.physicalFeatures.eyes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Skin:</span>
                        <span className="text-white">{character.physicalFeatures.skin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Personality */}
                  <div className="bg-black/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Personality & Style</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">Traits:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {character.personality.traits.map((trait, index) => (
                            <span key={index} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Style:</span>
                        <p className="text-white text-sm mt-1">{character.personality.style}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Posture:</span>
                        <p className="text-white text-sm mt-1">{character.personality.posture}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Distinctive Features */}
                {character.physicalFeatures.distinctiveFeatures.length > 0 && (
                  <div className="bg-black/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Distinctive Features</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {character.physicalFeatures.distinctiveFeatures.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-green-900/30 border border-green-700 rounded-xl p-4">
        <h4 className="text-white font-semibold mb-2">💡 Character Creation Tips</h4>
        <ul className="text-green-200 text-sm space-y-1">
          <li>• <strong>Be descriptive:</strong> "tall muscular warrior with scarred face" vs "strong guy"</li>
          <li>• <strong>Include physical details:</strong> height, weight, hair, eyes, skin, distinctive features</li>
          <li>• <strong>Add personality:</strong> clothing style, posture, personality traits</li>
          <li>• <strong>Try archetypes:</strong> warrior, wizard, elf, robot, detective, athlete</li>
        </ul>
      </div>
    </div>
  )
}