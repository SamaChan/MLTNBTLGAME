'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGameStore } from '@/store/gameStore'
import { GameGrid, MiniGrid } from './GameGrid'
import { Keyboard } from './Keyboard'
import { PowerUpPanel } from './PowerUpPanel'
import { GuessFeed } from './GuessFeed'
import { EmoteWheel } from './EmoteWheel'
import { VictoryScreen } from './VictoryScreen'
import { LetterStatus } from '@/types'
import { clsx } from 'clsx'

const EMOTES = ['💀', '🔥', '😂', '😎', '🤔', '👀', '🎉', '😱']

export function GameArena() {
  const {
    match,
    myPlayer,
    localGuesses,
    gameStatus,
    winner,
    timeLeft,
    isFrozen,
    bannedLetters,
    submitGuess,
    setCurrentGuess,
    addToGuessFeed,
    addEmote,
    setTimeLeft,
    resetGame,
  } = useGameStore()
  
  const [letterStatuses, setLetterStatuses] = useState<Record<string, LetterStatus>>({})
  const [showEmoteWheel, setShowEmoteWheel] = useState(false)
  
  const currentGuess = myPlayer?.currentGuess || ''
  const guesses = localGuesses[myPlayer?.id || ''] || []
  
  useEffect(() => {
    if (gameStatus !== 'playing') return
    
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, timeLeft - 1))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [gameStatus, timeLeft, setTimeLeft])
  
  useEffect(() => {
    if (winner) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ff88', '#00ffff', '#ff00ff', '#ffff00'],
      })
    }
  }, [winner])
  
  useEffect(() => {
    const newStatuses: Record<string, LetterStatus> = {}
    guesses.forEach(guessRow => {
      guessRow.forEach(({ letter, status }) => {
        if (status === 'correct') {
          newStatuses[letter] = status
        } else if (!newStatuses[letter]) {
          newStatuses[letter] = status
        } else if (newStatuses[letter] === 'present' && status === 'absent') {
          // Keep present
        } else if (status === 'present' && newStatuses[letter] !== 'correct') {
          newStatuses[letter] = status
        }
      })
    })
    setLetterStatuses(newStatuses)
  }, [guesses])
  
  const handleKeyPress = useCallback((key: string) => {
    if (gameStatus !== 'playing' || isFrozen) return
    
    if (key === '⌫') {
      setCurrentGuess(currentGuess.slice(0, -1))
      return
    }
    
    if (key === 'ENTER') {
      if (currentGuess.length !== match?.word_length) return
      
      const success = submitGuess(currentGuess)
      if (success) {
        addToGuessFeed({
          id: crypto.randomUUID(),
          username: myPlayer?.username || 'You',
          guess: currentGuess,
          isMe: true,
        })
        setCurrentGuess('')
      }
      return
    }
    
    if (currentGuess.length < (match?.word_length || 5) && /^[A-Z]$/.test(key)) {
      if (bannedLetters.some(b => b.letter === key && b.expiresAt > Date.now())) {
        return
      }
      setCurrentGuess(currentGuess + key)
    }
  }, [currentGuess, gameStatus, isFrozen, match?.word_length, bannedLetters, submitGuess, setCurrentGuess, addToGuessFeed, myPlayer?.username])
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      
      const key = e.key.toUpperCase()
      if (key === 'BACKSPACE') {
        handleKeyPress('⌫')
      } else if (key === 'ENTER') {
        handleKeyPress('ENTER')
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress])
  
  const handleEmoteSelect = (emoji: string) => {
    if (!myPlayer) return
    addEmote({
      id: crypto.randomUUID(),
      userId: myPlayer.id,
      username: myPlayer.username,
      emoji,
      x: Math.random() * 0.6 + 0.2,
      y: Math.random() * 0.4 + 0.3,
    })
    setShowEmoteWheel(false)
  }
  
  if (!match) return null
  
  const opponents = match.players.filter(p => p.id !== myPlayer?.id)
  const myBannedLetters = bannedLetters.filter(b => b.expiresAt > Date.now()).map(b => b.letter)

  return (
    <div className="min-h-screen bg-cyber-dark p-2 sm:p-4">
      <AnimatePresence>
        {winner && (
          <VictoryScreen 
            winner={winner} 
            players={match.players}
            onPlayAgain={resetGame}
          />
        )}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-black cyber-text-glow text-cyber-neon-green">
            BATTLEDLE
          </h1>
          
          <div className="flex items-center gap-4">
            <div className={clsx(
              'text-sm sm:text-base font-mono font-bold px-3 py-1 rounded-lg',
              timeLeft < 30 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-cyber-card text-cyber-neon-blue'
            )}>
              ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            
            <button
              onClick={() => setShowEmoteWheel(!showEmoteWheel)}
              className="p-2 rounded-lg bg-cyber-card border border-cyber-border hover:border-cyber-neon-pink/50"
            >
              😀
            </button>
          </div>
        </header>
        
        <div className="grid lg:grid-cols-[1fr,300px] gap-4">
          <div className="space-y-4">
            <div className="cyber-card rounded-xl p-4 sm:p-6">
              <div className="flex flex-col items-center">
                <GameGrid
                  guesses={guesses}
                  currentGuess={currentGuess}
                  wordLength={match.word_length}
                  isActive={gameStatus === 'playing'}
                  bannedLetters={myBannedLetters}
                />
                
                {isFrozen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-cyber-neon-blue flex items-center gap-2"
                  >
                    <span className="text-2xl">❄️</span>
                    <span className="font-bold">FROZEN! Wait to thaw.</span>
                  </motion.div>
                )}
                
                {myBannedLetters.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-cyber-neon-red flex items-center gap-2"
                  >
                    <span className="text-2xl">🚫</span>
                    <span className="font-bold">BANNED: {myBannedLetters.join(', ')}</span>
                  </motion.div>
                )}
              </div>
              
              <div className="mt-6">
                <Keyboard
                  onKeyPress={handleKeyPress}
                  letterStatuses={letterStatuses}
                  disabled={gameStatus !== 'playing' || isFrozen}
                  bannedLetters={myBannedLetters}
                />
              </div>
            </div>
            
            <PowerUpPanel />
          </div>
          
          <div className="space-y-4">
            <GuessFeed />
            
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-400">Opponents</h3>
              <div className="space-y-2">
                {opponents.map((player) => (
                  <MiniGrid
                    key={player.id}
                    guesses={localGuesses[player.id] || []}
                    wordLength={match.word_length}
                    username={player.username}
                    avatarUrl={player.avatar_url}
                    isWinner={player.isWinner}
                    isFrozen={player.frozen}
                    bannedLetters={player.banned_letters?.map(b => b.letter) || []}
                  />
                ))}
              </div>
              
              {opponents.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  Waiting for opponents...
                </div>
              )}
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {showEmoteWheel && (
            <EmoteWheel
              onSelect={handleEmoteSelect}
              onClose={() => setShowEmoteWheel(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
