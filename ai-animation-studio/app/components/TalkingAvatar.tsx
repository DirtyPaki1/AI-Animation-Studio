'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'

export default function TalkingAvatar() {
  const [text, setText] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [info, setInfo] = useState<string>('')
  const mouthControls = useAnimation()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = async () => {
    if (!text.trim()) return
    setSpeaking(true)
    setError('')
    setInfo('')
    
    try {
      console.log('Attempting to generate speech...')
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          type: 'speech'
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('API response:', data)
      
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl)
        setInfo('Using AI-generated speech')
        startMouthAnimation()
      } else {
        throw new Error('Unexpected response from server')
      }
    } catch (error) {
      console.error('API request failed:', error)
      setInfo('Connection failed. Using browser speech synthesis.')
      fallbackSpeechSynthesis(text)
    }
  }

  const fallbackSpeechSynthesis = (speechText: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Speech synthesis not supported in this browser')
      setSpeaking(false)
      return
    }

    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(speechText)
    utterance.rate = 0.8
    utterance.pitch = 1
    utterance.volume = 1

    startMouthAnimation()

    utterance.onend = () => {
      stopMouthAnimation()
      setSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      stopMouthAnimation()
      setSpeaking(false)
      setError('Speech synthesis failed: ' + event.error)
    }

    utterance.onstart = () => {
      setInfo('Using browser speech synthesis')
    }

    speechSynthesis.speak(utterance)
  }

  const startMouthAnimation = () => {
    mouthControls.start({
      scaleY: [1, 0.3, 1],
      transition: {
        duration: 0.2,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    })
  }

  const stopMouthAnimation = () => {
    mouthControls.stop()
    mouthControls.set({ scaleY: 1 })
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    
    stopMouthAnimation()
    setSpeaking(false)
  }

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      
      audio.onended = () => {
        stopMouthAnimation()
        setSpeaking(false)
      }
      
      audio.onerror = () => {
        console.error('Audio playback error')
        stopMouthAnimation()
        setSpeaking(false)
        setError('Failed to play audio')
      }
      
      audio.play().catch(error => {
        console.error('Audio play failed:', error)
        setError('Failed to play audio: ' + error.message)
        setSpeaking(false)
      })
    }
  }, [audioUrl])

  const quickExamples = [
    "Hello! Welcome to AI Animation Studio!",
    "This is a demonstration of text to speech technology.",
    "Create amazing animations with artificial intelligence.",
    "The future of content creation is here."
  ]

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
        
        {/* Quick Examples */}
        <div className="grid grid-cols-2 gap-2">
          {quickExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => setText(example)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors"
            >
              <span className="text-white text-sm">{example.substring(0, 30)}...</span>
            </button>
          ))}
        </div>

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

        {/* Information Message */}
        {info && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-3">
            <p className="text-blue-200 text-sm">{info}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-3">
            <p className="text-red-200 text-sm">
              <strong>Note:</strong> {error}
            </p>
          </div>
        )}
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

      {/* Setup Instructions */}
      {!process.env.OPENAI_API_KEY && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
          <h4 className="text-yellow-200 font-semibold mb-2">Setup Required</h4>
          <p className="text-yellow-200 text-sm mb-2">
            To enable AI-generated speech, add your OpenAI API key to <code className="bg-black/50 px-1 rounded">.env.local</code>:
          </p>
          <code className="block bg-black/50 p-2 rounded text-yellow-100 text-xs mb-2">
            OPENAI_API_KEY=sk-your-key-here
          </code>
          <p className="text-yellow-200 text-sm">
            Currently using browser speech synthesis. The avatar will still talk, but with system voices.
          </p>
        </div>
      )}
    </div>
  )
}