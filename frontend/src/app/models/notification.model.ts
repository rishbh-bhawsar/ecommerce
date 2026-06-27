export interface Notification {
  id: string;
  message: string;
  type: 'product-added' | 'product-deleted' | 'info' | 'error';
  timestamp: Date;
}
