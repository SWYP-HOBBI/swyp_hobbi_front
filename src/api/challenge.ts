import { ChallengeApiResponse, ChallengeType } from '@/types/challenge';
import { request } from './request';

export const challengeApi = {
  startChallenge: async (challengeType: ChallengeType) => {
    return request<void>({
      url: '/challenge/start',
      method: 'POST',
      params: {
        challengeType,
      },
    });
  },
  getChallenges: async () => {
    return request<ChallengeApiResponse>({
      url: '/challenge',
      method: 'GET',
    });
  },
};
