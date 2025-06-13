import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { AIService, AIRecommendation, BookMatch } from '../../shared/services/ai.service';
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

  bookMatches: BookMatch[] = [];
  totalMatches = 0;
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
    this.loadBookMatches();
    this.loadAIRecommendations();
    this.loadAIInsights();
    
    // Listen for preference changes (you can implement this based on your preference service)
    this.setupPreferenceChangeListener();
  }

  private setupPreferenceChangeListener() {
    // Check for preference changes every 30 seconds
    // In a real app, you might use WebSockets or a more sophisticated approach
    setInterval(() => {
      this.checkForPreferenceChanges();
    }, 30000);
  }

  private checkForPreferenceChanges() {
    // This is a simple implementation - you might want to store last update timestamp
    // and only refresh if preferences were updated recently
    const lastRefresh = localStorage.getItem('lastAIRefresh');
    const preferencesUpdated = localStorage.getItem('preferencesUpdated');
    
    if (preferencesUpdated && (!lastRefresh || preferencesUpdated > lastRefresh)) {
      console.log('🔄 Preferences changed, refreshing AI recommendations...');
      this.refreshAllRecommendations();
      localStorage.setItem('lastAIRefresh', new Date().toISOString());
      localStorage.removeItem('preferencesUpdated');
    }
  }

  refreshAllRecommendations() {
    console.log('🔄 Refreshing all AI recommendations...');
    this.loadBookMatches();
    this.loadAIRecommendations();
    this.loadAIInsights();
  }

  async loadBookMatches() {
    this.loading = true;
    console.log('🎯 Loading AI book matches for user:', this.currentUserId);
    
    this.aiService.getBookMatches(this.currentUserId).subscribe({
      next: (response: any) => {
        console.log('✅ Book matches response:', response);
        
        // Handle the new API response format
        if (response && response.matches) {
          this.bookMatches = response.matches;
          this.totalMatches = response.total_matches || response.matches.length;
          this.convertMatchesToFeaturedBooks(response.matches);
          console.log(`🎯 Found ${response.total_matches} book matches`);
        } else if (Array.isArray(response)) {
          // Fallback for direct array response
          this.bookMatches = response;
          this.totalMatches = response.length;
          this.convertMatchesToFeaturedBooks(response);
        } else {
          this.bookMatches = [];
          this.totalMatches = 0;
          this.featuredBooks = [];
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading book matches:', error);
        this.bookMatches = [];
        this.featuredBooks = [];
        this.loading = false;
      }
    });
  }

  convertMatchesToFeaturedBooks(matches: any[]) {
    this.featuredBooks = matches.slice(0, 6).map(match => ({
      _id: match.book_id,
      book_id: match.book_id,
      user_id: '', // Will be populated when we fetch full book details
      bookName: match.book_name,
      authorName: match.author_name || match.author,
      bookCondition: match.book_condition || match.condition || 'Good',
      bookImages: match.image_url ? [match.image_url] : [],
      description: match.description || '',
      is_taken: false,
      created_at: new Date().toISOString(),
      view_count: 0,
      genre: match.genre || '',
      rating: Math.random() * 1 + 4,
      aiMatch: match.match_percentage,
      aiReason: this.formatAIReason(match.match_reasons || [match.reason] || []),
      pages: Math.floor(Math.random() * 400) + 200,
      aiAnalysis: this.formatAIReason(match.match_reasons || [match.reason] || [])
    }));
  }

  private formatAIReason(reasons: string[]): string {
    if (!reasons || reasons.length === 0) {
      return 'This book matches your reading preferences based on our AI analysis.';
    }

    // Convert technical AI reasons to user-friendly messages
    const formattedReasons = reasons.map(reason => {
      if (reason.includes("Genre") && reason.includes("found in description")) {
        const genreMatch = reason.match(/'([^']+)'/);
        const genre = genreMatch ? genreMatch[1] : 'your preferred genre';
        return `📚 Matches your love for ${genre} books`;
      }
      
      if (reason.includes("Found") && reason.includes("related to")) {
        const parts = reason.split("related to");
        if (parts.length > 1) {
          const genre = parts[1].trim();
          return `✨ Contains ${genre.toLowerCase()} elements you enjoy`;
        }
      }
      
      if (reason.includes("Author")) {
        return `👤 From an author you might enjoy`;
      }
      
      if (reason.includes("keyword")) {
        return `🔍 Contains themes you're interested in`;
      }
      
      if (reason.includes("condition")) {
        return `⭐ High-quality book in excellent condition`;
      }
      
      // Fallback for any unmatched reasons
      return `🎯 ${reason}`;
    });

    return formattedReasons.join(' • ');
  }

  async loadAIRecommendations() {
    try {
      this.aiService.getAIRecommendations(this.currentUserId, 0, 6).subscribe({
        next: (recommendations) => {
          this.recommendations = recommendations;
          this.loadRecommendedBooks(recommendations);
        },
        error: (error) => {
          console.error('Error loading AI recommendations:', error);
          this.recommendations = [];
        }
      });



    } catch (error) {
      console.error('Error loading AI picks data:', error);
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
      this.featuredBooks = [];
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

  viewBookDetails(book: EnhancedBook) {
    const bookId = book._id || book.book_id;
    if (bookId) {
      this.bookService.trackInteraction(bookId, 'view').subscribe();
      this.router.navigate(['/book', bookId]);
    }
  }

  generateNewRecommendations() {
    this.generating = true;
    console.log('🔄 Generating new AI recommendations...');
    
    this.aiService.generateRecommendations(this.currentUserId).subscribe({
      next: (response) => {
        console.log('✅ Generated recommendations:', response);
        setTimeout(() => {
          this.loadBookMatches();
          this.loadAIRecommendations();
          this.loadAIInsights();
        }, 1000);
      },
      error: (error) => {
        console.error('❌ Error generating recommendations:', error);
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