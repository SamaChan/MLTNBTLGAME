'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { clsx } from 'clsx'

export function GuessFeed() {
  const guessFeed = useGameStore(s => s.guessFeed)
  
  return (
    <div className="cyber-card rounded-xl p-3 h-[200px] overflow-hidden">
      <h3 className="text-xs font-bold text-gray-400 mb-2">📜 Guess Feed</h3>
      
      <div className="space-y-1 h-[140px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {guessFeed.slice(-10).map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                'text-xs px-2 py-1 rounded flex items-center gap-2',
                entry.isMe ? 'bg-cyber-neon-green/10 text-cyber-neon-green' : 'bg-cyber-card text-gray-300'
              )}
            >
              <span className="font-bold">{entry.username}:</span>
              <span className="font-mono">{entry.guess}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {guessFeed.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-4">
            No guesses yet...
          </div>
        )}
      </div>
    </div>
  )
}

interface EmoteWheelProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

const EMOTES = ['💀', '🔥', '😂', '😎', '🤔', '👀', '🎉', '😱', '🤯', '💪', '😭', '🥳']

export function EmoteWheel({ onSelect, onClose }: EmoteWheelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="cyber-card rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-center font-bold text-cyber-neon-pink mb-4">Send an Emote!</h3>
        
        <div className="grid grid-cols-4 gap-3">
          {EMOTES.map((emoji, index) => (
            <motion.button
              key={emoji}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(emoji)}
              className="w-12 h-12 text-2xl bg-cyber-dark rounded-lg hover:bg-cyber-neon-pink/20 border border-cyber-border hover:border-cyber-neon-pink"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  )
}

interface VictoryScreenProps {
  winner: { id: string; username: string; avatar_url?: string }
  players: { id: string; username: string; guesses: string[]; solved: boolean; isWinner?: boolean }[]
  onPlayAgain: () => void
}

export function VictoryScreen({ winner, players, onPlayAgain }: VictoryScreenProps) {
  const myPlayer = useGameStore(s => s.myPlayer)
  const isWinner = winner.id === myPlayer?.id
  
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.solved && !b.solved) return -1
    if (!a.solved && b.solved) return 1
    return a.guesses.length - b.guesses.length
  })
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="cyber-card rounded-2xl p-8 max-w-md w-full mx-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="text-6xl mb-4"
        >
          {isWinner ? '🏆' : '🎉'}
        </motion.div>
        
        <h2 className={clsx(
          'text-3xl font-black mb-2',
          isWinner ? 'cyber-text-glow text-cyber-neon-green' : 'text-cyber-neon-blue'
        )}>
          {isWinner ? 'VICTORY!' : 'GAME OVER'}
        </h2>
        
        <p className="text-gray-400 mb-6">
          {winner.username} won the match!
        </p>
        
        <div className="space-y-2 mb-6">
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={clsx(
                'flex items-center justify-between px-4 py-2 rounded-lg',
                player.isWinner ? 'bg-cyber-neon-green/20 border border-cyber-neon-green' : 'bg-cyber-dark'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">#{index + 1}</span>
                <div className="w-8 h-8 rounded-full bg-cyber-neon-blue flex items-center justify-center font-bold">
                  {player.username[0].toUpperCase()}
                </div>
                <span>{player.username}</span>
              </div>
              <span className="text-sm text-gray-400">
                {player.guesses.length} {player.guesses.length === 1 ? 'guess' : 'guesses'}
              </span>
            </motion.div>
          ))}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayAgain}
          className="w-full py-4 bg-cyber-neon-green text-black font-bold rounded-xl text-lg cyber-glow"
        >
          Play Again 🚀
        </motion.button>
        
        <button className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-white">
          Share Result 📤
        </button>
      </motion.div>
    </motion.div>
  )
}
