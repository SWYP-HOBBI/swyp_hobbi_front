// 알림 타입
export type NotificationType = 'COMMENT' | 'LIKE';

// 알림 리스트 응답 타입
export interface Notification {
  notificationId: number; // 알림 ID
  receiverId: number; // 수신자 ID
  targetPostId: number; // 게시글 ID
  senderNickname: string; // 발신자 닉네임
  message: string; // 알림 메시지
  notificationType: NotificationType; // 알림 타입 (COMMENT, LIKE )
  read: boolean; // 읽음 여부 (true / false)
  createdAt: string; // 생성 시간
}

// 알림 리스트 조회 요청 타입
export interface NotificationListRequest {
  lastNotificationId: number;
  pageSize: number;
}

// 알림 리스트 응답 타입 (알림 목록)
export type NotificationListResponse = Notification[];

// 알림 상세 조회 응답 타입
export interface NotificationDetailResponse {
  notificationId: number; // 알림 ID
  receiverId: number; // 수신자 ID
  targetPostId: number; // 게시글 ID
  senderNickname: string; // 발신자 닉네임
  message: string; // 알림 메시지
  notificationType: NotificationType; // 알림 타입 (COMMENT, LIKE 등)
  read: boolean; // 읽음 여부
  createdAt: string; // 생성 시간
}

// 알림 선택 읽음 처리 요청 타입
export interface MarkSelectedReadRequest {
  notificationIds: number[]; // 읽음 처리할 알림 ID 목록
}

// 읽지 않은 알림 수 응답 타입
export interface UnreadCountResponse {
  unreadCount: number; // 읽지 않은 알림 개수
}

export interface NotificationListProps {
  showCheckbox: boolean;
  selectedNotifications: number[];
  setSelectedNotifications: React.Dispatch<React.SetStateAction<number[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  isChecked: boolean[];
  setIsChecked: React.Dispatch<React.SetStateAction<boolean[]>>;
}
