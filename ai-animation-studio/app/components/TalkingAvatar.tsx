'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'

export default function TalkingAvatar() {
  const [text, setText] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const mouthControls = useAnimation()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = async () => {
    if (!text.trim()) return
    setSpeaking(true)
    
    try {
      const response = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      
      const data = await response.json()
      
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl)
        
        // Start mouth animation
        mouthControls.start({
          scaleY: [1, 0.3, 1],
          transition: {
            duration: 0.2,
            repeat: Infinity,
            repeatType: 'reverse',
          },
        })
      }
    } catch (error) {
      console.error('Error generating speech:', error)
      alert('Failed to generate speech')
    }
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    mouthControls.stop()
    mouthControls.set({ scaleY: 1 })
    setSpeaking(false)
  }

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      
      audio.onended = () => {
        mouthControls.stop()
        mouthControls.set({ scaleY: 1 })
        setSpeaking(false)
      }
      
      audio.play()
    }
  }, [audioUrl, mouthControls])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <span className="text-lg">🗣️</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Talking Avatar</h2>
          <p className="text-gray-400">Generate speech and watch the avatar talk</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text for the avatar to speak... (e.g., 'Hello! Welcome to AI Animation Studio!')"
          className="w-full h-24 p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        
        <div className="flex gap-3">
          <button
            onClick={speak}
            disabled={speaking || !text.trim()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200"
          >
            {speaking ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Speaking...
              </div>
            ) : (
              'Generate Speech'
            )}
          </button>
          
          {speaking && (
            <button
              onClick={stopSpeaking}
              className="px-6 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-colors"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Avatar Display */}
      <div className="flex justify-center mt-8">
        <div className="relative">
          {/* Avatar Head */}
          <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center relative">
            {/* Eyes */}
            <div className="absolute top-12 left-12 w-6 h-6 bg-white rounded-full">
              <div className="w-3 h-3 bg-black rounded-full absolute top-1 left-1" />
            </div>
            <div className="absolute top-12 right-12 w-6 h-6 bg-white rounded-full">
              <div className="w-3 h-3 bg-black rounded-full absolute top-1 left-1" />
            </div>
            
            {/* Mouth */}
            <motion.div
              animate={mouthControls}
              className="absolute bottom-12 w-16 h-8 bg-black rounded-full"
            />
          </div>
          
          {/* Status Indicator */}
          <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${speaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        </div>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="bg-black/30 rounded-2xl p-4 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-3">Generated Audio</h4>
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  )
}