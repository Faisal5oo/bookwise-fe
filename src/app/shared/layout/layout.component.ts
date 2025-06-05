import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ChatbotComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  currentUser: any = null;
  showProfileDropdown = false;
  private authSubscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

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

  toggleProfileDropdown(event: Event) {
    event.stopPropagation();
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  closeProfileDropdown() {
    this.showProfileDropdown = false;
  }

  logout() {
    this.authService.logout();
    this.showProfileDropdown = false;
  }
} 