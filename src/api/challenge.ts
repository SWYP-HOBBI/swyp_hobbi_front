import { ChallengeApiResponse } from '@/types/challenge';
import { request } from './request';

export const challengeApi = {
  startChallenge: async (challengeNumber: number) => {
    return request<void>({
      url: `/challenge/start/${challengeNumber}`,
      method: 'POST',
    });
  },
  getChallenges: async () => {
    return request<ChallengeApiResponse>({
      url: '/challenge',
      method: 'GET',
    });
  },
};
