import { EventSourcePolyfill } from 'event-source-polyfill';
import { useAuthStore } from '@/store/auth';

export const connectNotificationSSE = (onMessage) => {
  const { accessToken } = useAuthStore.getState();

  if (!accessToken) {
    console.warn(' Access token is missing. SSE connection aborted.');
    return null;
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/sse/subscribe`;

  console.log('Connecting to SSE URL:', url);
  console.log(' Sending Authorization header:', `Bearer ${accessToken}`);

  const eventSource = new EventSourcePolyfill(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  eventSource.onopen = () => {
    console.log(' SSE connection opened');
  };

  eventSource.onmessage = (event) => {
    console.log('Received event:', event.data);
    onMessage(event.data);
  };

  eventSource.onerror = (error) => {
    console.error('EventSource failed:', error);
    eventSource.close();
  };

  return eventSource;
};
