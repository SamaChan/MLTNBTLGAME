'use client'

import { motion } from 'framer-motion'
import { LetterStatus } from '@/types'
import { clsx } from 'clsx'

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
]

interface KeyboardProps {
  onKeyPress: (key: string) => void
  letterStatuses?: Record<string, LetterStatus>
  disabled?: boolean
  bannedLetters?: string[]
}

export function Keyboard({ 
  onKeyPress, 
  letterStatuses = {},
  disabled = false,
  bannedLetters = []
}: KeyboardProps) {
  const getKeyColor = (key: string) => {
    if (key === 'ENTER' || key === '⌫') {
      return 'bg-cyber-neon-blue text-black hover:bg-cyber-neon-blue/80'
    }
    
    if (bannedLetters.includes(key)) {
      return 'banned-key'
    }
    
    const status = letterStatuses[key]
    switch (status) {
      case 'correct':
        return 'bg-cyber-neon-green text-black'
      case 'present':
        return 'bg-cyber-neon-yellow text-black'
      case 'absent':
        return 'bg-gray-600 text-gray-300'
      default:
        return 'bg-cyber-card border-cyber-border text-white hover:bg-cyber-border'
    }
  }

  const handleKeyPress = (key: string) => {
    console.log('Keyboard handleKeyPress:', key, 'disabled:', disabled)
    if (disabled) return
    if (key !== 'ENTER' && key !== '⌫' && bannedLetters.includes(key)) return
    onKeyPress(key)
  }

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 w-full max-w-lg mx-auto">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div 
          key={rowIndex}
          className="flex justify-center gap-1 sm:gap-1.5"
        >
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === '⌫'
            const isBanned = bannedLetters.includes(key)
            
            return (
              <motion.button
                key={key}
                whileHover={!disabled && !isBanned ? { scale: 1.05 } : {}}
                whileTap={!disabled && !isBanned ? { scale: 0.95 } : {}}
                onClick={() => handleKeyPress(key)}
                disabled={disabled || isBanned}
                className={clsx(
                  'h-12 sm:h-14 flex items-center justify-center text-sm sm:text-base font-bold rounded-md select-none transition-all',
                  isSpecial ? 'px-3 sm:px-4 min-w-[50px] sm:min-w-[65px]' : 'w-8 sm:w-10',
                  getKeyColor(key),
                  (disabled || isBanned) && 'cursor-not-allowed opacity-60'
                )}
              >
                {key === '⌫' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 3H3v18h18V3z" />
                    <path d="M9 9l-5 5 5 5" />
                    <path d="M22 9h-8" />
                  </svg>
                ) : key === 'ENTER' ? (
                  <span className="text-[10px] sm:text-xs">GO</span>
                ) : (
                  key
                )}
              </motion.button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

interface LetterBanKeyboardProps {
  onSelect: (letter: string) => void
  disabled?: boolean
}

export function LetterBanKeyboard({ onSelect, disabled = false }: LetterBanKeyboardProps) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="flex flex-col gap-1 w-full max-w-md mx-auto">
      <div className="flex flex-wrap justify-center gap-1">
        {letters.map((letter) => (
          <motion.button
            key={letter}
            whileHover={!disabled ? { scale: 1.1 } : {}}
            whileTap={!disabled ? { scale: 0.9 } : {}}
            onClick={() => onSelect(letter)}
            disabled={disabled}
            className={clsx(
              'w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center text-sm font-bold',
              'bg-cyber-neon-red/20 border border-cyber-neon-red text-cyber-neon-red',
              'hover:bg-cyber-neon-red hover:text-black transition-colors',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {letter}
          </motion.button>
        ))}
      </div>
      <p className="text-center text-xs text-cyber-neon-red mt-2">
        Select a letter to ban from your opponent
      </p>
    </div>
  )
}
