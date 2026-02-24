'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { PowerUpType, POWER_UPS } from '@/types'
import { useGameStore } from '@/store/gameStore'
import { clsx } from 'clsx'
import { LetterBanKeyboard } from './Keyboard'

interface PowerUpButtonProps {
  type: PowerUpType
  usesRemaining: number
  isActive: boolean
  isPending: boolean
  onClick: () => void
  disabled?: boolean
}

function PowerUpButton({ type, usesRemaining, isActive, isPending, onClick, disabled }: PowerUpButtonProps) {
  const powerUp = POWER_UPS.find(p => p.type === type)
  if (!powerUp) return null

  return (
    <motion.button
      whileHover={!disabled && usesRemaining > 0 ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled && usesRemaining > 0 ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled || usesRemaining <= 0}
      className={clsx(
        'relative p-2 sm:p-3 rounded-lg border-2 transition-all',
        isPending 
          ? 'border-cyber-neon-pink bg-cyber-neon-pink/20 cyber-glow animate-pulse' 
          : isActive
            ? 'border-cyber-neon-green bg-cyber-neon-green/20'
            : usesRemaining > 0
              ? 'border-cyber-border bg-cyber-card hover:border-cyber-neon-blue/50'
              : 'border-gray-700 bg-gray-900/50 opacity-50'
      )}
    >
      <div className="text-xl sm:text-2xl mb-1">{powerUp.icon}</div>
      <div className="text-[8px] sm:text-[10px] font-medium text-center leading-tight">
        {powerUp.name}
      </div>
      <div className={clsx(
        'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold',
        usesRemaining > 0 ? 'bg-cyber-neon-green text-black' : 'bg-gray-600 text-white'
      )}>
        {usesRemaining}
      </div>
      
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute inset-0 border-2 border-cyber-neon-pink rounded-lg pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export function PowerUpPanel() {
  const { 
    myPowerUpUses, 
    pendingPowerUp, 
    setPendingPowerUp,
    usePowerUp,
    pendingPowerUpTarget,
    setPendingPowerUpTarget,
    pendingLetterBan,
    setPendingLetterBan,
    shieldActive,
    isFrozen,
  } = useGameStore()
  
  const match = useGameStore(s => s.match)
  const players = match?.players || []
  const opponents = players.filter(p => p.id !== useGameStore.getState().myPlayer?.id)

  const handlePowerUpClick = (type: PowerUpType) => {
    if (pendingPowerUp === type) {
      setPendingPowerUp(null)
      setPendingPowerUpTarget(null)
      setPendingLetterBan(null)
      return
    }
    
    setPendingPowerUp(type)
    
    if (type === 'hint_steal' || type === 'freeze' || type === 'bomb' || type === 'letter_ban') {
      // Need target selection
    } else {
      usePowerUp(type)
      setPendingPowerUp(null)
    }
  }

  const handleTargetSelect = (targetId: string) => {
    if (!pendingPowerUp) return
    
    if (pendingPowerUp === 'letter_ban') {
      setPendingPowerUpTarget(targetId)
    } else {
      usePowerUp(pendingPowerUp, targetId)
      setPendingPowerUp(null)
      setPendingPowerUpTarget(null)
    }
  }

  const handleLetterSelect = (letter: string) => {
    if (!pendingPowerUpTarget || pendingPowerUp !== 'letter_ban') return
    
    usePowerUp('letter_ban', pendingPowerUpTarget, letter)
    setPendingPowerUp(null)
    setPendingPowerUpTarget(null)
    setPendingLetterBan(null)
  }

  if (pendingPowerUp === 'letter_ban' && pendingPowerUpTarget) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card rounded-xl p-4"
      >
        <div className="text-center mb-4">
          <h3 className="text-cyber-neon-red font-bold flex items-center justify-center gap-2">
            <span className="text-2xl">🚫</span> Letter Ban Active
            <span className="text-2xl">🚫</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Choose a letter to ban for 25 seconds
          </p>
        </div>
        
        <LetterBanKeyboard onSelect={handleLetterSelect} disabled={isFrozen} />
        
        <button
          onClick={() => {
            setPendingPowerUp(null)
            setPendingPowerUpTarget(null)
            setPendingLetterBan(null)
          }}
          className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </motion.div>
    )
  }

  if (pendingPowerUp && (pendingPowerUp === 'hint_steal' || pendingPowerUp === 'freeze' || pendingPowerUp === 'bomb' || pendingPowerUp === 'letter_ban')) {
    const powerUp = POWER_UPS.find(p => p.type === pendingPowerUp)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card rounded-xl p-4"
      >
        <div className="text-center mb-4">
          <h3 className="text-cyber-neon-blue font-bold flex items-center justify-center gap-2">
            <span className="text-2xl">{powerUp?.icon}</span> Select Target
            <span className="text-2xl">{powerUp?.icon}</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {powerUp?.description}
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          {opponents.map((player) => (
            <motion.button
              key={player.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTargetSelect(player.id)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all',
                pendingPowerUpTarget === player.id
                  ? 'border-cyber-neon-green bg-cyber-neon-green/20'
                  : 'border-cyber-border bg-cyber-card hover:border-cyber-neon-blue/50'
              )}
            >
              <div className="w-6 h-6 rounded-full bg-cyber-neon-blue flex items-center justify-center text-xs font-bold">
                {player.username[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-medium">{player.username}</span>
              {player.frozen && <span className="text-xs">❄️</span>}
            </motion.button>
          ))}
        </div>
        
        <button
          onClick={() => {
            setPendingPowerUp(null)
            setPendingPowerUpTarget(null)
          }}
          className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-cyber-neon-blue">⚡ Power-Ups</h3>
        {shieldActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xs bg-cyber-neon-blue/20 text-cyber-neon-blue px-2 py-1 rounded-full flex items-center gap-1"
          >
            🛡️ Shield Active
          </motion.span>
        )}
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {POWER_UPS.map((powerUp) => (
          <PowerUpButton
            key={powerUp.type}
            type={powerUp.type}
            usesRemaining={myPowerUpUses[powerUp.type]}
            isActive={shieldActive && powerUp.type === 'shield'}
            isPending={pendingPowerUp === powerUp.type}
            onClick={() => handlePowerUpClick(powerUp.type)}
            disabled={isFrozen}
          />
        ))}
      </div>
      
      {isFrozen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-cyber-neon-blue text-sm flex items-center justify-center gap-2"
        >
          <span>❄️</span> Frozen! Wait to thaw.
        </motion.div>
      )}
    </div>
  )
}

interface PowerUpIndicatorProps {
  type: PowerUpType
  targetUsername?: string
  letter?: string
  expiresAt: number
}

export function PowerUpIndicator({ type, targetUsername, letter, expiresAt }: PowerUpIndicatorProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const powerUp = POWER_UPS.find(p => p.type === type)
  
  useEffect(() => {
    const update = () => {
      setTimeLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)))
    }
    
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])
  
  const getColor = () => {
    switch (type) {
      case 'freeze': return 'bg-cyan-500'
      case 'bomb': return 'bg-orange-500'
      case 'shield': return 'bg-blue-500'
      case 'letter_ban': return 'bg-red-500'
      default: return 'bg-purple-500'
    }
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={clsx(
        'absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-bold whitespace-nowrap z-50',
        getColor(),
        'text-white'
      )}
    >
      {powerUp?.icon} {type === 'letter_ban' ? `BANNED: ${letter}` : powerUp?.name}
      {targetUsername && ` → ${targetUsername}`}
      <span className="ml-1 opacity-75">({timeLeft}s)</span>
    </motion.div>
  )
}

import { useState, useEffect } from 'react'
