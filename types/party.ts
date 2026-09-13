export interface Party {
  id: string
  name: string
  invite_code: string
  created_by: string | null
  created_at: string
}

export interface PartyPlayer {
  id: string
  username: string
  display_name: string | null
  total_xp: number
  completed_challenges: number
}

export interface ChallengeProgress {
  challenge_id: string
  user_id: string
  progress: number
  joined_at: string
  updated_at: string
}

export interface PartyChallenge {
  id: string
  party_id: string
  title: string
  description: string
  target: number
  unit: string
  start_date: string
  end_date: string
  status: 'upcoming' | 'active' | 'completed' | 'expired'
  created_by: string | null
  participants: ChallengeProgress[]
}

export interface PartyState {
  party: Party | null
  members: PartyPlayer[]
  challenges: PartyChallenge[]
  today: string
}
