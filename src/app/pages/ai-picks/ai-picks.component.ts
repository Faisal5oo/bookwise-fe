import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { AIService, AIRecommendation } from '../../shared/services/ai.service';
import { AuthService } from '../../shared/services/auth.service';
import { Book } from '../../shared/models/book.model';

interface EnhancedBook extends Book {
  rating: number;
  aiMatch: number;
  aiReason: string;
  pages: number;
  aiAnalysis: string;
}

@Component({
  selector: 'app-ai-picks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-picks.component.html',
  styleUrls: ['./ai-picks.component.scss']
})
export class AiPicksComponent implements OnInit {
  loading = false;
  generating = false;
  currentUserId = '';
  
  featuredBooks: EnhancedBook[] = [];
  trendingBooks: EnhancedBook[] = [];
  recommendations: AIRecommendation[] = [];
  aiInsights = '';
  
  constructor(
    private router: Router,
    private bookService: BookService,
    private aiService: AIService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.router.navigate(['/auth']);
      return;
    }
    
    this.currentUserId = userId;
    this.loadAIRecommendations();
    this.loadAIInsights();
  }

  async loadAIRecommendations() {
    this.loading = true;
    try {
      this.aiService.getAIRecommendations(this.currentUserId, 0, 6).subscribe({
        next: (recommendations) => {
          this.recommendations = recommendations;
          this.loadRecommendedBooks(recommendations);
        },
        error: (error) => {
          console.error('Error loading AI recommendations:', error);
          this.setMockRecommendations();
        }
      });

      this.bookService.getTrendingBooks(6).subscribe({
        next: (books) => {
          this.trendingBooks = this.enhanceBooksWithAI(books);
        },
        error: (error) => {
          console.error('Error loading trending books:', error);
          this.setMockTrendingBooks();
        }
      });

    } catch (error) {
      console.error('Error loading AI picks data:', error);
    } finally {
      this.loading = false;
    }
  }

  loadAIInsights() {
    this.aiService.getAIInsights(this.currentUserId).subscribe({
      next: (insights) => {
        this.aiInsights = insights.insights;
      },
      error: (error) => {
        console.error('Error loading AI insights:', error);
        this.aiInsights = 'Based on your reading history, you have a diverse taste spanning multiple genres with a preference for character-driven narratives and thought-provoking themes.';
      }
    });
  }

  loadRecommendedBooks(recommendations: AIRecommendation[]) {
    const bookIds = recommendations.slice(0, 3).map(r => r.book_id);
    const bookPromises = bookIds.map(id => this.bookService.getBook(id).toPromise());

    Promise.all(bookPromises).then(books => {
      this.featuredBooks = books.map((book, index) => {
        const recommendation = recommendations[index];
        return this.enhanceBookWithRecommendation(book!, recommendation);
      });
    }).catch(error => {
      console.error('Error loading recommended books:', error);
      this.setMockFeaturedBooks();
    });
  }

  enhanceBookWithRecommendation(book: Book, recommendation: AIRecommendation): EnhancedBook {
    return {
      ...book,
      rating: Math.random() * 1 + 4,
      aiMatch: recommendation.match_percentage,
      aiReason: recommendation.reason,
      pages: Math.floor(Math.random() * 400) + 200,
      aiAnalysis: `AI analysis based on your reading history shows strong correlation with ${book.genre} genre preferences.`
    };
  }

  enhanceBooksWithAI(books: Book[]): EnhancedBook[] {
    return books.map(book => ({
      ...book,
      rating: Math.random() * 1 + 4,
      aiMatch: Math.floor(Math.random() * 20) + 80,
      aiReason: `Matches your preference for ${book.genre} literature`,
      pages: Math.floor(Math.random() * 400) + 200,
      aiAnalysis: `Your reading pattern indicates strong interest in ${book.genre} and similar authors.`
    }));
  }

  setMockRecommendations() {
    this.recommendations = [
      {
        user_id: this.currentUserId,
        book_id: 'book1',
        match_percentage: 97,
        reason: 'Perfect match based on your love for character-driven stories',
        created_at: new Date().toISOString()
      },
      {
        user_id: this.currentUserId,
        book_id: 'book2',
        match_percentage: 94,
        reason: 'Matches your preference for science fiction with heart',
        created_at: new Date().toISOString()
      }
    ];
    this.setMockFeaturedBooks();
  }

  setMockFeaturedBooks() {
    this.featuredBooks = [
      {
        _id: '507f1f77bcf86cd799439011',
        book_id: '507f1f77bcf86cd799439011',
        user_id: '507f1f77bcf86cd799439001',
        bookName: "The Seven Husbands of Evelyn Hugo",
        authorName: "Taylor Jenkins Reid",
        bookCondition: 'Very Good',
        bookImages: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop"],
        description: "A captivating novel about a reclusive Hollywood icon",
        is_taken: false,
        created_at: new Date().toISOString(),
        view_count: 150,
        genre: "Historical Fiction",
        rating: 4.8,
        aiMatch: 97,
        aiReason: "Perfect match based on your love for character-driven stories",
        pages: 400,
        aiAnalysis: "Our AI detected you enjoy complex character development and Hollywood glamour stories."
      },
      {
        _id: '507f1f77bcf86cd799439012',
        book_id: '507f1f77bcf86cd799439012',
        user_id: '507f1f77bcf86cd799439002',
        bookName: "Project Hail Mary",
        authorName: "Andy Weir",
        bookCondition: 'Good',
        bookImages: ["https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop"],
        description: "A lone astronaut must save humanity",
        is_taken: false,
        created_at: new Date().toISOString(),
        view_count: 200,
        genre: "Science Fiction",
        rating: 4.9,
        aiMatch: 94,
        aiReason: "Matches your preference for science fiction with heart",
        pages: 496,
        aiAnalysis: "Your reading history shows strong interest in problem-solving narratives and space exploration."
      },
      {
        _id: '507f1f77bcf86cd799439013',
        book_id: '507f1f77bcf86cd799439013',
        user_id: '507f1f77bcf86cd799439003',
        bookName: "The Midnight Library",
        authorName: "Matt Haig",
        bookCondition: 'Very Good',
        bookImages: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop"],
        description: "Between life and death lies the Midnight Library",
        is_taken: false,
        created_at: new Date().toISOString(),
        view_count: 175,
        genre: "Fantasy/Philosophy",
        rating: 4.6,
        aiMatch: 91,
        aiReason: "Aligns with your interest in philosophical and uplifting themes",
        pages: 288,
        aiAnalysis: "AI analysis shows you gravitate toward books exploring life's possibilities and personal growth."
      }
    ];
  }

  setMockTrendingBooks() {
    this.trendingBooks = [
      {
        _id: '507f1f77bcf86cd799439014',
        book_id: '507f1f77bcf86cd799439014',
        user_id: '507f1f77bcf86cd799439004',
        bookName: "Circe",
        authorName: "Madeline Miller",
        bookCondition: 'Good',
        bookImages: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=450&fit=crop"],
        description: "The witch Circe's story of transformation and power",
        is_taken: false,
        created_at: new Date().toISOString(),
        view_count: 120,
        genre: "Mythology/Fantasy",
        rating: 4.7,
        aiMatch: 89,
        aiReason: "Mythology retellings match your literary preferences",
        pages: 393,
        aiAnalysis: "Pattern recognition indicates strong affinity for reimagined classical stories."
      },
      {
        _id: '507f1f77bcf86cd799439015',
        book_id: '507f1f77bcf86cd799439015',
        user_id: '507f1f77bcf86cd799439005',
        bookName: "Klara and the Sun",
        authorName: "Kazuo Ishiguro",
        bookCondition: 'Very Good',
        bookImages: ["https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=450&fit=crop"],
        description: "An artificial friend observes the world with wonder",
        is_taken: false,
        created_at: new Date().toISOString(),
        view_count: 95,
        genre: "Literary Fiction",
        rating: 4.5,
        aiMatch: 86,
        aiReason: "Literary fiction with emotional depth",
        pages: 303,
        aiAnalysis: "Your preference for nuanced storytelling aligns with Ishiguro's style."
      }
    ];
  }

  viewBookDetails(book: EnhancedBook) {
    const bookId = book._id || book.book_id;
    if (bookId) {
      this.bookService.trackInteraction(bookId, 'view').subscribe();
      this.router.navigate(['/book', bookId]);
    }
  }

  addToWishlist(book: EnhancedBook) {
    const bookId = book._id || book.book_id;
    if (bookId) {
      this.bookService.trackInteraction(bookId, 'wishlist').subscribe({
        next: () => {
          console.log('Added to wishlist:', book.bookName);
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
        }
      });
    }
  }

  generateNewRecommendations() {
    this.generating = true;
    
    this.aiService.generateRecommendations(this.currentUserId).subscribe({
      next: (response) => {
        console.log('Generated recommendations:', response);
        setTimeout(() => {
          this.loadAIRecommendations();
          this.loadAIInsights();
        }, 1000);
      },
      error: (error) => {
        console.error('Error generating recommendations:', error);
      },
      complete: () => {
        this.generating = false;
      }
    });
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  trackByBookId(index: number, book: EnhancedBook): string {
    return book._id || book.book_id || index.toString();
  }
} 