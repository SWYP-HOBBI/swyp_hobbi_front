export interface Challenge {
  id: string;
  title: string;
  current: number;
  total: number;
  description?: string;
  reward?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ChallengeState {
  challenges: Challenge[];
  remainingTime: number; // 남은 시간(초)
  weekStartDate: Date | null; // 주의 시작일
}
