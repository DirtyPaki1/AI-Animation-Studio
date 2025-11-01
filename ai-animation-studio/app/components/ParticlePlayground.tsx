'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function ParticleSystem({ config, isGenerating }: { config: any, isGenerating: boolean }) {
  const points = useRef<THREE.Points>(null!)
  const particleCountRef = useRef(0)
  
  // Memoize the geometry creation to prevent recreation on every render
  const { positions, colors, sizes, particleCount } = useMemo(() => {
    const particleCount = Math.max(50, Math.min(config.intensity * 40, 2000))
    particleCountRef.current = particleCount
    
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    const color = new THREE.Color(config.color)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 8
      positions[i3 + 1] = (Math.random() - 0.5) * 8
      positions[i3 + 2] = (Math.random() - 0.5) * 8
      
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
      
      sizes[i] = Math.random() * 0.08 + 0.02
    }
    
    return { positions, colors, sizes, particleCount }
  }, [config.color, config.intensity])

  // Create geometry once and update attributes when needed
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geom
  }, [positions, colors, sizes])

  useFrame((state) => {
    if (isGenerating || !points.current) return
    
    const time = state.clock.getElapsedTime()
    const positionAttribute = points.current.geometry.attributes.position
    const positions = positionAttribute.array as Float32Array
    
    for (let i = 0; i < particleCountRef.current; i++) {
      const i3 = i * 3
      const x = positions[i3]
      const y = positions[i3 + 1]
      const z = positions[i3 + 2]
      
      switch (config.motion) {
        case 'float':
          positions[i3 + 1] = y + Math.sin(time * 0.5 + x) * 0.015
          positions[i3] = x + Math.cos(time * 0.3 + z) * 0.008
          break
        case 'explode':
          const explodeFactor = 1 + Math.sin(time * 2 + i * 0.1) * 0.03
          positions[i3] = x * explodeFactor
          positions[i3 + 1] = y * explodeFactor
          positions[i3 + 2] = z * explodeFactor
          break
        case 'vortex':
          const radius = Math.sqrt(x * x + z * z)
          const angle = time * 0.8 + radius * 0.5
          positions[i3] = Math.cos(angle) * radius
          positions[i3 + 2] = Math.sin(angle) * radius
          positions[i3 + 1] = y + Math.sin(time * 0.5 + i) * 0.01
          break
        case 'pulse':
          const pulse = Math.sin(time * 2) * 0.3 + 0.7
          positions[i3] = x * pulse
          positions[i3 + 1] = y * pulse
          positions[i3 + 2] = z * pulse
          break
        case 'rise':
          positions[i3 + 1] = y + 0.015
          if (positions[i3 + 1] > 4) positions[i3 + 1] = -4
          positions[i3] = x + Math.sin(time * 0.5 + i) * 0.004
          break
        case 'orbit':
          const orbitTime = time * 0.4 + i * 0.01
          const distance = 3 + Math.sin(i) * 1
          positions[i3] = Math.cos(orbitTime) * distance
          positions[i3 + 2] = Math.sin(orbitTime) * distance
          positions[i3 + 1] = Math.sin(orbitTime * 1.5) * 1.5
          break
        case 'wave':
          positions[i3 + 1] = y + Math.sin(time * 2 + x * 2) * 0.02
          positions[i3] = x + Math.cos(time * 1.5 + z) * 0.005
          break
      }
    }
    
    positionAttribute.needsUpdate = true
  })

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Quick presets for common particle effects
const QUICK_PRESETS = [
  { 
    name: 'Snowfall', 
    prompt: 'gentle snowfall in winter forest',
    config: { color: '#ffffff', motion: 'rise', intensity: 5 }
  },
  { 
    name: 'Fireflies', 
    prompt: 'fireflies dancing in summer night',
    config: { color: '#ffff00', motion: 'float', intensity: 4 }
  },
  { 
    name: 'Galaxy', 
    prompt: 'swirling galaxy of stars',
    config: { color: '#8844ff', motion: 'vortex', intensity: 6 }
  },
  { 
    name: 'Energy', 
    prompt: 'blue energy particles swirling',
    config: { color: '#00ffff', motion: 'orbit', intensity: 5 }
  },
  { 
    name: 'Fire', 
    prompt: 'campfire embers floating upward',
    config: { color: '#ff4400', motion: 'rise', intensity: 4 }
  },
  { 
    name: 'Magic', 
    prompt: 'magical fairy dust sparkling',
    config: { color: '#ff00ff', motion: 'float', intensity: 3 }
  },
  { 
    name: 'Explosion', 
    prompt: 'energy explosion with particles',
    config: { color: '#ffff00', motion: 'explode', intensity: 7 }
  },
  { 
    name: 'Ocean', 
    prompt: 'bubbles rising in blue ocean',
    config: { color: '#00aaff', motion: 'rise', intensity: 4 }
  }
]

// Enhanced local interpretation that works immediately
const enhancedInterpretPrompt = (userPrompt: string) => {
  const prompt = userPrompt.toLowerCase();
  
  // Default configuration
  let config = {
    color: '#00ff88',
    motion: 'float',
    intensity: 5
  };

  // Color detection with context
  if (prompt.includes('snow') || prompt.includes('ice') || prompt.includes('winter') || prompt.includes('white')) {
    config.color = '#ffffff';
  } else if (prompt.includes('fire') || prompt.includes('lava') || prompt.includes('burn') || prompt.includes('red')) {
    config.color = '#ff4400';
  } else if (prompt.includes('water') || prompt.includes('ocean') || prompt.includes('sea') || prompt.includes('blue')) {
    config.color = '#00aaff';
  } else if (prompt.includes('nature') || prompt.includes('forest') || prompt.includes('grass') || prompt.includes('green')) {
    config.color = '#00ff44';
  } else if (prompt.includes('magic') || prompt.includes('fairy') || prompt.includes('enchanted') || prompt.includes('purple')) {
    config.color = '#8844ff';
  } else if (prompt.includes('energy') || prompt.includes('electric') || prompt.includes('power') || prompt.includes('cyan')) {
    config.color = '#00ffff';
  } else if (prompt.includes('sun') || prompt.includes('gold') || prompt.includes('light') || prompt.includes('yellow')) {
    config.color = '#ffff00';
  } else if (prompt.includes('bubble') || prompt.includes('pink') || prompt.includes('cotton')) {
    config.color = '#ff00ff';
  } else if (prompt.includes('orange')) {
    config.color = '#ff8800';
  }
  
  // Motion detection with context
  if (prompt.includes('galaxy') || prompt.includes('vortex') || prompt.includes('swirl') || prompt.includes('spin')) {
    config.motion = 'vortex';
  } else if (prompt.includes('explosion') || prompt.includes('burst') || prompt.includes('bang') || prompt.includes('explode')) {
    config.motion = 'explode';
  } else if (prompt.includes('heartbeat') || prompt.includes('pulse') || prompt.includes('beat') || prompt.includes('throb')) {
    config.motion = 'pulse';
  } else if (prompt.includes('snow') || prompt.includes('rain') || prompt.includes('fall') || prompt.includes('bubble') || prompt.includes('rise')) {
    config.motion = 'rise';
  } else if (prompt.includes('orbit') || prompt.includes('planet') || prompt.includes('solar') || prompt.includes('circle')) {
    config.motion = 'orbit';
  } else if (prompt.includes('wave') || prompt.includes('water') || prompt.includes('sea')) {
    config.motion = 'wave';
  } else if (prompt.includes('dance') || prompt.includes('float') || prompt.includes('gentle') || prompt.includes('fly')) {
    config.motion = 'float';
  }
  
  // Intensity based on context
  if (prompt.includes('gentle') || prompt.includes('soft') || prompt.includes('calm') || prompt.includes('light')) {
    config.intensity = 3;
  } else if (prompt.includes('intense') || prompt.includes('storm') || prompt.includes('chaos') || prompt.includes('heavy')) {
    config.intensity = 7;
  } else if (prompt.includes('explosion') || prompt.includes('violent') || prompt.includes('wild') || prompt.includes('extreme')) {
    config.intensity = 8;
  } else if (prompt.includes('subtle') || prompt.includes('few')) {
    config.intensity = 2;
  }

  return config;
}

export default function ParticlePlayground() {
  const [prompt, setPrompt] = useState('')
  const [config, setConfig] = useState({
    color: '#00ff88',
    motion: 'float',
    intensity: 5
  })
  const [loading, setLoading] = useState(false)
  const [lastPrompt, setLastPrompt] = useState('')
  const [showPresets, setShowPresets] = useState(true)

  const handleGenerateParticles = async (userPrompt?: string) => {
    const finalPrompt = userPrompt || prompt;
    if (!finalPrompt.trim()) return
    
    setLoading(true)
    setLastPrompt(finalPrompt)
    setShowPresets(false)
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: finalPrompt,
          type: 'particles'
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setConfig(data.config)
          return
        }
      }
      
      // Use enhanced local interpretation as fallback
      const localConfig = enhancedInterpretPrompt(finalPrompt)
      setConfig(localConfig)
      
    } catch (error) {
      console.error('Particle generation error:', error)
      const fallbackConfig = enhancedInterpretPrompt(finalPrompt)
      setConfig(fallbackConfig)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setPrompt(preset.prompt)
    setConfig(preset.config)
    setLastPrompt(preset.prompt)
    setShowPresets(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerateParticles()
    }
  }

  // Debounced search - update particles as you type
  useEffect(() => {
    if (prompt.trim() && prompt !== lastPrompt) {
      const timer = setTimeout(() => {
        handleGenerateParticles(prompt);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [prompt]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
          <span className="text-lg">✨</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Particle Playground</h2>
          <p className="text-gray-400">Type anything and see instant particle effects!</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Try: 'snow', 'fire', 'magic', 'galaxy', 'energy'..."
            className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-24"
          />
          <button
            onClick={() => handleGenerateParticles()}
            disabled={loading || !prompt.trim()}
            className="absolute right-2 top-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-xl transition-all duration-200"
          >
            {loading ? '...' : 'Go'}
          </button>
        </div>

        {/* Quick Examples */}
        {showPresets && (
          <div className="bg-black/30 rounded-2xl p-4 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-3">Quick Examples - Click to Try</h4>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPreset(preset)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: preset.config.color }}
                    />
                    <span className="text-white font-semibold text-sm group-hover:text-orange-300 transition-colors">
                      {preset.name}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">{preset.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3D Canvas */}
      <div className="bg-black/30 rounded-2xl border border-white/10 overflow-hidden">
        <div className="h-96 relative">
          <Canvas 
            camera={{ position: [0, 0, 8], fov: 75 }}
            gl={{ antialias: false }}
          >
            <color attach="background" args={['#0f172a']} />
            <OrbitControls enableZoom={true} enablePan={true} />
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
            <ParticleSystem config={config} isGenerating={loading} />
          </Canvas>
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p>Creating {prompt} particles...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Configuration Display */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white">Live Preview</h4>
            {lastPrompt && (
              <p className="text-gray-400 text-sm">"{lastPrompt}"</p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-black/50 rounded-lg p-3">
              <span className="text-gray-400">Color:</span>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-white font-mono text-xs">{config.color}</span>
              </div>
            </div>
            <div className="bg-black/50 rounded-lg p-3">
              <span className="text-gray-400">Motion:</span>
              <span className="text-white ml-2 capitalize">{config.motion}</span>
            </div>
            <div className="bg-black/50 rounded-lg p-3">
              <span className="text-gray-400">Particles:</span>
              <span className="text-white ml-2">{Math.max(50, config.intensity * 40)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Search Tips */}
      <div className="bg-green-900/30 border border-green-700 rounded-xl p-4">
        <h4 className="text-white font-semibold mb-2">🚀 Instant Search - Just Start Typing!</h4>
        <ul className="text-green-200 text-sm space-y-1">
          <li>• <strong>Try these words:</strong> snow, fire, magic, galaxy, energy, water, sparkle</li>
          <li>• <strong>Add colors:</strong> blue fire, red energy, purple magic</li>
          <li>• <strong>Motion words:</strong> swirling, floating, exploding, pulsing</li>
          <li>• <strong>It works instantly!</strong> No need to click generate</li>
        </ul>
      </div>
    </div>
  )
}