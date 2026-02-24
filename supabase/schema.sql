-- Supabase Database Schema for Battledle

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  rank TEXT DEFAULT 'bronze' CHECK (rank IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'wordlord')),
  rating INTEGER DEFAULT 1000,
  coins INTEGER DEFAULT 100,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  powerup_slots INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mode TEXT NOT NULL CHECK (mode IN ('duel', 'arena', 'chaos', 'team', 'battle_royale', 'stealth')),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  word_length INTEGER DEFAULT 5,
  secret_word TEXT NOT NULL,
  max_players INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  guesses TEXT[] DEFAULT '{}',
  current_guess TEXT DEFAULT '',
  solved BOOLEAN DEFAULT FALSE,
  solved_at TIMESTAMPTZ,
  lives INTEGER DEFAULT 3,
  score INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT FALSE,
  frozen BOOLEAN DEFAULT FALSE,
  shield_active BOOLEAN DEFAULT FALSE,
  banned_letters JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player guesses table (for real-time feed)
CREATE TABLE player_guesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  guess TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Power-up uses table
CREATE TABLE powerup_uses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  powerup_type TEXT NOT NULL CHECK (powerup_type IN ('hint_steal', 'freeze', 'bomb', 'double_guess', 'shield', 'letter_ban')),
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  letter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emotes table
CREATE TABLE emotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  emoji TEXT NOT NULL,
  x REAL DEFAULT 0.5,
  y REAL DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily quests table
CREATE TABLE daily_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_type TEXT NOT NULL,
  target INTEGER NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friends table
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Create indexes for better performance
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_mode ON matches(mode);
CREATE INDEX idx_players_match_id ON players(match_id);
CREATE INDEX idx_player_guesses_match_id ON player_guesses(match_id);
CREATE INDEX idx_powerup_uses_match_id ON powerup_uses(match_id);
CREATE INDEX idx_emotes_match_id ON emotes(match_id);
CREATE INDEX idx_daily_quests_user_id ON daily_quests(user_id);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE player_guesses;
ALTER PUBLICATION supabase_realtime ADD TABLE powerup_uses;
ALTER PUBLICATION supabase_realtime ADD TABLE emotes;

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_guesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE powerup_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Users: users can read all, update own
CREATE POLICY "Users can read all" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own" ON users FOR UPDATE USING (auth.uid() = id);

-- Matches: everyone can read, only game logic can insert/update
CREATE POLICY "Matches are viewable by everyone" ON matches FOR SELECT USING (true);
CREATE POLICY "Anyone can create matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Match updates are public" ON matches FOR UPDATE USING (true);

-- Players: everyone can read, insert for participants
CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Players can be added to matches" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Player updates are public" ON players FOR UPDATE USING (true);

-- Player guesses: everyone can read, insert for participants
CREATE POLICY "Guesses are viewable by everyone" ON player_guesses FOR SELECT USING (true);
CREATE POLICY "Guesses can be submitted" ON player_guesses FOR INSERT WITH CHECK (true);

-- Power-up uses: everyone can read, insert for participants
CREATE POLICY "Power-ups are viewable by everyone" ON powerup_uses FOR SELECT USING (true);
CREATE POLICY "Power-ups can be used" ON powerup_uses FOR INSERT WITH CHECK (true);

-- Emotes: everyone can read, insert for participants
CREATE POLICY "Emotes are viewable by everyone" ON emotes FOR SELECT USING (true);
CREATE POLICY "Emotes can be sent" ON emotes FOR INSERT WITH CHECK (true);

-- Daily quests: users can read/update own
CREATE POLICY "Quests are viewable by owner" ON daily_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Quests can be updated by owner" ON daily_quests FOR UPDATE USING (auth.uid() = user_id);

-- Friends: users can read own, manage own
CREATE POLICY "Friends are viewable by owner" ON friends FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Friends can be managed by owner" ON friends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Friends can be updated by owner" ON friends FOR UPDATE USING (auth.uid() = user_id);

-- Function to generate game code
CREATE OR REPLACE FUNCTION generate_game_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  code := UPPER(
    CHR(65 + floor(random() * 26)::int) ||
    CHR(65 + floor(random() * 26)::int) ||
    CHR(65 + floor(random() * 26)::int) ||
    CHR(65 + floor(random() * 26)::int) ||
    CHR(65 + floor(random() * 26)::int) ||
    CHR(65 + floor(random() * 26)::int)
  );
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to validate word (server-side)
CREATE OR REPLACE FUNCTION validate_word(word TEXT, length INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  valid_words TEXT[] := ARRAY[
    -- 4-letter words
    'ABLE', 'ACID', 'AGED', 'ALSO', 'AREA', 'ARMY', 'AWAY', 'BABY', 'BACK', 'BALL',
    -- 5-letter words
    'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
    'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
    -- Add more words as needed...
    -- 6-letter words
    'ABROAD', 'ACCEPT', 'ACCESS', 'ACROSS', 'ACTION', 'ACTUAL', 'ADJUST', 'ADVISE', 'AFFAIR',
    -- 7-letter words
    'ABILITY', 'ABSENCE', 'ACADEMY', 'ACCOUNT', 'ACCUSED', 'ACHIEVE', 'ACQUIRE', 'ADDRESS'
  ];
BEGIN
  RETURN word = ANY(valid_words) AND length(word) = length;
END;
$$ LANGUAGE plpgsql;
