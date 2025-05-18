import { EventSourcePolyfill } from 'event-source-polyfill';
import { useAuthStore } from '@/store/auth';

export const connectNotificationSSE = (onMessage) => {
  const { accessToken } = useAuthStore.getState();

  if (!accessToken) {
    console.warn(' Access token is missing. SSE connection aborted.');
    return null;
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/sse/subscribe`;

  const eventSource = new EventSourcePolyfill(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  eventSource.onopen = () => {};

  eventSource.onmessage = (event) => {
    onMessage(event.data);
  };

  eventSource.onerror = (error) => {
    console.error('EventSource failed:', error);
    eventSource.close();
  };

  return eventSource;
};
