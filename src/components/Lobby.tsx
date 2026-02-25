'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameMode, WORD_LENGTHS, GAME_MODE_CONFIG } from '@/types'
import { useGameStore } from '@/store/gameStore'
import { clsx } from 'clsx'

export function GameModeCard({ 
  mode, 
  isSelected, 
  onClick 
}: { 
  mode: GameMode
  isSelected: boolean
  onClick: () => void 
}) {
  const config = GAME_MODE_CONFIG[mode]
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        'p-4 rounded-xl border-2 text-left transition-all',
        isSelected 
          ? 'border-cyber-neon-green bg-cyber-neon-green/10 cyber-glow' 
          : 'border-cyber-border bg-cyber-card hover:border-cyber-neon-blue/50'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-white">{config.name}</h3>
        <span className="text-xs bg-cyber-purple px-2 py-1 rounded text-cyber-neon-blue">
          {config.minPlayers}-{config.maxPlayers} players
        </span>
      </div>
      <p className="text-xs text-gray-400">{config.description}</p>
    </motion.button>
  )
}

export function Lobby() {
  const [selectedMode, setSelectedMode] = useState<GameMode>('duel')
  const [wordLength, setWordLength] = useState(5)
  const [joinCode, setJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [username, setUsername] = useState('')
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [createdCode, setCreatedCode] = useState('')
  
  const { createMatch, joinMatch, user, setUser } = useGameStore()
  
  const generateLobbyCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }
  
  const handleCreateGame = () => {
    if (!username.trim()) {
      setShowUsernameModal(true)
      return
    }
    
    const code = generateLobbyCode()
    setCreatedCode(code)
    if (user) {
      setUser({ ...user, username: username.trim() })
    }
    createMatch(selectedMode, wordLength, code)
  }
  
  const handleJoinGame = () => {
    if (joinCode.trim()) {
      joinMatch(joinCode.trim())
      setIsJoining(true)
    }
  }
  
  const handleQuickPlay = () => {
    if (!username.trim()) {
      setShowUsernameModal(true)
      return
    }
    
    const code = generateLobbyCode()
    setCreatedCode(code)
    if (user) {
      setUser({ ...user, username: username.trim() })
    }
    createMatch('arena', 5, code)
  }
  
  const saveUsernameAndPlay = () => {
    if (username.trim()) {
      if (user) {
        setUser({ ...user, username: username.trim() })
      }
      setShowUsernameModal(false)
      const code = generateLobbyCode()
      setCreatedCode(code)
      createMatch(selectedMode, wordLength, code)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-8"
      >
        <div className="text-center">
          <motion.h1 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-5xl sm:text-7xl font-black cyber-text-glow text-cyber-neon-green mb-2"
          >
            BATTLEDLE
          </motion.h1>
          <p className="text-gray-400 text-lg">Real-time Wordle Battle Arena</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-cyber-neon-blue">🎮 Create Game</h2>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Your Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full px-4 py-3 bg-cyber-dark border-2 border-cyber-border rounded-lg text-white placeholder-gray-500 focus:border-cyber-neon-green focus:outline-none"
                maxLength={15}
              />
            </div>
            
            {createdCode && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="cyber-card rounded-xl p-4 bg-cyber-neon-green/10 border-cyber-neon-green"
              >
                <p className="text-sm text-gray-400 mb-1">Share this code with friends:</p>
                <div className="text-3xl font-black text-cyber-neon-green tracking-widest text-center py-2">
                  {createdCode}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(createdCode)}
                  className="text-xs text-cyber-neon-green hover:underline mt-2 w-full text-center"
                >
                  Click to copy
                </button>
              </motion.div>
            )}
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Game Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['duel', 'arena', 'chaos', 'team', 'battle_royale', 'stealth'] as GameMode[]).map((mode) => (
                    <GameModeCard
                      key={mode}
                      mode={mode}
                      isSelected={selectedMode === mode}
                      onClick={() => setSelectedMode(mode)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Word Length</label>
                <div className="flex gap-2">
                  {WORD_LENGTHS.map((len) => (
                    <motion.button
                      key={len}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setWordLength(len)}
                      className={clsx(
                        'w-12 h-12 rounded-lg font-bold text-lg border-2 transition-all',
                        wordLength === len
                          ? 'border-cyber-neon-green bg-cyber-neon-green/20 text-cyber-neon-green'
                          : 'border-cyber-border bg-cyber-card text-gray-400 hover:border-cyber-neon-blue/50'
                      )}
                    >
                      {len}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateGame}
                className="w-full py-4 bg-cyber-neon-green text-black font-bold rounded-xl text-lg cyber-glow"
              >
                Create Game 🚀
              </motion.button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-cyber-neon-pink">🔗 Join Game</h2>
            
            <div className="cyber-card rounded-xl p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Game Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter game code..."
                  className="w-full px-4 py-3 bg-cyber-dark border-2 border-cyber-border rounded-lg text-white placeholder-gray-500 focus:border-cyber-neon-pink focus:outline-none"
                  maxLength={8}
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinGame}
                disabled={!joinCode.trim() || isJoining}
                className="w-full py-4 bg-cyber-neon-pink text-white font-bold rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Joining...' : 'Join Game 🎯'}
              </motion.button>
            </div>
            
            <div className="cyber-card rounded-xl p-4">
              <h3 className="font-bold text-cyber-neon-yellow mb-2">🎁 Free Power-Ups</h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-cyber-dark rounded p-2">👁️ Hint Steal</div>
                <div className="bg-cyber-dark rounded p-2">❄️ Freeze</div>
                <div className="bg-cyber-dark rounded p-2">💣 Bomb</div>
                <div className="bg-cyber-dark rounded p-2">✨ Double Guess</div>
                <div className="bg-cyber-dark rounded p-2">🛡️ Shield</div>
                <div className="bg-cyber-dark rounded p-2">🚫 Letter Ban</div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuickPlay}
              className="w-full py-3 bg-cyber-neon-orange text-black font-bold rounded-xl"
            >
              ⚡ Quick Play (Random Match)
            </motion.button>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>Ranked seasons • Battle Pass • No pay-to-win</p>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showUsernameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="cyber-card rounded-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold text-cyber-neon-green mb-4 text-center">
                Choose Your Username
              </h3>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full px-4 py-3 bg-cyber-dark border-2 border-cyber-border rounded-lg text-white placeholder-gray-500 focus:border-cyber-neon-green focus:outline-none mb-4"
                maxLength={15}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveUsernameAndPlay()}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveUsernameAndPlay}
                disabled={!username.trim()}
                className="w-full py-3 bg-cyber-neon-green text-black font-bold rounded-xl disabled:opacity-50"
              >
                Let's Play! 🎮
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
