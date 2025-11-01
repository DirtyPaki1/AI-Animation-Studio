import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SceneData {
  concept?: {
    title: string;
    description: string;
    keyframes: string[];
    duration: number;
    easing: string;
  };
  character?: {
    name: string;
    description: string;
    physicalFeatures: {
      height: string;
      weight: string;
      bodyType: string;
      hair: string;
      eyes: string;
      skin: string;
      distinctiveFeatures: string[];
    };
    personality: {
      traits: string[];
      style: string;
      posture: string;
    };
    animationStyle: string;
  };
  animationType?: string;
  config?: {
    color: string;
    motion: string;
    intensity: number;
  };
  scene?: {
    description: string;
    characters: any[];
    environment: string;
    mood: string;
    actions: string[];
  };
  error?: string;
}

interface AICharacterAnimatorProps {}

const AICharacterAnimator: React.FC<AICharacterAnimatorProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sceneData, setSceneData] = useState<SceneData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentKeyframe, setCurrentKeyframe] = useState(0);
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<'character' | 'scene' | 'animation' | 'particles'>('character');
  const [generatedCharacters, setGeneratedCharacters] = useState<any[]>([]);
  const [characterActions, setCharacterActions] = useState<{[key: number]: string}>({});

  const generateContent = async () => {
    if (!userPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSceneData(null);

    try {
      let apiType = 'character-description';
      let prompt = userPrompt;

      // Map UI types to API types
      switch (selectedType) {
        case 'character':
          apiType = 'character-description';
          prompt = `Create a character: ${userPrompt}`;
          break;
        case 'scene':
          apiType = 'character-animation';
          prompt = `Create a scene with characters: ${userPrompt}`;
          break;
        case 'animation':
          apiType = 'animation';
          prompt = `Create an animation: ${userPrompt}`;
          break;
        case 'particles':
          apiType = 'particles';
          prompt = `Create particle effects: ${userPrompt}`;
          break;
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          type: apiType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('API Response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.character && !data.concept && !data.animationType && !data.config && !data.scene) {
        throw new Error('No valid data received from API');
      }

      setSceneData(data);

      if (data.character) {
        setGeneratedCharacters(prev => [...prev, data.character]);
        // Set default action for new character
        setCharacterActions(prev => ({
          ...prev,
          [generatedCharacters.length]: 'idle'
        }));
      }

      if (data.concept?.keyframes) {
        animateKeyframes(data.concept.keyframes, data.concept.duration);
      }

    } catch (err) {
      console.error('Error generating content:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSceneWithCharacters = async () => {
    if (generatedCharacters.length === 0) {
      setError('Please generate at least one character first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Create a dynamic scene with these characters: ${generatedCharacters.map(c => c.name).join(', ')}. Scene description: ${userPrompt || 'characters interacting in a fantasy world'}. Include actions like running, jumping, fighting, casting spells, etc.`,
          type: 'character-animation',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSceneData(data);

      // Assign random actions to characters based on scene
      const actions = ['idle', 'walk', 'run', 'jump', 'attack', 'castSpell', 'dance', 'greet'];
      const newActions: {[key: number]: string} = {};
      generatedCharacters.forEach((_, index) => {
        newActions[index] = actions[Math.floor(Math.random() * actions.length)];
      });
      setCharacterActions(newActions);

    } catch (err) {
      console.error('Error generating scene:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate scene');
    } finally {
      setIsLoading(false);
    }
  };

  const setCharacterAction = (characterIndex: number, action: string) => {
    setCharacterActions(prev => ({
      ...prev,
      [characterIndex]: action
    }));
  };

  const animateKeyframes = (keyframes: string[], duration: number) => {
    const interval = (duration * 1000) / keyframes.length;
    let frameIndex = 0;
    
    const intervalId = setInterval(() => {
      frameIndex = (frameIndex + 1) % keyframes.length;
      setCurrentKeyframe(frameIndex);
    }, interval);

    return () => clearInterval(intervalId);
  };

  const getCharacterAnimation = (characterIndex: number) => {
    const action = characterActions[characterIndex] || 'idle';
    
    switch (action) {
      case 'run':
        return {
          x: [0, 100, 0],
          y: [0, -5, 0],
          rotate: [0, 5, 0, -5, 0],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'walk':
        return {
          x: [0, 50, 0],
          y: [0, -2, 0],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'jump':
        return {
          y: [0, -60, 0],
          scale: [1, 1.1, 1],
          transition: {
            duration: 1,
            repeat: Infinity,
            ease: "easeOut"
          }
        };
      case 'attack':
        return {
          x: [0, 20, 0],
          y: [0, -10, 0],
          rotate: [0, -15, 15, 0],
          scale: [1, 1.2, 1],
          transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'castSpell':
        return {
          y: [0, -10, 0],
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'dance':
        return {
          y: [0, -20, 0],
          rotate: [0, 10, -10, 10, 0],
          scale: [1, 1.05, 1],
          transition: {
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'greet':
        return {
          y: [0, -10, 0],
          scale: [1, 1.05, 1],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      default: // idle
        return {
          y: [0, -5, 0],
          scale: [1, 1.02, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
    }
  };

  const renderCharacter = (character: any, index: number, inScene: boolean = false) => {
    const action = characterActions[index] || 'idle';
    
    return (
      <motion.div
        key={index}
        className="character"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={inScene ? getCharacterAnimation(index) : { scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        style={{
          width: inScene ? '70px' : '80px',
          height: inScene ? '100px' : '120px',
          background: getCharacterColor(character.animationStyle),
          borderRadius: '10px',
          position: 'relative',
          margin: '10px',
          cursor: inScene ? 'pointer' : 'default',
          border: inScene ? `3px solid ${getActionColor(action)}` : 'none',
          boxShadow: inScene ? `0 0 10px ${getActionColor(action)}` : 'none',
        }}
        whileHover={{ scale: inScene ? 1.1 : 1.05 }}
        whileTap={{ scale: inScene ? 0.95 : 0.95 }}
        onClick={inScene ? () => cycleCharacterAction(index) : undefined}
      >
        <div className="character-features">
          <div 
            className="character-head"
            style={{
              width: inScene ? '25px' : '30px',
              height: inScene ? '25px' : '30px',
              background: getSkinColor(character.physicalFeatures.skin),
              borderRadius: '50%',
              margin: inScene ? '3px auto' : '5px auto',
              border: '2px solid #333'
            }}
          />
          <div 
            className="character-body"
            style={{
              width: inScene ? '40px' : '50px',
              height: inScene ? '30px' : '40px',
              background: getCharacterOutfit(character.personality.style),
              borderRadius: '5px',
              margin: '0 auto',
              position: 'relative'
            }}
          />
          {inScene && (
            <div 
              className="action-effect"
              style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '20px',
                filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.8))'
              }}
            >
              {getActionEmoji(action)}
            </div>
          )}
          <div 
            className="character-name"
            style={{
              position: 'absolute',
              bottom: '5px',
              left: '0',
              right: '0',
              textAlign: 'center',
              fontSize: inScene ? '9px' : '10px',
              color: 'white',
              fontWeight: 'bold',
              textShadow: '1px 1px 1px rgba(0,0,0,0.5)'
            }}
          >
            {character.name.split(' ')[0]}
          </div>
          {inScene && (
            <div 
              className="character-action"
              style={{
                position: 'absolute',
                top: '-25px',
                left: '0',
                right: '0',
                textAlign: 'center',
                fontSize: '10px',
                color: getActionColor(action),
                fontWeight: 'bold',
                textShadow: '1px 1px 1px rgba(0,0,0,0.8)'
              }}
            >
              {action}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const cycleCharacterAction = (characterIndex: number) => {
    const actions = ['idle', 'walk', 'run', 'jump', 'attack', 'castSpell', 'dance', 'greet'];
    const currentAction = characterActions[characterIndex] || 'idle';
    const currentIndex = actions.indexOf(currentAction);
    const nextAction = actions[(currentIndex + 1) % actions.length];
    setCharacterAction(characterIndex, nextAction);
  };

  const getActionEmoji = (action: string) => {
    const emojis: {[key: string]: string} = {
      'run': '🏃',
      'walk': '🚶',
      'jump': '🦘',
      'attack': '⚔️',
      'castSpell': '✨',
      'dance': '💃',
      'greet': '👋',
      'idle': '💤'
    };
    return emojis[action] || '💤';
  };

  const getActionColor = (action: string) => {
    const colors: {[key: string]: string} = {
      'run': '#e74c3c',
      'walk': '#3498db',
      'jump': '#f39c12',
      'attack': '#c0392b',
      'castSpell': '#9b59b6',
      'dance': '#e84393',
      'greet': '#27ae60',
      'idle': '#95a5a6'
    };
    return colors[action] || '#95a5a6';
  };

  const getSkinColor = (skin: string) => {
    const colors: { [key: string]: string } = {
      'Tanned': '#d2b48c',
      'Pale': '#f0d9b5',
      'Fair': '#ffdbac',
      'Light': '#ffdbac',
      'Olive': '#b5a642',
      'Dark': '#8d5524'
    };
    return colors[skin] || '#f0d9b5';
  };

  const getCharacterColor = (style: string) => {
    const colors: { [key: string]: string } = {
      powerful: '#e74c3c',
      magical: '#9b59b6',
      graceful: '#3498db',
      neutral: '#95a5a6',
      brave: '#e67e22',
      wise: '#2ecc71',
      mysterious: '#34495e'
    };
    return colors[style] || '#95a5a6';
  };

  const getCharacterOutfit = (style: string) => {
    const outfits: { [key: string]: string } = {
      'Armor and weapons': '#7f8c8d',
      'Robes and arcane symbols': '#8e44ad',
      'Nature-inspired clothing': '#27ae60',
      'Casual': '#bdc3c7',
      'Battle gear': '#c0392b',
      'Elegant robes': '#16a085'
    };
    return outfits[style] || '#bdc3c7';
  };

  const renderParticles = () => {
    if (!sceneData?.config) return null;

    const { config } = sceneData;
    const particleCount = config.intensity * 10;

    return (
      <div className="particles-container">
        {Array.from({ length: particleCount }).map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            style={{
              width: '6px',
              height: '6px',
              background: config.color,
              borderRadius: '50%',
              position: 'absolute',
              filter: 'blur(1px)'
            }}
            animate={{
              x: getParticleMotion(config.motion, 'x', i),
              y: getParticleMotion(config.motion, 'y', i),
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  };

  const getParticleMotion = (motionType: string, axis: 'x' | 'y', index: number) => {
    const base = index % 10;
    
    switch (motionType) {
      case 'rise':
        return axis === 'y' ? [0, -200, -200] : [base * 40 - 200, base * 40 - 200 + Math.sin(base) * 50];
      case 'float':
        return axis === 'y' ? [0, -100, 0] : [base * 30 - 150, base * 35 - 150, base * 30 - 150];
      case 'orbit':
        return axis === 'x' ? [0, 50, 0, -50, 0] : [0, 30, 50, 30, 0];
      case 'vortex':
        return axis === 'x' ? [0, 60, 0, -60, 0] : [0, 0, 60, 0, 0];
      case 'explode':
        return axis === 'x' ? [0, Math.cos(base) * 100] : [0, Math.sin(base) * 100];
      default:
        return axis === 'y' ? [0, -80, 0] : [0, 0, 0];
    }
  };

  const clearCharacters = () => {
    setGeneratedCharacters([]);
    setCharacterActions({});
  };

  const setAllCharactersAction = (action: string) => {
    const newActions: {[key: number]: string} = {};
    generatedCharacters.forEach((_, index) => {
      newActions[index] = action;
    });
    setCharacterActions(newActions);
  };

  return (
    <div className="ai-character-animator">
      <div className="controls-panel">
        <h1>AI Character & Scene Generator</h1>
        
        <div className="input-section">
          <div className="search-bar">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Describe a character, scene, or animation..."
              className="prompt-input"
              onKeyPress={(e) => e.key === 'Enter' && generateContent()}
            />
            <button 
              onClick={generateContent}
              disabled={isLoading}
              className="generate-button"
            >
              {isLoading ? 'Creating...' : 'Generate'}
            </button>
          </div>

          <div className="type-selector">
            <label>Generate:</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="type-select"
            >
              <option value="character">Character</option>
              <option value="scene">Scene</option>
              <option value="animation">Animation</option>
              <option value="particles">Particles</option>
            </select>
          </div>

          {generatedCharacters.length > 0 && (
            <div className="scene-controls">
              <button 
                onClick={generateSceneWithCharacters}
                disabled={isLoading}
                className="scene-button"
              >
                Create Scene with Characters
              </button>
              <button 
                onClick={clearCharacters}
                className="clear-button"
              >
                Clear Characters ({generatedCharacters.length})
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Characters Gallery */}
      {generatedCharacters.length > 0 && (
        <div className="characters-gallery">
          <h3>Generated Characters ({generatedCharacters.length})</h3>
          <div className="characters-grid">
            {generatedCharacters.map((character, index) => renderCharacter(character, index))}
          </div>
        </div>
      )}

      {/* Action Controls */}
      {generatedCharacters.length > 0 && (
        <div className="action-controls">
          <h3>Character Actions</h3>
          <div className="action-buttons">
            <button onClick={() => setAllCharactersAction('idle')} className="action-button idle">💤 Idle All</button>
            <button onClick={() => setAllCharactersAction('walk')} className="action-button walk">🚶 Walk All</button>
            <button onClick={() => setAllCharactersAction('run')} className="action-button run">🏃 Run All</button>
            <button onClick={() => setAllCharactersAction('jump')} className="action-button jump">🦘 Jump All</button>
            <button onClick={() => setAllCharactersAction('attack')} className="action-button attack">⚔️ Attack All</button>
            <button onClick={() => setAllCharactersAction('castSpell')} className="action-button cast">✨ Cast All</button>
            <button onClick={() => setAllCharactersAction('dance')} className="action-button dance">💃 Dance All</button>
            <button onClick={() => setAllCharactersAction('greet')} className="action-button greet">👋 Greet All</button>
          </div>
          <p className="action-hint">Click on individual characters in the scene to cycle through their actions!</p>
        </div>
      )}

      <AnimatePresence>
        {sceneData && (
          <motion.div
            className="scene-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Character Information */}
            {sceneData.character && (
              <div className="character-info">
                <h3>🎭 {sceneData.character.name}</h3>
                <p>{sceneData.character.description}</p>
                <div className="character-details">
                  <div><strong>Physical:</strong> {sceneData.character.physicalFeatures.height}, {sceneData.character.physicalFeatures.bodyType}, {sceneData.character.physicalFeatures.hair} hair, {sceneData.character.physicalFeatures.eyes} eyes</div>
                  <div><strong>Personality:</strong> {sceneData.character.personality.traits.join(', ')}</div>
                  <div><strong>Style:</strong> {sceneData.character.personality.style}</div>
                  <div><strong>Movement:</strong> {sceneData.character.animationStyle}</div>
                </div>
              </div>
            )}

            {/* Animation Concept */}
            {sceneData.concept && (
              <div className="concept-info">
                <h3>🎬 {sceneData.concept.title}</h3>
                <p>{sceneData.concept.description}</p>
                <div className="keyframes">
                  <strong>Animation Sequence:</strong>
                  <div className="keyframe-list">
                    {sceneData.concept.keyframes.map((frame, index) => (
                      <div 
                        key={index} 
                        className={`keyframe-item ${index === currentKeyframe ? 'active' : ''}`}
                      >
                        {frame}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Animation Preview Area */}
            <div className="animation-preview">
              {renderParticles()}
              
              {/* Render multiple characters in scene */}
              {generatedCharacters.length > 0 && (
                <div className="characters-in-scene">
                  {generatedCharacters.map((character, index) => (
                    <motion.div
                      key={index}
                      className="scene-character"
                    >
                      {renderCharacter(character, index, true)}
                    </motion.div>
                  ))}
                </div>
              )}

              {sceneData.animationType && (
                <div className="animation-type-badge">
                  Animation: {sceneData.animationType}
                </div>
              )}
            </div>

            {/* Debug Information */}
            <details className="debug-info">
              <summary>Debug Information</summary>
              <pre>{JSON.stringify(sceneData, null, 2)}</pre>
            </details>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .ai-character-animator {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: white;
        }

        .controls-panel {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 30px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .controls-panel h1 {
          text-align: center;
          margin-bottom: 30px;
          font-size: 2.5em;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .input-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }

        .search-bar {
          display: flex;
          gap: 15px;
          width: 100%;
          max-width: 600px;
        }

        .prompt-input {
          flex: 1;
          padding: 15px 20px;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          background: rgba(0, 0, 0, 0.7) !important;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          color: white !important;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .prompt-input::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        .prompt-input:focus {
          outline: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(0, 0, 0, 0.8) !important;
        }

        .generate-button, .scene-button, .clear-button {
          padding: 15px 30px;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          color: white;
        }

        .generate-button {
          background: linear-gradient(45deg, #ff6b6b, #ee5a24);
          min-width: 150px;
        }

        .generate-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        .generate-button:disabled {
          background: #95a5a6;
          cursor: not-allowed;
          transform: none;
        }

        .type-selector {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 16px;
        }

        .type-select {
          padding: 10px 20px;
          border-radius: 25px;
          border: none;
          background: rgba(0, 0, 0, 0.7) !important;
          font-size: 16px;
          color: white !important;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .type-select option {
          background: #2d3748;
          color: white;
          padding: 10px;
        }

        .scene-controls {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .scene-button {
          background: linear-gradient(45deg, #3498db, #2980b9);
        }

        .clear-button {
          background: linear-gradient(45deg, #e74c3c, #c0392b);
        }

        .action-controls {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .action-controls h3 {
          text-align: center;
          margin-bottom: 15px;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 10px;
        }

        .action-button {
          padding: 10px 15px;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
        }

        .action-button.idle { background: #95a5a6; }
        .action-button.walk { background: #3498db; }
        .action-button.run { background: #e74c3c; }
        .action-button.jump { background: #f39c12; }
        .action-button.attack { background: #c0392b; }
        .action-button.cast { background: #9b59b6; }
        .action-button.dance { background: #e84393; }
        .action-button.greet { background: #27ae60; }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .action-hint {
          text-align: center;
          font-size: 14px;
          opacity: 0.8;
          margin: 0;
        }

        .error-message {
          background: rgba(231, 76, 60, 0.9);
          color: white;
          padding: 15px;
          border-radius: 10px;
          text-align: center;
          margin-top: 15px;
          backdrop-filter: blur(10px);
        }

        .characters-gallery {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .characters-gallery h3 {
          margin-bottom: 15px;
          text-align: center;
        }

        .characters-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
        }

        .scene-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 30px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .character-info, .concept-info {
          background: rgba(255, 255, 255, 0.15);
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .character-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 15px;
          font-size: 14px;
        }

        .animation-preview {
          position: relative;
          height: 300px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .characters-in-scene {
          display: flex;
          gap: 30px;
          align-items: flex-end;
          flex-wrap: wrap;
          justify-content: center;
        }

        .keyframe-list {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .keyframe-item {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
          color: white;
        }

        .keyframe-item.active {
          background: rgba(52, 152, 219, 0.5);
          transform: scale(1.02);
          box-shadow: 0 2px 10px rgba(52, 152, 219, 0.3);
        }

        .animation-type-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(155, 89, 182, 0.8);
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
        }

        .debug-info {
          margin-top: 20px;
          font-size: 12px;
        }

        .debug-info summary {
          cursor: pointer;
          padding: 10px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          color: white;
        }

        .debug-info pre {
          background: rgba(0, 0, 0, 0.3);
          color: #fff;
          padding: 15px;
          border-radius: 8px;
          overflow-x: auto;
          margin-top: 10px;
          max-height: 300px;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .search-bar {
            flex-direction: column;
          }
          
          .scene-controls {
            flex-direction: column;
          }
          
          .characters-grid {
            justify-content: center;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AICharacterAnimator;