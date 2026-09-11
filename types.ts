export type Status = 'Delivered' | 'Pending' | 'Failed';

export const STATUSES: Status[] = ['Delivered', 'Pending', 'Failed'];

export interface SmsMessage {
  id: string;
  name: string;
  recipient: string;
  carrier: string;
  campaign: string;
  message: string;
  status: Status;
  sentAt: number;
  updatedAt: number;
  segments: number;
  cost: number;
  failReason?: string;
}

export interface SendPayload {
  campaign: string;
  sender: string;
  message: string;
  recipients: string[];
}
