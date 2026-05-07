export type NotificationType = 0 | 1;
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  0: 'TARGET_PRICE_REACHED',
  1: 'NEW_LOWEST_PRICE',
};

export interface AppNotification {
  id: string;
  productId: string;
  productName: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}
