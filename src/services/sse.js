import { EventSourcePolyfill } from 'event-source-polyfill';
import { useAuthStore } from '@/store/auth';
import { useNotificationStore } from '@/store/notification';

export const connectNotificationSSE = (onMessage) => {
  const { accessToken } = useAuthStore.getState();
  const { setUnreadCount } = useNotificationStore.getState();

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
    // console.log('[SSE] onmessage:', event.data);
  };

  eventSource.addEventListener('notification', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to parse SSE data:', err);
    }
  });

  eventSource.onerror = (error) => {
    console.error('EventSource failed:', error);
    eventSource.close();
  };

  return eventSource;
};
