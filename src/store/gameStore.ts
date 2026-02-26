import { create } from 'zustand'
import { 
  GameMode, 
  GameStatus, 
  Player, 
  Match, 
  User,
  PowerUpType,
  LetterStatus,
  LETTER_STATUS,
  PowerUpUse
} from '@/types'
import { getRandomWord, getWordList } from '@/data/words'

interface ActivePowerUp {
  type: PowerUpType
  targetId?: string
  letter?: string
  expiresAt: number
  guessesUsed?: number
}

interface GameState {
  user: User | null
  match: Match | null
  myPlayer: Player | null
  localGuesses: Record<string, { letter: string; status: LetterStatus }[][]>
  activePowerUps: ActivePowerUp[]
  gameStatus: GameStatus
  winner: Player | null
  timeLeft: number
  isFrozen: boolean
  bannedLetters: { letter: string; expiresAt: number }[]
  doubleGuessUsed: boolean
  shieldActive: boolean
  myPowerUpUses: Record<PowerUpType, number>
  pendingPowerUp: PowerUpType | null
  pendingPowerUpTarget: string | null
  pendingLetterBan: string | null
  guessFeed: { id: string; username: string; guess: string; isMe: boolean }[]
  emotes: { id: string; userId: string; username: string; emoji: string; x: number; y: number }[]
  
  setUser: (user: User | null) => void
  createMatch: (mode: GameMode, wordLength: number, lobbyCode?: string) => void
  joinMatch: (matchId: string, isHost?: boolean) => void
  addBot: (botName?: string) => void
  startMatch: () => void
  setMatch: (match: Match) => void
  setMyPlayer: (player: Player) => void
  
  submitGuess: (guess: string) => boolean
  addGuess: (guess: string) => void
  setCurrentGuess: (guess: string) => void
  
  activatePowerUp: (type: PowerUpType, targetId?: string, letter?: string) => void
  setPendingPowerUp: (type: PowerUpType | null) => void
  setPendingPowerUpTarget: (targetId: string | null) => void
  setPendingLetterBan: (letter: string | null) => void
  
  freezePlayer: (playerId: string, duration: number) => void
  unfreezePlayer: (playerId: string) => void
  
  activateShield: () => void
  deactivateShield: () => void
  
  addBannedLetter: (letter: string, playerId: string, duration: number) => void
  removeBannedLetter: (letter: string, playerId: string) => void
  
  applyBomb: (playerId: string) => void
  
  setTimeLeft: (time: number) => void
  
  addToGuessFeed: (entry: { id: string; username: string; guess: string; isMe: boolean }) => void
  addEmote: (entry: { id: string; userId: string; username: string; emoji: string; x: number; y: number }) => void
  
  setWinner: (player: Player | null) => void
  resetGame: () => void
}

const MAX_GUESSES = 6

function checkGuess(guess: string, secret: string): { letter: string; status: LetterStatus }[] {
  const result: { letter: string; status: LetterStatus }[] = []
  const secretArr = secret.split('')
  const guessArr = guess.split('')
  const statuses: LetterStatus[] = new Array(guess.length).fill(LETTER_STATUS.ABSENT)
  
  for (let i = 0; i < guess.length; i++) {
    if (guessArr[i] === secretArr[i]) {
      statuses[i] = LETTER_STATUS.CORRECT
      secretArr[i] = ''
    }
  }
  
  for (let i = 0; i < guess.length; i++) {
    if (statuses[i] !== LETTER_STATUS.CORRECT) {
      const idx = secretArr.indexOf(guessArr[i])
      if (idx !== -1) {
        statuses[i] = LETTER_STATUS.PRESENT
        secretArr[idx] = ''
      }
    }
    result.push({ letter: guessArr[i], status: statuses[i] })
  }
  
  return result
}

function isWordValid(word: string, length: number): boolean {
  const wordList = getWordList(length)
  return wordList.includes(word.toLowerCase())
}

export const useGameStore = create<GameState>((set, get) => ({
  user: null,
  match: null,
  myPlayer: null,
  localGuesses: {},
  activePowerUps: [],
  gameStatus: 'waiting',
  winner: null,
  timeLeft: 180,
  isFrozen: false,
  bannedLetters: [],
  doubleGuessUsed: false,
  shieldActive: false,
  myPowerUpUses: {
    hint_steal: 3,
    freeze: 2,
    bomb: 2,
    double_guess: 3,
    shield: 3,
    letter_ban: 2,
  },
  pendingPowerUp: null,
  pendingPowerUpTarget: null,
  pendingLetterBan: null,
  guessFeed: [],
  emotes: [],
  
  setUser: (user) => set({ user }),
  
  createMatch: (mode, wordLength, lobbyCode = '') => {
    const { user } = get()
    if (!user) return
    
    const secretWord = getRandomWord(wordLength)
    const hostPlayer: Player = {
      id: crypto.randomUUID(),
      user_id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      guesses: [],
      currentGuess: '',
      solved: false,
      score: 0,
      isHost: true,
    }
    
    const newMatch: Match = {
      id: lobbyCode || crypto.randomUUID(),
      mode,
      status: 'waiting',
      word_length: wordLength,
      secret_word: secretWord,
      players: [hostPlayer],
      max_players: mode === 'duel' ? 2 : mode === 'arena' ? 4 : mode === 'chaos' ? 8 : mode === 'team' ? 6 : 8,
      created_at: Date.now(),
    }
    
    set({ 
      match: newMatch, 
      myPlayer: hostPlayer,
      gameStatus: 'waiting',
      localGuesses: { [hostPlayer.id]: [] }
    })
  },
  
  addBot: (botName?: string) => {
    const { match, localGuesses } = get()
    if (!match) return
    
    const botNames = ['BotAlice', 'BotBob', 'BotCharlie', 'BotDave', 'BotEve', 'BotFrank', 'BotGrace', 'BotHenry']
    const existingBotNames = match.players.filter(p => p.username.startsWith('Bot')).map(p => p.username)
    const availableBotNames = botNames.filter(n => !existingBotNames.includes(n))
    const selectedName = botName || availableBotNames[0] || `Bot${Math.floor(Math.random() * 100)}`
    
    const botPlayer: Player = {
      id: crypto.randomUUID(),
      user_id: 'bot',
      username: selectedName,
      guesses: [],
      currentGuess: '',
      solved: false,
      score: 0,
      isBot: true,
    }
    
    const updatedPlayers = [...match.players, botPlayer]
    const updatedMatch = { ...match, players: updatedPlayers }
    
    set({ 
      match: updatedMatch,
      localGuesses: { ...localGuesses, [botPlayer.id]: [] }
    })
  },
  
  joinMatch: (matchId, isHost = false) => {
    const { user, match: existingMatch } = get()
    if (!user) return
    
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      user_id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      guesses: [],
      currentGuess: '',
      solved: false,
      score: 0,
      isHost,
    }
    
    const { localGuesses } = get()
    
    if (existingMatch && existingMatch.id === matchId) {
      const updatedPlayers = [...existingMatch.players, newPlayer]
      const updatedMatch = { ...existingMatch, players: updatedPlayers }
      set({ 
        match: updatedMatch, 
        myPlayer: newPlayer,
        localGuesses: { ...localGuesses, [newPlayer.id]: [] }
      })
    } else {
      const secretWord = getRandomWord(5)
      const newMatch: Match = {
        id: matchId,
        mode: 'duel',
        status: 'waiting',
        word_length: 5,
        secret_word: secretWord,
        players: [newPlayer],
        max_players: 2,
        created_at: Date.now(),
      }
      set({ 
        match: newMatch, 
        myPlayer: newPlayer,
        gameStatus: 'waiting',
        localGuesses: { [newPlayer.id]: [] }
      })
    }
  },
  
  startMatch: () => {
    const { match } = get()
    if (!match) return
    
    set({ 
      match: { ...match, status: 'playing', started_at: Date.now() },
      gameStatus: 'playing',
      timeLeft: 180,
    })
  },
  
  setMatch: (match) => set({ match }),
  
  setMyPlayer: (player) => set({ myPlayer: player }),
  
  submitGuess: (guess) => {
    const { match, myPlayer, isFrozen, bannedLetters, doubleGuessUsed } = get()
    if (!match || !myPlayer || isFrozen) return false
    
    const normalizedGuess = guess.toUpperCase()
    const wordLength = match.word_length
    
    if (normalizedGuess.length !== wordLength) return false
    if (!isWordValid(normalizedGuess, wordLength)) return false
    
    const hasBannedLetter = bannedLetters.some(
      b => normalizedGuess.includes(b.letter) && b.expiresAt > Date.now()
    )
    if (hasBannedLetter) return false
    
    const guessResult = checkGuess(normalizedGuess, match.secret_word)
    
    set((state) => {
      const playerGuesses = state.localGuesses[myPlayer.id] || []
      const newGuesses = [...playerGuesses, guessResult]
      
      const solved = normalizedGuess === match.secret_word
      const newStatus = solved ? 'finished' : 
        (newGuesses.length >= MAX_GUESSES ? 'finished' : state.gameStatus)
      
      const updatedPlayer = {
        ...myPlayer,
        guesses: [...myPlayer.guesses, normalizedGuess],
        solved,
        solvedAt: solved ? Date.now() : undefined,
        isWinner: solved,
      }
      
      const updatedPlayers = state.match!.players.map(p => 
        p.id === myPlayer.id ? updatedPlayer : p
      )
      
      let newMyPowerUpUses = { ...state.myPowerUpUses }
      if (get().pendingPowerUp === 'double_guess' && !state.doubleGuessUsed) {
        newMyPowerUpUses.double_guess = state.myPowerUpUses.double_guess
      }
      
      return {
        localGuesses: { ...state.localGuesses, [myPlayer.id]: newGuesses },
        myPlayer: updatedPlayer,
        match: { ...state.match!, players: updatedPlayers, status: newStatus },
        gameStatus: newStatus,
        winner: solved ? updatedPlayer : state.winner,
        doubleGuessUsed: get().pendingPowerUp === 'double_guess' ? true : state.doubleGuessUsed,
        pendingPowerUp: null,
        pendingPowerUpTarget: null,
      }
    })
    
    return true
  },
  
  addGuess: (guess) => {
    const { match, myPlayer } = get()
    if (!match || !myPlayer) return
    
    const guessResult = checkGuess(guess, match.secret_word)
    
    set((state) => {
      const playerGuesses = state.localGuesses[myPlayer.id] || []
      return {
        localGuesses: { ...state.localGuesses, [myPlayer.id]: [...playerGuesses, guessResult] }
      }
    })
  },
  
  setCurrentGuess: (guess) => {
    const { myPlayer } = get()
    if (!myPlayer) return
    
    set((state) => ({
      myPlayer: { ...state.myPlayer!, currentGuess: guess }
    }))
  },
  
  activatePowerUp: (type, targetId, letter) => {
    const { myPowerUpUses, shieldActive } = get()
    
    if (myPowerUpUses[type] <= 0) return
    
    if (shieldActive && type !== 'shield') {
      return
    }
    
    set((state) => ({
      myPowerUpUses: {
        ...state.myPowerUpUses,
        [type]: state.myPowerUpUses[type] - 1
      }
    }))
    
    const expiresAt = type === 'letter_ban' ? Date.now() + 25000 : 
                      type === 'freeze' ? Date.now() + 15000 :
                      type === 'shield' ? Date.now() + 30000 :
                      Date.now() + 30000
    
    const activePowerUp: ActivePowerUp = {
      type,
      targetId,
      letter,
      expiresAt,
      guessesUsed: type === 'letter_ban' ? 0 : undefined,
    }
    
    set((state) => ({
      activePowerUps: [...state.activePowerUps, activePowerUp]
    }))
    
    if (type === 'shield') {
      set({ shieldActive: true })
      setTimeout(() => {
        set({ shieldActive: false })
      }, 30000)
    }
    
    if (type === 'freeze' && targetId) {
      set((state) => ({
        isFrozen: true,
        match: state.match ? {
          ...state.match,
          players: state.match.players.map(p => 
            p.id === targetId ? { ...p, frozen: true } : p
          )
        } : null
      }))
      
      setTimeout(() => {
        set((state) => ({
          isFrozen: false,
          match: state.match ? {
            ...state.match,
            players: state.match.players.map(p => 
              p.id === targetId ? { ...p, frozen: false } : p
            )
          } : null
        }))
      }, 15000)
    }
    
    if (type === 'letter_ban' && targetId && letter) {
      get().addBannedLetter(letter, targetId, 25000)
    }
  },
  
  setPendingPowerUp: (type) => set({ pendingPowerUp: type }),
  setPendingPowerUpTarget: (targetId) => set({ pendingPowerUpTarget: targetId }),
  setPendingLetterBan: (letter) => set({ pendingLetterBan: letter }),
  
  freezePlayer: (playerId, duration) => {
    set((state) => ({
      isFrozen: true,
      match: state.match ? {
        ...state.match,
        players: state.match.players.map(p => 
          p.id === playerId ? { ...p, frozen: true } : p
        )
      } : null
    }))
    
    setTimeout(() => {
      set((state) => ({
        isFrozen: false,
        match: state.match ? {
          ...state.match,
          players: state.match.players.map(p => 
            p.id === playerId ? { ...p, frozen: false } : p
          )
        } : null
      }))
    }, duration)
  },
  
  unfreezePlayer: (playerId) => {
    set((state) => ({
      isFrozen: false,
      match: state.match ? {
        ...state.match,
        players: state.match.players.map(p => 
          p.id === playerId ? { ...p, frozen: false } : p
        )
      } : null
    }))
  },
  
  activateShield: () => set({ shieldActive: true }),
  deactivateShield: () => set({ shieldActive: false }),
  
  addBannedLetter: (letter, playerId, duration) => {
    set((state) => {
      if (state.myPlayer?.id !== playerId) return state
      
      const newBanned = {
        letter: letter.toUpperCase(),
        expiresAt: Date.now() + duration
      }
      
      return {
        bannedLetters: [...state.bannedLetters, newBanned]
      }
    })
  },
  
  removeBannedLetter: (letter, playerId) => {
    set((state) => {
      if (state.myPlayer?.id !== playerId) return state
      
      return {
        bannedLetters: state.bannedLetters.filter(b => b.letter !== letter)
      }
    })
  },
  
  applyBomb: (playerId) => {
    console.log('Bomb applied to player:', playerId)
  },
  
  setTimeLeft: (time) => set({ timeLeft: time }),
  
  addToGuessFeed: (entry) => {
    set((state) => ({
      guessFeed: [...state.guessFeed.slice(-50), entry]
    }))
  },
  
  addEmote: (entry) => {
    set((state) => ({
      emotes: [...state.emotes, entry]
    }))
    
    setTimeout(() => {
      set((state) => ({
        emotes: state.emotes.filter(e => e.id !== entry.id)
      }))
    }, 3000)
  },
  
  setWinner: (player) => set({ winner: player, gameStatus: 'finished' }),
  
  resetGame: () => set({
    match: null,
    myPlayer: null,
    localGuesses: {},
    activePowerUps: [],
    gameStatus: 'waiting',
    winner: null,
    timeLeft: 180,
    isFrozen: false,
    bannedLetters: [],
    doubleGuessUsed: false,
    shieldActive: false,
    myPowerUpUses: {
      hint_steal: 3,
      freeze: 2,
      bomb: 2,
      double_guess: 3,
      shield: 3,
      letter_ban: 2,
    },
    pendingPowerUp: null,
    pendingPowerUpTarget: null,
    pendingLetterBan: null,
    guessFeed: [],
    emotes: [],
  }),
}))
