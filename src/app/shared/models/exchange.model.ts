export type ExchangeStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
export type ExchangeResponseType = 'accepted' | 'declined' | 'completed';

export interface ExchangeResponse {
  exchange_id: string;
  response_type: ExchangeResponseType;
  message?: string;
  created_at: string;
}

export interface Exchange {
  id: string;
  requester_id: string;
  book_id: string;
  owner_id: string;
  message?: string;
  status: ExchangeStatus;
  created_at: string;
  response?: ExchangeResponse;
}

export interface ExchangeRequest {
  book_id: string;
  owner_id: string;
  message?: string;
} 