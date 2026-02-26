'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { clsx } from 'clsx'

export function WaitingLobby() {
  const { match, myPlayer, startMatch, addBot, resetGame } = useGameStore()
  const [showCopyToast, setShowCopyToast] = useState(false)
  
  if (!match) return null
  
  const isHost = myPlayer?.isHost
  const canStart = match.players.length >= 1
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(match.id)
    setShowCopyToast(true)
    setTimeout(() => setShowCopyToast(false), 2000)
  }
  
  const handleAddBot = () => {
    if (match.players.length < match.max_players) {
      addBot()
    }
  }
  
  const handleStartGame = () => {
    if (match.players.length < 2) {
      addBot()
      setTimeout(() => startMatch(), 500)
    } else {
      startMatch()
    }
  }
  
  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black cyber-text-glow text-cyber-neon-green mb-2">
            WAITING ROOM
          </h1>
          <p className="text-gray-400">Share the code or add bots to play</p>
        </div>
        
        <motion.div 
          className="cyber-card rounded-xl p-6 text-center"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <p className="text-sm text-gray-400 mb-2">Game Code</p>
          <div className="text-4xl font-black text-cyber-neon-green tracking-widest mb-2">
            {match.id}
          </div>
          <button 
            onClick={handleCopyCode}
            className="text-sm text-cyber-neon-blue hover:underline"
          >
            {showCopyToast ? 'Copied!' : 'Click to copy'}
          </button>
        </motion.div>
        
        <div className="cyber-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-400 mb-3">Players ({match.players.length}/{match.max_players})</h3>
          <div className="space-y-2">
            {match.players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={clsx(
                  'flex items-center justify-between px-4 py-3 rounded-lg',
                  player.id === myPlayer?.id ? 'bg-cyber-neon-green/20 border border-cyber-neon-green' : 'bg-cyber-dark'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    player.isBot ? 'bg-cyber-neon-orange text-black' : 'bg-cyber-neon-blue text-black'
                  )}>
                    {player.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      {player.username}
                      {player.id === myPlayer?.id && ' (You)'}
                      {player.isHost && ' 👑'}
                      {player.isBot && ' 🤖'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {Array.from({ length: match.max_players - match.players.length }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 rounded-lg bg-cyber-dark/50 border border-dashed border-cyber-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyber-border flex items-center justify-center text-gray-500">
                    ?
                  </div>
                  <div className="text-gray-500">Empty slot</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {isHost && (
          <div className="space-y-3">
            {match.players.length < match.max_players && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddBot}
                className="w-full py-3 bg-cyber-neon-orange text-black font-bold rounded-xl"
              >
                + Add Bot 🤖
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartGame}
              className="w-full py-4 bg-cyber-neon-green text-black font-bold rounded-xl text-lg cyber-glow"
            >
              🚀 Start Game
            </motion.button>
          </div>
        )}
        
        {!isHost && (
          <div className="text-center text-gray-400">
            Waiting for host to start...
          </div>
        )}
        
        <button
          onClick={resetGame}
          className="w-full py-2 text-gray-500 hover:text-white"
        >
          ← Back to Lobby
        </button>
      </motion.div>
    </div>
  )
}
