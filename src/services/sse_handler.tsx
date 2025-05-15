'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { connectNotificationSSE } from '@/services/sse';

export default function SSEHandler() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 10000;

    const connectSSE = () => {
      if (!isAuthenticated) return null;

      try {
        eventSource = connectNotificationSSE((data: string) => {
          try {
            retryCount = 0;
          } catch (error) {
            console.error('SSE 메시지 파싱 에러:', error);
          }
        });

        // SSE 이벤트 핸들러 설정
        if (eventSource) {
          eventSource.onopen = () => {
            console.log('SSE 연결이 열렸습니다.');
            retryCount = 0; // 연결 성공시 재시도 카운트 초기화
          };

          eventSource.onerror = () => {
            console.error('SSE 연결 에러 발생');
            if (eventSource) {
              eventSource.close();
              eventSource = null;
            }

            // 재연결 로직
            if (retryCount < maxRetries) {
              retryCount++;

              setTimeout(() => {
                eventSource = connectSSE();
              }, retryDelay);
            } else {
              console.error('최대 재시도 횟수를 초과했습니다.');
            }
          };
        }

        return eventSource;
      } catch (error) {
        console.error('SSE 연결 생성 중 에러:', error);
        return null;
      }
    };

    // 초기 SSE 연결
    eventSource = connectSSE();

    // 클린업
    return () => {
      if (eventSource) {
        console.log('SSE 연결을 종료합니다.');
        eventSource.close();
        eventSource = null;
      }
    };
  }, [isAuthenticated]);

  return null;
}
