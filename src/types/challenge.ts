export type ChallengeStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export enum ChallengeType {
  SHOWOFF = 'SHOWOFF',
  ROUTINER = 'ROUTINER',
  RICH = 'RICH',
}

export interface Challenge {
  id: string;
  title: string;
  current: number;
  total: number;
  description: string;
  reward: string;
  status: ChallengeStatus;
  challengeType: ChallengeType;
}

export interface ChallengeState {
  challenges: Challenge[];
  remainingTime: number; // 남은 시간(초)
  weekStartDate: Date | null; // 주의 시작일
}

export interface ChallengeApiResponse {
  challenge1: {
    started: boolean;
    achieved: boolean;
    point: number;
  };
  challenge2: {
    started: boolean;
    achieved: boolean;
    point: number;
  };
  challenge3: {
    started: boolean;
    achieved: boolean;
    point: number;
  };
}
