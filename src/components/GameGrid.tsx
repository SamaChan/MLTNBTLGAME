'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { LetterStatus } from '@/types'
import { clsx } from 'clsx'

interface TileProps {
  letter: string
  status: LetterStatus
  row: number
  col: number
  isCurrentRow: boolean
  isPending: boolean
  isBanned?: boolean
  delay?: number
}

export function Tile({ 
  letter, 
  status, 
  row, 
  col, 
  isCurrentRow, 
  isPending,
  isBanned = false,
  delay = 0 
}: TileProps) {
  const getStatusColors = () => {
    switch (status) {
      case 'correct':
        return 'bg-cyber-neon-green border-cyber-neon-green text-black cyber-glow'
      case 'present':
        return 'bg-cyber-neon-yellow border-cyber-neon-yellow text-black'
      case 'absent':
        return 'bg-gray-700 border-gray-700 text-gray-400'
      default:
        return 'bg-transparent border-cyber-border text-white'
    }
  }

  return (
    <motion.div
      initial={isCurrentRow && !letter ? { scale: 0.8, opacity: 0 } : false}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: 0 
      }}
      transition={{ 
        duration: 0.1, 
        delay: isCurrentRow ? delay * 0.05 : 0 
      }}
      className={clsx(
        'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 flex items-center justify-center text-xl sm:text-2xl font-bold uppercase select-none',
        getStatusColors(),
        isBanned && 'banned-key animate-banned-flash',
        !letter && isCurrentRow && 'border-cyber-border animate-pulse',
        status === 'unknown' && !letter && 'border-cyber-border'
      )}
    >
      <AnimatePresence mode="wait">
        {letter && (
          <motion.span
            key={letter}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.1 }}
          >
            {letter}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface GameGridProps {
  guesses: { letter: string; status: LetterStatus }[][]
  currentGuess: string
  wordLength: number
  maxGuesses?: number
  isActive?: boolean
  bannedLetters?: string[]
  isMe?: boolean
}

export function GameGrid({ 
  guesses, 
  currentGuess, 
  wordLength, 
  maxGuesses = 6,
  isActive = true,
  bannedLetters = [],
  isMe = true 
}: GameGridProps) {
  const rows = Array.from({ length: maxGuesses }, (_, i) => i)
  const cols = Array.from({ length: wordLength }, (_, i) => i)
  
  return (
    <div 
      className="grid gap-1 sm:gap-1.5"
      style={{ gridTemplateRows: `repeat(${maxGuesses}, minmax(0, 1fr))` }}
    >
      {rows.map((rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-1 sm:gap-1.5"
          style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}
        >
          {cols.map((colIndex) => {
            const guessRow = guesses[rowIndex]
            const isCurrentRow = rowIndex === guesses.length && isActive
            const tile = guessRow?.[colIndex]
            const letter = tile?.letter || (isCurrentRow ? currentGuess[colIndex] : '')
            const status = tile?.status || 'unknown'
            const isBanned = bannedLetters.includes(letter)
            
            return (
              <Tile
                key={`${rowIndex}-${colIndex}`}
                letter={letter}
                status={status}
                row={rowIndex}
                col={colIndex}
                isCurrentRow={isCurrentRow}
                isPending={!tile && isCurrentRow}
                isBanned={isBanned}
                delay={colIndex}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

interface MiniGridProps {
  guesses: { letter: string; status: LetterStatus }[][]
  wordLength: number
  username: string
  avatarUrl?: string
  isWinner?: boolean
  isFrozen?: boolean
  bannedLetters?: string[]
}

export function MiniGrid({ 
  guesses, 
  wordLength, 
  username,
  avatarUrl,
  isWinner = false,
  isFrozen = false,
  bannedLetters = []
}: MiniGridProps) {
  const miniWordLength = Math.min(wordLength, 5)
  const rows = guesses.slice(-3)
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={clsx(
        'cyber-card rounded-lg p-2 sm:p-3 min-w-[120px] sm:min-w-[160px]',
        isFrozen && 'opacity-60',
        isWinner && 'ring-2 ring-cyber-neon-green cyber-glow'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyber-neon-blue flex items-center justify-center text-[8px] sm:text-[10px] font-bold">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-full h-full rounded-full object-cover" />
          ) : (
            username[0]?.toUpperCase()
          )}
        </div>
        <span className="text-[10px] sm:text-xs font-medium truncate flex-1">
          {username}
        </span>
        {isWinner && <span className="text-cyber-neon-green">👑</span>}
      </div>
      
      <div className="grid gap-0.5" style={{ gridTemplateRows: `repeat(3, minmax(0, 1fr))` }}>
        {Array.from({ length: 3 }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${miniWordLength}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: miniWordLength }).map((_, colIndex) => {
              const guessRow = rows[rowIndex]
              const tile = guessRow?.[colIndex]
              const letter = tile?.letter || ''
              const status = tile?.status || 'unknown'
              const isBanned = bannedLetters.includes(letter)
              
              const getStatusColors = () => {
                switch (status) {
                  case 'correct':
                    return 'bg-cyber-neon-green'
                  case 'present':
                    return 'bg-cyber-neon-yellow'
                  case 'absent':
                    return 'bg-gray-600'
                  default:
                    return 'bg-transparent border border-cyber-border'
                }
              }
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={clsx(
                    'w-4 h-4 sm:w-5 sm:h-5 text-[6px] sm:text-[8px] font-bold flex items-center justify-center',
                    getStatusColors(),
                    isBanned && 'banned-key'
                  )}
                >
                  {letter}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
