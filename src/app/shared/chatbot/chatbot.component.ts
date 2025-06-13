import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AIService, AIRecommendation, ChatMessage as AIChatMessage, ChatRequest } from '../services/ai.service';
import { AuthService } from '../services/auth.service';
import { BookService } from '../services/book.service';
import { PreferencesService, UserPreferences } from '../services/preferences.service';
import { environment } from '../../../environments/environment';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  recommendations?: AIRecommendation[];
  books?: any[];
  bookMatches?: any[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  isOpen = false;
  isMinimized = false;
  currentMessage = '';
  messages: ChatMessage[] = [];
  isLoading = false;
  conversationHistory: AIChatMessage[] = [];
  userPreferences: UserPreferences | null = null;
  
  constructor(
    private http: HttpClient,
    private aiService: AIService,
    private authService: AuthService,
    private bookService: BookService,
    private preferencesService: PreferencesService
  ) {}

  ngOnInit() {
    this.initializeChat();
    this.loadUserPreferences();
  }

  ngOnDestroy() {
  }

  async loadUserPreferences() {
    const userId = this.authService.getUserId();
    if (userId) {
      try {
        this.userPreferences = await this.preferencesService.getUserPreferences(userId).toPromise() || null;
      } catch (error) {
        console.log('No user preferences found, will use defaults');
        this.userPreferences = null;
      }
    }
  }

  initializeChat() {
    const userName = this.authService.getCurrentUser()?.fname || 'there';
    this.addBotMessage(
      `Hi ${userName}! I'm BookWise AI Assistant! 📚 I'm here to help you with personalized book recommendations based on your reading preferences. You can ask me things like:

• "Recommend me some fantasy books"
• "I like mystery novels, what do you have?"
• "Show me books by Stephen King"
• "What's trending right now?"

How can I help you today?`
    );
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  minimizeChat() {
    this.isMinimized = !this.isMinimized;
  }

  closeChat() {
    this.isOpen = false;
    this.isMinimized = false;
  }

  async sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const userMessage = this.currentMessage.trim();
    this.currentMessage = '';

    this.addUserMessage(userMessage);

    this.isLoading = true;
    this.addTypingIndicator();

    try {
      const userId = this.authService.getUserId();
      
      // Add to conversation history
      this.conversationHistory.push({
        type: 'user',
        message: userMessage,
        timestamp: new Date().toISOString()
      });

      if (userId) {
        await this.handleAIChat(userMessage, userId);
      } else {
        await this.handleGuestResponse(userMessage);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.removeTypingIndicator();
      this.addBotMessage(
        "I'm sorry, I'm having trouble connecting right now. Please try again in a moment! 😊"
      );
    } finally {
      this.isLoading = false;
    }
  }

  private async handleAIChat(message: string, userId: string) {
    try {
      const chatRequest: ChatRequest = {
        message: message,
        conversation_history: this.conversationHistory
      };

      const response = await this.aiService.sendChatMessage(userId, chatRequest).toPromise();
      
      this.removeTypingIndicator();
      
      if (response) {
        // Add AI response to conversation history
        this.conversationHistory.push({
          type: 'ai',
          message: response.response,
          timestamp: response.timestamp
        });

        // If there are recommendations, fetch book details
        if (response.recommendations && response.recommendations.length > 0) {
          const bookPromises = response.recommendations.slice(0, 5).map(rec => 
            this.bookService.getBook(rec.book_id).toPromise().catch(() => null)
          );
          
          const books = await Promise.all(bookPromises);
          const validBooks = books.filter(book => book !== null);

          this.addBotMessage(response.response, response.recommendations, validBooks);
        } else {
          this.addBotMessage(response.response);
        }

        // If the user is asking for recommendations, also try to get book matches
        if (this.isAskingForRecommendations(message)) {
          try {
            const bookMatches = await this.aiService.getBookMatches(userId).toPromise();
            if (bookMatches && bookMatches.length > 0) {
              const matchMessage = `\n\n🎯 **Top Book Matches for You:**\n\nBased on your preferences, here are some highly recommended books:`;
              this.addBotMessage(matchMessage, undefined, undefined, bookMatches.slice(0, 3));
            }
          } catch (matchError) {
            console.log('Could not load book matches:', matchError);
          }
        }
      } else {
        this.addBotMessage("I'm sorry, I didn't get a response. Please try again!");
      }
    } catch (error) {
      console.error('Error getting AI chat response:', error);
      this.removeTypingIndicator();
      
      // Fallback to Gemini API
      try {
        const fallbackResponse = await this.callGeminiAPI(message);
        this.addBotMessage(fallbackResponse);
      } catch (fallbackError) {
        this.addBotMessage(
          "I'm having trouble connecting to my AI brain right now. Please try again in a moment! 🤖"
        );
      }
    }
  }

  private isAskingForRecommendations(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return lowerMessage.includes('recommend') || 
           lowerMessage.includes('suggestion') || 
           lowerMessage.includes('suggest') ||
           lowerMessage.includes('what should i read') ||
           lowerMessage.includes('books for me') ||
           lowerMessage.includes('book match') ||
           lowerMessage.includes('pick') ||
           lowerMessage.includes('find me');
  }

  private async handleGuestResponse(message: string) {
    try {
      const response = await this.callGeminiAPI(message);
      this.removeTypingIndicator();
      this.addBotMessage(response + "\n\n💡 For personalized book recommendations, please sign up or log in!");
    } catch (error) {
      this.removeTypingIndicator();
      this.addBotMessage(
        "Hi! I can help with general book questions, but for personalized recommendations, please sign up or log in to get AI-powered suggestions based on your reading history! 📚✨"
      );
    }
  }

  private async callGeminiAPI(message: string): Promise<string> {
    const bookwisePrompt = `You are BookWise AI Assistant, a helpful chatbot for a book exchange platform called BookWise. 
    
    Your role:
    - Help users with book recommendations
    - Answer questions about literature, authors, and genres
    - Assist with book exchange platform features
    - Provide reading suggestions based on interests
    - Be friendly, knowledgeable, and book-focused
    
    Keep responses concise (under 150 words) and engaging. Use emojis sparingly but effectively.
    
    User message: ${message}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: bookwisePrompt
        }]
      }]
    };

    try {
      if (!environment.geminiApiKey || environment.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        console.warn('Gemini API key not configured, using fallback responses');
        return this.getFallbackResponse(message);
      }

      const response = await this.http.post<any>(
        `${environment.geminiApiUrl}?key=${environment.geminiApiKey}`,
        requestBody
      ).toPromise();

      if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackResponse(message);
    }
  }

  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
      if (this.authService.isAuthenticated()) {
        return "I'd love to help with personalized book recommendations! What genres do you enjoy? I can analyze your reading history to suggest perfect matches! 📖🤖";
      } else {
        return "I'd love to help with book recommendations! Please log in to get personalized AI-powered suggestions, or tell me what genres you enjoy for general recommendations! 📖";
      }
    }
    
    if (lowerMessage.includes('exchange') || lowerMessage.includes('swap')) {
      return "Great question about book exchanges! You can browse available books, request exchanges, and track your exchanges in the 'My Exchanges' section. What would you like to know more about? 🔄";
    }
    
    if (lowerMessage.includes('ai picks') || lowerMessage.includes('ai recommend')) {
      return "Our AI Picks feature analyzes your reading history and preferences to suggest personalized book recommendations! Check out the AI Picks page to see what we've selected for you. 🤖📚";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      const userName = this.authService.getCurrentUser()?.fname || '';
      return `Hello${userName ? ' ' + userName : ''}! Welcome to BookWise! I'm here to help you discover amazing books and make the most of our book exchange platform. What can I help you with today? 😊`;
    }

    if (lowerMessage.includes('fiction')) {
      return "Fiction is such a wonderful escape! Are you interested in contemporary fiction, historical fiction, fantasy, or perhaps science fiction? I can recommend some amazing titles based on your preferences! ✨";
    }

    if (lowerMessage.includes('mystery') || lowerMessage.includes('thriller')) {
      return "Mystery and thriller fans are in for a treat! I'd recommend checking out authors like Tana French, Gillian Flynn, or Agatha Christie for classics. What type of mystery do you prefer - cozy, psychological, or crime thrillers? 🔍";
    }

    if (lowerMessage.includes('romance')) {
      return "Romance novels can be so captivating! Are you looking for contemporary romance, historical romance, or perhaps fantasy romance? Authors like Julia Quinn, Emily Henry, and Sarah J. Maas have wonderful selections! 💕";
    }
    
    return "That's an interesting question! I'm here to help with book recommendations, platform features, and anything related to reading. Feel free to ask me about books, authors, or how to use BookWise! 📚✨";
  }

  private addUserMessage(content: string) {
    const message: ChatMessage = {
      id: this.generateId(),
      content,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(message);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private addBotMessage(content: string, recommendations?: AIRecommendation[], books?: any[], bookMatches?: any[]) {
    const message: ChatMessage = {
      id: this.generateId(),
      content,
      isUser: false,
      timestamp: new Date(),
      recommendations,
      books,
      bookMatches
    };
    this.messages.push(message);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private addTypingIndicator() {
    const typingMessage: ChatMessage = {
      id: 'typing',
      content: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };
    this.messages.push(typingMessage);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private removeTypingIndicator() {
    this.messages = this.messages.filter(msg => msg.id !== 'typing');
  }

  private scrollToBottom() {
    if (this.messagesContainer?.nativeElement) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  askForRecommendations() {
    this.currentMessage = "Can you recommend some books for me?";
    this.sendMessage();
  }

  askAboutExchanges() {
    this.currentMessage = "How do book exchanges work?";
    this.sendMessage();
  }

  askAboutAI() {
    this.currentMessage = "Tell me about your AI recommendations";
    this.sendMessage();
  }
} 