import { create } from 'zustand';
import { Challenge } from '@/types/challenge';
import { challengeService } from '@/services/api';

// 다음 월요일 자정까지의 시간을 계산하는 함수
function getTimeUntilNextMonday(): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = 일요일, 1 = 월요일, ...
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  // 다음 월요일 자정 설정
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  // 남은 시간(초) 계산
  return Math.floor((nextMonday.getTime() - now.getTime()) / 1000);
}

interface ChallengeStore {
  challenges: Challenge[];
  remainingTime: number;
  startChallenge: (id: string) => void;
  updateProgress: (id: string, current: number) => void;
  completeChallenge: (id: string) => void;
  updateRemainingTime: () => void;
  fetchChallenges: () => Promise<void>;
}

const initialChallenges: Challenge[] = [
  {
    id: '1',
    title: '취미 자랑',
    current: 0,
    total: 50,
    description: '좋아요 50개',
    reward: '보상 10EXP',
    status: 'NOT_STARTED',
  },
  {
    id: '2',
    title: '루티너',
    current: 0,
    total: 3,
    description: '같은 취미 게시글 작성: 3개',
    reward: '보상 10EXP',
    status: 'NOT_STARTED',
  },
  {
    id: '3',
    title: '취미 부자 되기',
    current: 0,
    total: 3,
    description: '다른 취미 게시글 작성: 3개',
    reward: '보상 10EXP',
    status: 'NOT_STARTED',
  },
];

export const useChallengeStore = create<ChallengeStore>((set) => ({
  challenges: initialChallenges,
  remainingTime: getTimeUntilNextMonday(),

  fetchChallenges: async () => {
    try {
      const response = await challengeService.getChallenges();

      set((state) => ({
        challenges: state.challenges.map((challenge) => {
          const apiChallenge =
            response[`challenge${challenge.id}` as keyof typeof response];
          if (!apiChallenge) return challenge;

          return {
            ...challenge,
            current: apiChallenge.point,
            status: apiChallenge.achieved
              ? 'COMPLETED'
              : apiChallenge.started
                ? 'IN_PROGRESS'
                : 'NOT_STARTED',
          };
        }),
      }));
    } catch (error) {
      console.error('챌린지 조회 실패:', error);
    }
  },

  startChallenge: (id) =>
    set((state) => ({
      challenges: state.challenges.map((challenge) =>
        challenge.id === id
          ? { ...challenge, status: 'IN_PROGRESS' }
          : challenge,
      ),
    })),

  updateProgress: (id, current) =>
    set((state) => ({
      challenges: state.challenges.map((challenge) => {
        if (challenge.id === id) {
          const isCompleted = current >= challenge.total;
          return {
            ...challenge,
            current,
            status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
          };
        }
        return challenge;
      }),
    })),

  completeChallenge: (id) =>
    set((state) => ({
      challenges: state.challenges.map((challenge) =>
        challenge.id === id ? { ...challenge, status: 'COMPLETED' } : challenge,
      ),
    })),

  updateRemainingTime: () =>
    set(() => ({
      remainingTime: getTimeUntilNextMonday(),
    })),
}));
