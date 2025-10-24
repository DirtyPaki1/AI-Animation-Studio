'use client'
import { useState, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function ParticleSystem({ config }: { config: any }) {
  const points = useRef<THREE.Points>(null!)
  
  const particleCount = Math.max(100, config.intensity * 50)
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    const color = new THREE.Color(config.color)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10
      positions[i + 1] = (Math.random() - 0.5) * 10
      positions[i + 2] = (Math.random() - 0.5) * 10
      
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
    }
    
    return [positions, colors]
  }, [particleCount, config.color])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const positions = points.current.geometry.attributes.position.array as Float32Array
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      const i3 = i
      const x = positions[i3]
      const y = positions[i3 + 1]
      const z = positions[i3 + 2]
      
      switch (config.motion) {
        case 'float':
          positions[i3 + 1] = y + Math.sin(time + x) * 0.01
          break
        case 'explode':
          positions[i3] = x * (1 + Math.sin(time) * 0.01)
          positions[i3 + 1] = y * (1 + Math.sin(time) * 0.01)
          positions[i3 + 2] = z * (1 + Math.sin(time) * 0.01)
          break
        case 'vortex':
          positions[i3] = x * Math.cos(time * 0.5) - z * Math.sin(time * 0.5)
          positions[i3 + 2] = x * Math.sin(time * 0.5) + z * Math.cos(time * 0.5)
          positions[i3 + 1] = y + Math.sin(time + x) * 0.02
          break
        case 'pulse':
          const scale = 1 + Math.sin(time * 2) * 0.2
          positions[i3] = x * scale
          positions[i3 + 1] = y * scale
          positions[i3 + 2] = z * scale
          break
      }
    }
    
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

export default function ParticlePlayground() {
  const [prompt, setPrompt] = useState('')
  const [config, setConfig] = useState({
    color: '#00ff88',
    motion: 'float',
    intensity: 5
  })
  const [loading, setLoading] = useState(false)

  const generateParticles = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    
    try {
      const response = await fetch('/api/particles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      
      const data = await response.json()
      setConfig(data.config)
    } catch (error) {
      console.error('Error generating particles:', error)
      alert('Failed to generate particle configuration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
          <span className="text-lg">✨</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Particle Playground</h2>
          <p className="text-gray-400">Create mesmerizing particle effects with AI</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your particle scene... (e.g., 'A swirling vortex of blue energy particles in space')"
          className="w-full h-24 p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
        
        <button
          onClick={generateParticles}
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Particles...
            </div>
          ) : (
            'Generate Particle Scene'
          )}
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="bg-black/30 rounded-2xl border border-white/10 overflow-hidden">
        <div className="h-96">
          <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
            <color attach="background" args={['#0f172a']} />
            <OrbitControls enableZoom={true} enablePan={true} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <ParticleSystem config={config} />
          </Canvas>
        </div>
        
        {/* Configuration Display */}
        <div className="p-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-black/50 rounded-lg p-3">
              <span className="text-gray-400">Color:</span>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-white font-mono">{config.color}</span>
              </div>
            </div>
            <div className="bg-black/50 rounded-lg p-3">
              <span className="text-gray-400">Motion:</span>
              <span className="text-white ml-2 capitalize">{config.motion}</span>
            </div>
            <div className="bg-black/50 rounded-lg p-3">
              <span className="text-gray-400">Intensity:</span>
              <span className="text-white ml-2">{config.intensity}/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-black/30 rounded-2xl p-4 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-3">Quick Presets</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Floating Stars', color: '#ffffff', motion: 'float', intensity: 3 },
            { name: 'Energy Vortex', color: '#00ff88', motion: 'vortex', intensity: 8 },
            { name: 'Cosmic Explosion', color: '#ff4444', motion: 'explode', intensity: 10 },
            { name: 'Pulsing Orbs', color: '#8844ff', motion: 'pulse', intensity: 6 },
          ].map((preset, index) => (
            <button
              key={index}
              onClick={() => setConfig(preset)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: preset.color }}
                />
                <span className="text-white font-semibold text-sm">{preset.name}</span>
              </div>
              <span className="text-gray-400 text-xs">{preset.motion}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}