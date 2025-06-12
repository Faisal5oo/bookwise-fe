import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BookService } from '../../shared/services/book.service';
import { AuthService } from '../../shared/services/auth.service';
import { Book, UpdateBookModel } from '../../shared/models/book.model';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-book.component.html',
  styleUrls: ['./edit-book.component.scss']
})
export class EditBookComponent implements OnInit {
  loading = false;
  errorMessage = '';
  successMessage = '';
  bookId = '';

  bookData: UpdateBookModel = {
    bookName: '',
    authorName: '',
    description: '',
    bookCondition: 'Good',
    bookImages: [],
    is_taken: false
  };

  conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
  
  // Sample image URLs for demo purposes
  sampleImages = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'
  ];

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.bookId = this.route.snapshot.paramMap.get('id') || '';
    if (this.bookId) {
      this.loadBookData();
    } else {
      this.errorMessage = 'Book ID not provided';
    }
  }

  loadBookData() {
    this.loading = true;
    this.bookService.getBook(this.bookId).subscribe({
      next: (book) => {
        this.bookData = {
          bookName: book.bookName || book.book_name,
          authorName: book.authorName || book.author,
          description: book.description,
          bookCondition: book.bookCondition || book.condition,
          bookImages: book.bookImages || book.pictures || [],
          is_taken: book.is_taken
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading book:', error);
        this.errorMessage = 'Failed to load book data';
        this.loading = false;
      }
    });
  }

  addSampleImage() {
    const randomImage = this.sampleImages[Math.floor(Math.random() * this.sampleImages.length)];
    if (!this.bookData.bookImages!.includes(randomImage)) {
      this.bookData.bookImages!.push(randomImage);
    }
  }

  removeImage(index: number) {
    this.bookData.bookImages!.splice(index, 1);
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Only send fields that have values
    const updateData: UpdateBookModel = {};
    
    if (this.bookData.bookName?.trim()) {
      updateData.bookName = this.bookData.bookName.trim();
    }
    
    if (this.bookData.authorName?.trim()) {
      updateData.authorName = this.bookData.authorName.trim();
    }
    
    if (this.bookData.description?.trim()) {
      updateData.description = this.bookData.description.trim();
    }
    
    if (this.bookData.bookCondition) {
      updateData.bookCondition = this.bookData.bookCondition;
    }
    
    if (this.bookData.bookImages && this.bookData.bookImages.length > 0) {
      updateData.bookImages = this.bookData.bookImages;
    }
    
    if (this.bookData.is_taken !== undefined) {
      updateData.is_taken = this.bookData.is_taken;
    }

    console.log('Updating book with:', updateData);

    this.bookService.updateBook(this.bookId, updateData).subscribe({
      next: (response) => {
        console.log('✅ Book updated successfully:', response);
        
        // Handle different response formats
        if (response.message) {
          this.successMessage = response.message;
        } else if (response.book_id || response._id) {
          this.successMessage = `Book updated successfully! ID: ${response.book_id || response._id}`;
        } else {
          this.successMessage = 'Book updated successfully!';
        }
        
        setTimeout(() => {
          this.router.navigate(['/profile'], { 
            queryParams: { refresh: 'true' } 
          });
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error updating book:', error);
        let errorMsg = 'Failed to update book. Please try again.';
        
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error.detail) {
            errorMsg = Array.isArray(error.error.detail) ? 
              error.error.detail.map((d: any) => d.msg || d).join(', ') : 
              error.error.detail;
          } else if (error.error.message) {
            errorMsg = error.error.message;
          }
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        this.errorMessage = errorMsg;
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private validateForm(): boolean {
    if (!this.bookData.bookName?.trim() && !this.bookData.authorName?.trim() && !this.bookData.bookCondition) {
      this.errorMessage = 'At least one field must be provided to update';
      return false;
    }

    return true;
  }

  deleteBook() {
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      this.loading = true;
      this.bookService.deleteBook(this.bookId).subscribe({
        next: (response) => {
          console.log('✅ Book deleted successfully:', response);
          this.successMessage = response?.message || 'Book deleted successfully!';
          setTimeout(() => {
            this.router.navigate(['/profile'], { 
              queryParams: { refresh: 'true' } 
            });
          }, 1500);
        },
        error: (error) => {
          console.error('❌ Error deleting book:', error);
          let errorMsg = 'Failed to delete book. Please try again.';
          
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMsg = error.error;
            } else if (error.error.detail) {
              errorMsg = Array.isArray(error.error.detail) ? 
                error.error.detail.map((d: any) => d.msg || d).join(', ') : 
                error.error.detail;
            } else if (error.error.message) {
              errorMsg = error.error.message;
            }
          } else if (error.message) {
            errorMsg = error.message;
          }
          
          this.errorMessage = errorMsg;
          this.loading = false;
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/profile']);
  }
} 