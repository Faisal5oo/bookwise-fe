export interface Book {
  id: string;
  bookName: string;
  description: string;
  bookImages: string[];
  owner_id: string;
  genre: string;
  author: string;
  condition: string;
  is_taken: boolean;
  created_at: string;
  view_count: number;
}

export interface BookSearchParams {
  query?: string;
  genre?: string;
  condition?: string;
  author?: string;
  location?: string;
  skip?: number;
  limit?: number;
} 