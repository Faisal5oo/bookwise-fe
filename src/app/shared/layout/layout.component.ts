import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ChatbotComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  currentUser: any = null;
  showProfileDropdown = false;
  showMobileMenu = false;
  searchQuery = '';
  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authSubscription.add(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.isAuthenticated = isLoggedIn;
      })
    );

    this.authSubscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.showProfileDropdown) return;
    
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.relative');
    
    if (!dropdown || !dropdown.querySelector('button')) {
      this.showProfileDropdown = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Close mobile menu on desktop resize
    if (event.target.innerWidth >= 1024) {
      this.showMobileMenu = false;
    }
  }

  toggleProfileDropdown(event: Event) {
    event.stopPropagation();
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  closeProfileDropdown() {
    this.showProfileDropdown = false;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
    // Close profile dropdown when opening mobile menu
    if (this.showMobileMenu) {
      this.showProfileDropdown = false;
    }
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  logout() {
    this.authService.logout();
    this.showProfileDropdown = false;
    this.showMobileMenu = false;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/browse'], { 
        queryParams: { search: this.searchQuery.trim() } 
      });
      this.closeMobileMenu();
    }
  }

  onSearchKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
} 