export interface Book {
  _id?: string;
  book_id?: string;
  user_id: string;
  bookName: string;
  authorName: string;
  description?: string;
  bookCondition: string;
  bookImages: string[];
  is_taken?: boolean;
  created_at?: string;
  view_count?: number;
  owner_id?: string;
  genre?: string;
  author?: string;
  condition?: string;
  posted_date?: string;
  expiry_date?: string;
  status?: string;
  pictures?: string[];
  book_name?: string;
  book_owner?: {
    user_id: string;
    name: string;
    profile_picture_url?: string;
  };
}

export interface PostBookModel {
  user_id: string;
  bookName: string;
  authorName: string;
  description?: string;
  bookCondition: string;
  bookImages: string[];
  is_taken?: boolean;
  created_at?: string;
}

export interface UpdateBookModel {
  bookName?: string;
  authorName?: string;
  description?: string;
  bookCondition?: string;
  bookImages?: string[];
  is_taken?: boolean;
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

export interface BookApiResponse {
  message: string;
  total_books?: number;
  returned_books?: number;
  skip?: number;
  limit?: number;
  books?: Book[];
  book_id?: string;
  book?: Book;
  user_id?: string;
  user_name?: string;
  total_user_books?: number;
} 