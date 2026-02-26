export type GameMode = 'duel' | 'arena' | 'chaos' | 'team' | 'battle_royale' | 'stealth'
export type GameStatus = 'waiting' | 'playing' | 'finished'
export type Rank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'wordlord'

export interface User {
  id: string
  username: string
  avatar_url?: string
  rank: Rank
  rating: number
  coins: number
  wins: number
  losses: number
  streak: number
  powerup_slots: number
}

export interface Player {
  id: string
  user_id: string
  username: string
  avatar_url?: string
  guesses: string[]
  currentGuess: string
  solved: boolean
  solvedAt?: number
  lives?: number
  score: number
  isWinner?: boolean
  isHost?: boolean
  isBot?: boolean
  frozen?: boolean
  shield_active?: boolean
  banned_letters?: { letter: string; expiresAt: number }[]
}

export interface Match {
  id: string
  mode: GameMode
  status: GameStatus
  word_length: number
  secret_word: string
  players: Player[]
  max_players: number
  created_at: number
  started_at?: number
  ended_at?: number
  team_mode?: boolean
}

export type PowerUpType = 
  | 'hint_steal' 
  | 'freeze' 
  | 'bomb' 
  | 'double_guess' 
  | 'shield' 
  | 'letter_ban'

export interface PowerUpUse {
  id: string
  match_id: string
  user_id: string
  powerup_type: PowerUpType
  target_user_id?: string
  created_at: number
  letter?: string
}

export interface PowerUp {
  type: PowerUpType
  name: string
  description: string
  icon: string
  cooldown: number
  uses_per_match: number
}

export const POWER_UPS: PowerUp[] = [
  {
    type: 'hint_steal',
    name: 'Hint Steal',
    description: 'Reveal one letter from opponent\'s word',
    icon: '👁️',
    cooldown: 30,
    uses_per_match: 3,
  },
  {
    type: 'freeze',
    name: 'Freeze',
    description: 'Freeze opponent for 15 seconds',
    icon: '❄️',
    cooldown: 50,
    uses_per_match: 2,
  },
  {
    type: 'bomb',
    name: 'Bomb',
    description: 'Shuffle opponent\'s colors for one round',
    icon: '💣',
    cooldown: 40,
    uses_per_match: 2,
  },
  {
    type: 'double_guess',
    name: 'Double Guess',
    description: 'Submit an extra guess this round',
    icon: '✨',
    cooldown: 35,
    uses_per_match: 3,
  },
  {
    type: 'shield',
    name: 'Shield',
    description: 'Block one power-up (lasts 30s)',
    icon: '🛡️',
    cooldown: 45,
    uses_per_match: 3,
  },
  {
    type: 'letter_ban',
    name: 'Letter Ban',
    description: 'Ban a letter from opponent for 25s or 2 guesses',
    icon: '🚫',
    cooldown: 50,
    uses_per_match: 2,
  },
]

export const WORD_LENGTHS = [4, 5, 6, 7] as const
export type WordLength = typeof WORD_LENGTHS[number]

export const GAME_MODE_CONFIG = {
  duel: { minPlayers: 2, maxPlayers: 2, name: 'Duel (1v1)', description: 'Best of 3 rounds' },
  arena: { minPlayers: 2, maxPlayers: 4, name: 'Arena', description: '2-4 players' },
  chaos: { minPlayers: 5, maxPlayers: 8, name: 'Chaos', description: '5-8 players mayhem' },
  team: { minPlayers: 4, maxPlayers: 6, name: 'Team Battle', description: '2v2 or 3v3' },
  battle_royale: { minPlayers: 4, maxPlayers: 8, name: 'Battle Royale', description: 'Last one standing' },
  stealth: { minPlayers: 2, maxPlayers: 6, name: 'Stealth Mode', description: 'Hidden guesses' },
}

export const RANK_CONFIG: { rank: Rank; minRating: number; color: string; icon: string }[] = [
  { rank: 'bronze', minRating: 0, color: '#cd7f32', icon: '🥉' },
  { rank: 'silver', minRating: 1000, color: '#c0c0c0', icon: '🥈' },
  { rank: 'gold', minRating: 2000, color: '#ffd700', icon: '🥇' },
  { rank: 'platinum', minRating: 3500, color: '#00ced1', icon: '💎' },
  { rank: 'diamond', minRating: 5000, color: '#b9f2ff', icon: '👑' },
  { rank: 'wordlord', minRating: 7500, color: '#ff00ff', icon: '🌟' },
]

export const LETTER_STATUS = {
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent',
  UNKNOWN: 'unknown',
} as const

export type LetterStatus = typeof LETTER_STATUS[keyof typeof LETTER_STATUS]
