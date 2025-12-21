'use client'
import React, { useState, useRef, useEffect } from 'react';
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
  const [selectedType, setSelectedType] = useState<'character' | 'scene' | 'animation' | 'particles' | 'character-image'>('character-image');
  const [generatedCharacters, setGeneratedCharacters] = useState<any[]>([]);
  const [characterActions, setCharacterActions] = useState<{[key: number]: string}>({});
  const [characterImages, setCharacterImages] = useState<{[key: number]: string}>({});
  const [imageService, setImageService] = useState<'pollinations' | 'picsum'>('pollinations');
  const [imageStyle, setImageStyle] = useState<'anime' | 'fantasy' | 'realistic' | 'cartoon' | 'cyberpunk'>('fantasy');
  
  // Interactive battle state
  const [battleActive, setBattleActive] = useState(false);
  const [characterHealth, setCharacterHealth] = useState<{[key: number]: number}>({});
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'enemy'>('player');
  const [showVoiceover, setShowVoiceover] = useState(false);

  // Quick character prompts for easy testing
  const quickCharacterPrompts = [
    "A brave knight in shining armor with a magical sword",
    "A mysterious wizard with a long beard and glowing staff", 
    "An elegant elf archer with silver hair and green eyes",
    "A powerful warrior with tribal tattoos and a giant axe",
    "A cute fairy with butterfly wings and magical sparkles",
    "A cyberpunk hacker with neon implants and futuristic gear",
    "A pirate captain with an eye patch and parrot companion",
    "A sci-fi explorer in advanced space armor",
    "A magical girl with colorful hair and transformation wand",
    "A vampire lord with pale skin and elegant clothing"
  ];

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

      switch (selectedType) {
        case 'character':
          apiType = 'character-description';
          prompt = `Create a character: ${userPrompt}`;
          break;
        case 'character-image':
          await generateCharacterImage(userPrompt);
          return;
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
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.character && !data.concept && !data.animationType && !data.config && !data.scene) {
        throw new Error('No valid data received from API');
      }

      setSceneData(data);

      if (data.character) {
        const newCharacter = {
          ...data.character,
          id: Date.now(),
          image: null
        };
        setGeneratedCharacters(prev => [...prev, newCharacter]);
        setCharacterActions(prev => ({
          ...prev,
          [newCharacter.id]: 'idle'
        }));
        setCharacterHealth(prev => ({
          ...prev,
          [newCharacter.id]: 100
        }));

        // Auto-generate voice line for the character
        speakCharacterLine(newCharacter, true);

        setTimeout(() => {
          generateCharacterImageForCharacter(newCharacter);
        }, 1000);
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

  // Generate character image using AI services
  const generateCharacterImage = async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          style: imageStyle,
          service: imageService
        }),
      });

      let data;
      
      if (response.ok) {
        data = await response.json();
      } else {
        throw new Error('API request failed');
      }
      
      // FALLBACK: If no imageUrl or API fails, use direct service
      let imageUrl = data?.imageUrl;
      if (!imageUrl) {
        console.log('No image URL in response, using direct service...');
        if (imageService === 'pollinations') {
          const enhancedPrompt = `${prompt}, ${imageStyle} style, character portrait, detailed, high quality, digital art`;
          imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&nologo=true`;
        } else {
          // Use Picsum as fallback
          const fallbackImages = [
            'https://picsum.photos/512/512',
            'https://picsum.photos/512/512?1',
            'https://picsum.photos/512/512?2',
            'https://picsum.photos/512/512?3'
          ];
          imageUrl = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
        }
      }
      
      if (imageUrl) {
        const newCharacter = {
          id: Date.now(),
          name: generateCharacterName(prompt),
          description: `AI-generated ${imageStyle} character: ${prompt}`,
          physicalFeatures: {
            height: "Generated",
            weight: "Generated", 
            bodyType: "Generated",
            hair: extractHairColor(prompt),
            eyes: extractEyeColor(prompt),
            skin: "Generated",
            distinctiveFeatures: ["AI Generated Image", imageStyle + " style"]
          },
          personality: {
            traits: extractTraits(prompt),
            style: `${imageStyle} style`,
            posture: "Confident"
          },
          animationStyle: "neutral",
          image: imageUrl,
          prompt: prompt,
          service: data?.service || imageService,
          style: imageStyle
        };

        setGeneratedCharacters(prev => [...prev, newCharacter]);
        setCharacterImages(prev => ({
          ...prev,
          [newCharacter.id]: imageUrl
        }));
        setCharacterHealth(prev => ({
          ...prev,
          [newCharacter.id]: 100
        }));
        
        setSceneData({
          character: newCharacter
        });

        speakCharacterLine(newCharacter, true);
      } else {
        throw new Error('No image URL available');
      }

    } catch (err) {
      console.error('Error generating character image:', err);
      setError('Failed to generate character image. Using placeholder.');
      
      // Use Picsum as final fallback
      const fallbackImages = [
        'https://picsum.photos/512/512',
        'https://picsum.photos/512/512?1',
        'https://picsum.photos/512/512?2'
      ];
      const fallbackImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
      
      const fallbackCharacter = createFallbackCharacter(prompt);
      fallbackCharacter.image = fallbackImage;
      
      setGeneratedCharacters(prev => [...prev, fallbackCharacter]);
      setCharacterImages(prev => ({
        ...prev,
        [fallbackCharacter.id]: fallbackImage
      }));
      setCharacterHealth(prev => ({
        ...prev,
        [fallbackCharacter.id]: 100
      }));
      speakCharacterLine(fallbackCharacter, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate image for an existing character
  const generateCharacterImageForCharacter = async (character: any) => {
    try {
      const imagePrompt = `character portrait of ${character.name}, ${character.description}, ${character.physicalFeatures.hair} hair, ${character.physicalFeatures.eyes} eyes, ${character.personality.style}, ${imageStyle} style, detailed, high quality`;
      
      let imageUrl;
      
      if (imageService === 'pollinations') {
        const enhancedPrompt = `${imagePrompt}, ${imageStyle} style, character portrait, detailed, high quality, digital art`;
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&nologo=true`;
      } else {
        // Use Picsum
        const fallbackImages = [
          'https://picsum.photos/512/512',
          'https://picsum.photos/512/512?1',
          'https://picsum.photos/512/512?2'
        ];
        imageUrl = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
      }

      if (imageUrl) {
        setCharacterImages(prev => ({
          ...prev,
          [character.id]: imageUrl
        }));
      }
    } catch (err) {
      console.error('Error generating image for character:', err);
    }
  };

  // Interactive Battle System
  const startBattle = () => {
    if (generatedCharacters.length === 0) {
      setError('Please generate at least one character first');
      return;
    }
    setBattleActive(true);
    setEnemyHealth(100);
    setBattleLog(['⚔️ Battle started!']);
    setCurrentTurn('player');
    
    const newHealth: {[key: number]: number} = {};
    generatedCharacters.forEach(char => {
      newHealth[char.id] = 100;
    });
    setCharacterHealth(newHealth);

    // Battle start voice line
    speakVoiceover("Let the battle begin! Defeat the enemy!");
  };

  const performAttack = (characterId: number) => {
    if (!battleActive || currentTurn !== 'player') return;

    const character = generatedCharacters.find(c => c.id === characterId);
    const damage = Math.floor(Math.random() * 20) + 10;
    const newEnemyHealth = Math.max(0, enemyHealth - damage);
    setEnemyHealth(newEnemyHealth);
    
    setBattleLog(prev => [...prev, 
      `🎯 ${character?.name} attacks for ${damage} damage!`
    ]);

    setCharacterActions(prev => ({
      ...prev,
      [characterId]: 'attack'
    }));

    // Attack voice line
    const attackLines = [
      "Take this!",
      "For glory!",
      "Have at thee!",
      "My blade strikes true!",
      "Feel my power!"
    ];
    const attackLine = attackLines[Math.floor(Math.random() * attackLines.length)];
    speakVoiceover(attackLine);

    // Enemy turn
    setTimeout(() => {
      if (newEnemyHealth > 0) {
        enemyTurn();
      } else {
        setBattleLog(prev => [...prev, '🎉 Victory! Enemy defeated!']);
        setBattleActive(false);
        speakVoiceover("Victory is ours! Well fought!");
      }
      setCharacterActions(prev => ({
        ...prev,
        [characterId]: 'idle'
      }));
    }, 1000);
  };

  const enemyTurn = () => {
    const activeCharacters = generatedCharacters.filter(char => characterHealth[char.id] > 0);
    if (activeCharacters.length === 0) return;

    const targetChar = activeCharacters[Math.floor(Math.random() * activeCharacters.length)];
    const enemyDamage = Math.floor(Math.random() * 15) + 5;
    const newHealth = Math.max(0, characterHealth[targetChar.id] - enemyDamage);
    
    setCharacterHealth(prev => ({
      ...prev,
      [targetChar.id]: newHealth
    }));

    setBattleLog(prev => [...prev, 
      `👹 Enemy attacks ${targetChar.name} for ${enemyDamage} damage!`
    ]);

    setCharacterActions(prev => ({
      ...prev,
      [targetChar.id]: 'hurt'
    }));

    // Enemy attack voice
    speakVoiceover("The enemy strikes back!");

    setTimeout(() => {
      setCharacterActions(prev => ({
        ...prev,
        [targetChar.id]: 'idle'
      }));
      
      if (newHealth <= 0) {
        setBattleLog(prev => [...prev, `💀 ${targetChar.name} has been defeated!`]);
        speakVoiceover(`${targetChar.name} has fallen!`);
        
        // Check if all characters are defeated
        const allDefeated = generatedCharacters.every(char => characterHealth[char.id] <= 0);
        if (allDefeated) {
          setBattleLog(prev => [...prev, '😵 All characters defeated! Battle lost.']);
          setBattleActive(false);
          speakVoiceover("We have been defeated... Retreat!");
        }
      }
      
      setCurrentTurn('player');
    }, 1000);
  };

  const speakCharacterLine = (character: any, isIntroduction: boolean = false) => {
    const introLines = [
      `I am ${character.name}, ready for adventure!`,
      `${character.name} at your service!`,
      `The name's ${character.name}. Let's make some magic!`,
      `Ready for action! I'm ${character.name}.`,
      `${character.name} reporting for duty!`
    ];

    const battleLines = [
      `I am ${character.name}, ready for battle!`,
      `For glory and honor!`,
      `My ${character.personality.traits[0] || 'skills'} will lead us to victory!`,
      `Let the battle commence!`,
      `I shall not fall easily!`
    ];

    const lines = isIntroduction ? introLines : battleLines;
    const line = lines[Math.floor(Math.random() * lines.length)];
    
    speakVoiceover(line);
    
    setBattleLog(prev => [...prev, `💬 ${character.name}: "${line}"`]);
  };

  const speakVoiceover = (text: string) => {
    setShowVoiceover(true);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
    setTimeout(() => setShowVoiceover(false), 3000);
  };

  // Helper functions
  const generateCharacterName = (prompt: string): string => {
    const words = prompt.split(' ');
    const descriptors = words.slice(0, Math.min(3, words.length));
    return descriptors.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const extractHairColor = (prompt: string): string => {
    const colors = ['blonde', 'brunette', 'black', 'red', 'blue', 'pink', 'purple', 'green', 'silver', 'white'];
    const found = colors.find(color => prompt.toLowerCase().includes(color));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : 'Various';
  };

  const extractEyeColor = (prompt: string): string => {
    const colors = ['blue', 'green', 'brown', 'hazel', 'gray', 'amber', 'red', 'purple', 'gold'];
    const found = colors.find(color => prompt.toLowerCase().includes(color));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : 'Various';
  };

  const extractTraits = (prompt: string): string[] => {
    const traits = [];
    if (prompt.toLowerCase().includes('brave') || prompt.toLowerCase().includes('warrior') || prompt.toLowerCase().includes('knight')) traits.push('Brave');
    if (prompt.toLowerCase().includes('magic') || prompt.toLowerCase().includes('wizard') || prompt.toLowerCase().includes('mage')) traits.push('Magical');
    if (prompt.toLowerCase().includes('mysterious') || prompt.toLowerCase().includes('dark')) traits.push('Mysterious');
    if (prompt.toLowerCase().includes('cute') || prompt.toLowerCase().includes('fairy')) traits.push('Cute');
    if (prompt.toLowerCase().includes('powerful') || prompt.toLowerCase().includes('strong')) traits.push('Powerful');
    return traits.length > 0 ? traits : ['Adventurous', 'Unique'];
  };

  const createFallbackCharacter = (prompt: string) => {
    return {
      id: Date.now(),
      name: generateCharacterName(prompt),
      description: `Character: ${prompt}`,
      physicalFeatures: {
        height: "Average",
        weight: "Medium",
        bodyType: "Athletic",
        hair: extractHairColor(prompt),
        eyes: extractEyeColor(prompt),
        skin: "Various",
        distinctiveFeatures: ["AI Generated"]
      },
      personality: {
        traits: extractTraits(prompt),
        style: `${imageStyle} style`,
        posture: "Confident"
      },
      animationStyle: "neutral",
      image: null
    };
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

      const actions = ['idle', 'walk', 'run', 'jump', 'attack', 'castSpell', 'dance', 'greet'];
      const newActions: {[key: number]: string} = {};
      generatedCharacters.forEach((character) => {
        newActions[character.id] = actions[Math.floor(Math.random() * actions.length)];
      });
      setCharacterActions(newActions);

    } catch (err) {
      console.error('Error generating scene:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate scene');
    } finally {
      setIsLoading(false);
    }
  };

  const setCharacterAction = (characterId: number, action: string) => {
    setCharacterActions(prev => ({
      ...prev,
      [characterId]: action
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

  const getCharacterAnimation = (characterId: number) => {
    const action = characterActions[characterId] || 'idle';
    
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
            repeat: 1,
            ease: "easeInOut"
          }
        };
      case 'hurt':
        return {
          x: [0, -10, 10, -10, 0],
          scale: [1, 0.9, 1],
          transition: {
            duration: 0.5,
            repeat: 1,
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
    const action = characterActions[character.id] || 'idle';
    const characterImage = characterImages[character.id];
    const health = characterHealth[character.id] || 100;
    
    return (
      <motion.div
        key={character.id}
        className="character"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={inScene ? getCharacterAnimation(character.id) : { scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        style={{
          width: inScene ? '100px' : '140px',
          height: inScene ? '150px' : '190px',
          background: characterImage ? 'transparent' : getCharacterColor(character.animationStyle),
          borderRadius: '15px',
          position: 'relative',
          margin: '10px',
          cursor: (inScene && battleActive) ? 'pointer' : 'default',
          border: inScene ? `3px solid ${getActionColor(action)}` : '2px solid rgba(255,255,255,0.3)',
          boxShadow: inScene ? `0 0 15px ${getActionColor(action)}` : '0 8px 25px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
        whileHover={{ scale: inScene ? 1.1 : 1.05 }}
        whileTap={{ scale: inScene ? 0.95 : 0.95 }}
        onClick={inScene && battleActive ? () => performAttack(character.id) : undefined}
      >
        {characterImage ? (
          <div className="w-full h-full relative">
            <img 
              src={characterImage} 
              alt={character.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                // If image fails to load, show placeholder
                console.log('Image failed to load:', characterImage);
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg';
                  placeholder.innerHTML = `
                    <div class="text-white text-center">
                      <div class="text-2xl mb-2">👤</div>
                      <div class="text-sm font-bold">${character.name}</div>
                    </div>
                  `;
                  parent.appendChild(placeholder);
                }
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
              <div className="text-white text-sm font-bold text-center truncate">
                {character.name}
              </div>
              <div className="text-white text-xs text-center opacity-80">
                {character.personality.traits.slice(0, 2).join(', ')}
              </div>
            </div>
            {character.service && (
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {character.service}
              </div>
            )}
          </div>
        ) : (
          <div className="character-features w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <div className="text-white text-2xl mb-2">👤</div>
            <div 
              className="character-head"
              style={{
                width: '50px',
                height: '50px',
                background: getSkinColor(character.physicalFeatures.skin),
                borderRadius: '50%',
                margin: '10px auto',
                border: '3px solid rgba(255,255,255,0.5)'
              }}
            />
            <div 
              className="character-body"
              style={{
                width: '70px',
                height: '40px',
                background: getCharacterOutfit(character.personality.style),
                borderRadius: '10px',
                margin: '0 auto',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            />
            <div 
              className="character-name"
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '0',
                right: '0',
                textAlign: 'center',
                fontSize: '12px',
                color: 'white',
                fontWeight: 'bold',
                textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                padding: '0 5px'
              }}
            >
              {character.name}
            </div>
            <div className="absolute top-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded-full">
              No Image
            </div>
          </div>
        )}
        
        {battleActive && (
          <div className="absolute top-2 left-2 right-2 bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${health}%` }}
            ></div>
          </div>
        )}
        
        {inScene && (
          <>
            <div 
              className="action-effect"
              style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '24px',
                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))',
                zIndex: 10
              }}
            >
              {getActionEmoji(action)}
            </div>
            <div 
              className="character-action"
              style={{
                position: 'absolute',
                top: '-35px',
                left: '0',
                right: '0',
                textAlign: 'center',
                fontSize: '12px',
                color: getActionColor(action),
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,1)',
                zIndex: 10
              }}
            >
              {action}
            </div>
          </>
        )}
      </motion.div>
    );
  };

  const cycleCharacterAction = (characterId: number) => {
    const actions = ['idle', 'walk', 'run', 'jump', 'attack', 'castSpell', 'dance', 'greet'];
    const currentAction = characterActions[characterId] || 'idle';
    const currentIndex = actions.indexOf(currentAction);
    const nextAction = actions[(currentIndex + 1) % actions.length];
    setCharacterAction(characterId, nextAction);
  };

  const getActionEmoji = (action: string) => {
    const emojis: {[key: string]: string} = {
      'run': '🏃',
      'walk': '🚶',
      'jump': '🦘',
      'attack': '⚔️',
      'hurt': '💔',
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
      'hurt': '#e74c3c',
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
      'Dark': '#8d5524',
      'Various': '#f0d9b5'
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
      'Elegant robes': '#16a085',
      'anime style': '#9b59b6',
      'fantasy style': '#e67e22',
      'realistic style': '#95a5a6',
      'cartoon style': '#e84393',
      'cyberpunk style': '#00ffff'
    };
    return outfits[style] || '#bdc3c7';
  };

  const clearCharacters = () => {
    setGeneratedCharacters([]);
    setCharacterActions({});
    setCharacterImages({});
    setBattleActive(false);
    setBattleLog([]);
    setEnemyHealth(100);
  };

  const setAllCharactersAction = (action: string) => {
    const newActions: {[key: number]: string} = {};
    generatedCharacters.forEach((character) => {
      newActions[character.id] = action;
    });
    setCharacterActions(newActions);
  };

  const generateImageForAllCharacters = async () => {
    setIsLoading(true);
    try {
      for (const character of generatedCharacters) {
        if (!characterImages[character.id]) {
          await generateCharacterImageForCharacter(character);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error generating images for all characters:', error);
      setError('Failed to generate some images');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateImageForCharacter = async (character: any) => {
    try {
      await generateCharacterImageForCharacter(character);
    } catch (error) {
      console.error('Error regenerating image:', error);
      setError('Failed to regenerate image');
    }
  };

  return (
    <div className="ai-character-animator">
      <div className="controls-panel">
        <h1>🎭 AI Character Generator</h1>
        <p className="subtitle">Create amazing characters with AI image generation and interactive battles</p>
        
        <div className="input-section">
          <div className="search-bar">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Describe your character (e.g., 'elf warrior with blue hair and magical armor')..."
              className="prompt-input"
              onKeyPress={(e) => e.key === 'Enter' && generateContent()}
            />
            <button 
              onClick={generateContent}
              disabled={isLoading}
              className="generate-button"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                'Generate Character'
              )}
            </button>
          </div>

          <div className="settings-row">
            <div className="type-selector">
              <label>Generate:</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="type-select"
              >
                <option value="character-image">Character with Image</option>
                <option value="character">Character Description Only</option>
                <option value="scene">Scene with Characters</option>
                <option value="animation">Animation</option>
                <option value="particles">Particles</option>
              </select>
            </div>

            <div className="service-selector">
              <label>Image Service:</label>
              <select 
                value={imageService} 
                onChange={(e) => setImageService(e.target.value as any)}
                className="service-select"
              >
                <option value="pollinations">Pollinations AI (Free)</option>
                <option value="picsum">Picsum (Placeholder)</option>
              </select>
            </div>

            <div className="style-selector">
              <label>Style:</label>
              <select 
                value={imageStyle} 
                onChange={(e) => setImageStyle(e.target.value as any)}
                className="style-select"
              >
                <option value="fantasy">Fantasy</option>
                <option value="anime">Anime</option>
                <option value="realistic">Realistic</option>
                <option value="cartoon">Cartoon</option>
                <option value="cyberpunk">Cyberpunk</option>
              </select>
            </div>
          </div>

          <div className="quick-prompts">
            <h4>🚀 Quick Character Ideas:</h4>
            <div className="prompts-grid">
              {quickCharacterPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setUserPrompt(prompt);
                    setSelectedType('character-image');
                  }}
                  className="prompt-button"
                >
                  {prompt.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>

          {generatedCharacters.length > 0 && (
            <div className="scene-controls">
              <button 
                onClick={generateSceneWithCharacters}
                disabled={isLoading}
                className="scene-button"
              >
                🎬 Create Scene
              </button>
              <button 
                onClick={startBattle}
                disabled={isLoading || battleActive}
                className="battle-button"
              >
                ⚔️ Start Battle
              </button>
              <button 
                onClick={generateImageForAllCharacters}
                disabled={isLoading}
                className="image-button"
              >
                🖼️ Generate All Images
              </button>
              <button 
                onClick={clearCharacters}
                className="clear-button"
              >
                🗑️ Clear All ({generatedCharacters.length})
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

      {/* Voiceover Display */}
      <AnimatePresence>
        {showVoiceover && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="voiceover-bubble"
          >
            <div className="voiceover-text">
              💬 {battleLog[battleLog.length - 1]?.replace(/^💬\s*/, '') || 'Character speaking...'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {battleActive && (
        <div className="battle-log">
          <h3>⚔️ Battle in Progress - {currentTurn === 'player' ? 'Your Turn' : 'Enemy Turn'}</h3>
          <div className="battle-info">
            <div className="enemy-health">
              <span>👹 Enemy Health: {enemyHealth}/100</span>
              <div className="health-bar">
                <div className="health-fill" style={{width: `${enemyHealth}%`}}></div>
              </div>
            </div>
          </div>
          <div className="log-entries">
            {battleLog.slice(-5).map((log, index) => (
              <div key={index} className="log-entry">{log}</div>
            ))}
          </div>
        </div>
      )}

      {generatedCharacters.length > 0 && (
        <div className="characters-gallery">
          <div className="gallery-header">
            <h3>🎨 Generated Characters ({generatedCharacters.length})</h3>
            <div className="gallery-stats">
              <span className="stat">With Images: {Object.keys(characterImages).length}</span>
              <span className="stat">Style: {imageStyle}</span>
              <span className="stat">Service: {imageService}</span>
              {battleActive && <span className="stat battle-indicator">⚔️ Battle Active</span>}
            </div>
          </div>
          <div className="characters-grid">
            {generatedCharacters.map((character, index) => (
              <div key={character.id} className="character-container">
                {renderCharacter(character, index)}
                <div className="character-controls">
                  {!characterImages[character.id] && (
                    <button 
                      onClick={() => regenerateImageForCharacter(character)}
                      className="regenerate-button"
                    >
                      Generate Image
                    </button>
                  )}
                  <button 
                    onClick={() => speakCharacterLine(character)}
                    className="voice-button"
                  >
                    🗣️ Speak
                  </button>
                  <button 
                    onClick={() => cycleCharacterAction(character.id)}
                    className="action-button"
                  >
                    {characterActions[character.id] || 'idle'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {generatedCharacters.length > 0 && (
        <div className="action-controls">
          <h3>🎮 Character Actions</h3>
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
          <p className="action-hint">💡 {battleActive ? 'Click on characters to attack!' : 'Click on characters in the scene to cycle through actions!'}</p>
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

            <div className="animation-preview">
              {generatedCharacters.length > 0 && (
                <div className="characters-in-scene">
                  {generatedCharacters.map((character, index) => (
                    <motion.div
                      key={character.id}
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
          max-width: 1400px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: white;
          position: relative;
        }

        .voiceover-bubble {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          color: #333;
          padding: 15px 25px;
          border-radius: 25px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 1000;
          max-width: 500px;
          text-align: center;
          border: 2px solid #3498db;
        }

        .voiceover-text {
          font-weight: bold;
          font-size: 16px;
        }

        .battle-log {
          background: rgba(255, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
          border: 2px solid rgba(255, 0, 0, 0.3);
        }

        .battle-log h3 {
          color: #ff6b6b;
          margin-bottom: 15px;
        }

        .battle-info {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }

        .enemy-health {
          flex: 1;
        }

        .health-bar {
          width: 100%;
          height: 10px;
          background: rgba(0,0,0,0.3);
          border-radius: 5px;
          overflow: hidden;
          margin-top: 5px;
        }

        .health-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
          transition: width 0.3s ease;
        }

        .log-entries {
          max-height: 120px;
          overflow-y: auto;
        }

        .log-entry {
          padding: 8px 12px;
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          margin-bottom: 5px;
          font-size: 14px;
        }

        .character-controls {
          display: flex;
          gap: 5px;
          margin-top: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .voice-button, .action-button {
          padding: 4px 8px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 8px;
          color: white;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .voice-button:hover {
          background: rgba(52, 152, 219, 0.3);
        }

        .battle-button {
          background: linear-gradient(45deg, #e74c3c, #c0392b);
        }

        .battle-indicator {
          background: rgba(231, 76, 60, 0.8) !important;
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
          margin-bottom: 10px;
          font-size: 2.5em;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .subtitle {
          text-align: center;
          margin-bottom: 30px;
          font-size: 1.1em;
          opacity: 0.9;
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
          max-width: 800px;
        }

        .prompt-input {
          flex: 1;
          padding: 15px 20px;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .prompt-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .prompt-input:focus {
          outline: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(0, 0, 0, 0.8);
        }

        .settings-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          max-width: 800px;
        }

        .type-selector, .service-selector, .style-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }

        .type-select, .service-select, .style-select {
          padding: 8px 15px;
          border-radius: 20px;
          border: none;
          background: rgba(0, 0, 0, 0.7);
          font-size: 14px;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          min-width: 150px;
        }

        .generate-button, .scene-button, .image-button, .clear-button, .battle-button {
          padding: 15px 25px;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          color: white;
          white-space: nowrap;
        }

        .generate-button {
          background: linear-gradient(45deg, #ff6b6b, #ee5a24);
          min-width: 120px;
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

        .quick-prompts {
          width: 100%;
          max-width: 800px;
        }

        .quick-prompts h4 {
          margin-bottom: 10px;
          text-align: center;
          color: #e0e0e0;
          font-size: 1.1em;
        }

        .prompts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 10px;
        }

        .prompt-button {
          padding: 12px 15px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: white;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .prompt-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .scene-controls {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
        }

        .scene-button {
          background: linear-gradient(45deg, #3498db, #2980b9);
        }

        .image-button {
          background: linear-gradient(45deg, #9b59b6, #8e44ad);
        }

        .clear-button {
          background: linear-gradient(45deg, #e74c3c, #c0392b);
        }

        .characters-gallery {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 25px;
          border-radius: 20px;
          margin-bottom: 25px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .gallery-header h3 {
          margin: 0;
          font-size: 1.5em;
        }

        .gallery-stats {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .stat {
          background: rgba(0, 0, 0, 0.3);
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 14px;
        }

        .characters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 25px;
          justify-items: center;
        }

        .character-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .regenerate-button {
          padding: 8px 15px;
          background: rgba(155, 89, 182, 0.8);
          border: none;
          border-radius: 15px;
          color: white;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .regenerate-button:hover {
          background: rgba(155, 89, 182, 1);
          transform: translateY(-2px);
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
          
          .settings-row {
            flex-direction: column;
            align-items: center;
          }
          
          .scene-controls {
            flex-direction: column;
          }
          
          .characters-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }
          
          .prompts-grid {
            grid-template-columns: 1fr;
          }
          
          .gallery-header {
            flex-direction: column;
            text-align: center;
          }
          
          .gallery-stats {
            justify-content: center;
          }
          
          .action-buttons {
            grid-template-columns: repeat(2, 1fr);
          }

          .voiceover-bubble {
            top: 10px;
            left: 10px;
            right: 10px;
            transform: none;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AICharacterAnimator;