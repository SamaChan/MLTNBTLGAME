'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useGameStore } from '@/store/gameStore'
import { Match, Player, PowerUpUse } from '@/types'

export function useRealtime(matchId: string) {
  const supabase = createClient()
  const { setMatch, addToGuessFeed, addEmote } = useGameStore()
  
  useEffect(() => {
    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedMatch = payload.new as Match
            setMatch(updatedMatch)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'player_guesses',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const guess = payload.new as { match_id: string; user_id: string; username: string; guess: string }
          addToGuessFeed({
            id: crypto.randomUUID(),
            username: guess.username,
            guess: guess.guess,
            isMe: false,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'powerup_uses',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const powerUpUse = payload.new as PowerUpUse
          handlePowerUp(powerUpUse)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emotes',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const emote = payload.new as { user_id: string; username: string; emoji: string; x: number; y: number }
          addEmote({
            id: crypto.randomUUID(),
            userId: emote.user_id,
            username: emote.username,
            emoji: emote.emoji,
            x: emote.x,
            y: emote.y,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase, setMatch, addToGuessFeed, addEmote])
}

function handlePowerUp(powerUpUse: PowerUpUse) {
  const { usePowerUp, addBannedLetter, freezePlayer, activateShield, applyBomb, myPlayer } = useGameStore.getState()
  
  if (!myPlayer) return
  
  switch (powerUpUse.powerup_type) {
    case 'freeze':
      if (powerUpUse.target_user_id === myPlayer.id) {
        freezePlayer(myPlayer.id, 15000)
      }
      break
    
    case 'letter_ban':
      if (powerUpUse.target_user_id === myPlayer.id && powerUpUse.letter) {
        addBannedLetter(powerUpUse.letter, myPlayer.id, 25000)
      }
      break
    
    case 'shield':
      if (powerUpUse.target_user_id === myPlayer.id) {
        activateShield()
      }
      break
    
    case 'bomb':
      if (powerUpUse.target_user_id === myPlayer.id) {
        applyBomb(myPlayer.id)
      }
      break
  }
}

export function useMatchActions(matchId: string) {
  const supabase = createClient()
  const { myPlayer, match } = useGameStore()
  
  const submitGuessToServer = useCallback(async (guess: string) => {
    if (!myPlayer || !match) return
    
    const { error } = await supabase.from('player_guesses').insert({
      match_id: matchId,
      user_id: myPlayer.user_id,
      username: myPlayer.username,
      guess,
    })
    
    if (error) {
      console.error('Failed to submit guess:', error)
    }
  }, [matchId, myPlayer, match, supabase])
  
  const usePowerUpOnServer = useCallback(async (
    powerUpType: string,
    targetUserId?: string,
    letter?: string
  ) => {
    if (!myPlayer || !match) return
    
    const { error } = await supabase.from('powerup_uses').insert({
      match_id: matchId,
      user_id: myPlayer.user_id,
      powerup_type: powerUpType,
      target_user_id: targetUserId,
      letter,
    })
    
    if (error) {
      console.error('Failed to use power-up:', error)
    }
  }, [matchId, myPlayer, match, supabase])
  
  const sendEmote = useCallback(async (emoji: string) => {
    if (!myPlayer || !match) return
    
    const { error } = await supabase.from('emotes').insert({
      match_id: matchId,
      user_id: myPlayer.user_id,
      username: myPlayer.username,
      emoji,
      x: Math.random(),
      y: Math.random(),
    })
    
    if (error) {
      console.error('Failed to send emote:', error)
    }
  }, [matchId, myPlayer, match, supabase])
  
  return {
    submitGuessToServer,
    usePowerUpOnServer,
    sendEmote,
  }
}

export function useMatchSync(matchId: string) {
  const supabase = createClient()
  const { setMatch, setMyPlayer } = useGameStore()
  
  useEffect(() => {
    const fetchMatch = async () => {
      const { data: match, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()
      
      if (error) {
        console.error('Failed to fetch match:', error)
        return
      }
      
      setMatch(match)
      
      const { data: players } = await supabase
        .from('players')
        .select('*')
        .eq('match_id', matchId)
      
      if (players) {
        const myPlayer = players.find((p: Player) => p.user_id === useGameStore.getState().user?.id)
        if (myPlayer) {
          setMyPlayer(myPlayer)
        }
      }
    }
    
    fetchMatch()
    
    const channel = supabase
      .channel(`match-sync:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setMatch(payload.new as Match)
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase, setMatch, setMyPlayer])
}
