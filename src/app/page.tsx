'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Lobby } from '@/components/Lobby'
import { WaitingLobby } from '@/components/WaitingLobby'
import { GameArena } from '@/components/GameArena'
import { createClient } from '@/lib/supabase'
import { User } from '@/types'

export default function Home() {
  const { user, setUser, match, gameStatus } = useGameStore()
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = createClient()
    
    const initUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUser(profile as User)
        } else {
          const newUser: User = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || `Player${Math.floor(Math.random() * 1000)}`,
            rank: 'bronze',
            rating: 1000,
            coins: 100,
            wins: 0,
            losses: 0,
            streak: 0,
            powerup_slots: 4,
          }
          
          await supabase.from('users').insert(newUser)
          setUser(newUser)
        }
      } else {
        const guestId = localStorage.getItem('guest_id') || crypto.randomUUID()
        localStorage.setItem('guest_id', guestId)
        
        setUser({
          id: guestId,
          username: `Guest${Math.floor(Math.random() * 9000) + 1000}`,
          rank: 'bronze',
          rating: 1000,
          coins: 100,
          wins: 0,
          losses: 0,
          streak: 0,
          powerup_slots: 4,
        })
      }
      
      setLoading(false)
    }
    
    initUser()
  }, [setUser])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎮</div>
          <div className="text-cyber-neon-green font-bold">Loading...</div>
        </div>
      </div>
    )
  }
  
  return (
    <main>
      {match ? (
        gameStatus === 'waiting' ? <WaitingLobby /> : <GameArena />
      ) : (
        <Lobby />
      )}
    </main>
  )
}
