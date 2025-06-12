export enum ExchangeStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface ExchangeRequest {
  requester_id: string;
  book_id: string;
  owner_id: string;
  message?: string;
  status?: ExchangeStatus;
  created_at?: string;
}

export interface ExchangeResponse {
  exchange_id: string;
  response_type: ExchangeStatus;
  message?: string;
  created_at?: string;
}

export interface ExchangeDetails {
  id: string;
  requester_id: string;
  book_id: string;
  owner_id: string;
  message?: string;
  status: ExchangeStatus;
  created_at: string;
  response?: ExchangeResponse;
  
  // Additional fields for UI display
  book_name?: string;
  book_author?: string;
  book_image?: string;
  requester_name?: string;
  owner_name?: string;
}

// API Response wrapper
export interface ExchangeApiResponse {
  exchanges: ExchangeDetails[];
  total_exchanges: number;
} 