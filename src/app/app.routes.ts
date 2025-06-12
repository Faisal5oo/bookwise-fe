import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'browse',
        loadComponent: () => import('./pages/browse/browse.component').then(m => m.BrowseComponent)
      },
      {
        path: 'auth',
        loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent)
      },
      {
        path: 'my-exchanges',
        loadComponent: () => import('./pages/my-exchanges/my-exchanges.component').then(m => m.MyExchangesComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'ai-picks',
        loadComponent: () => import('./pages/ai-picks/ai-picks.component').then(m => m.AiPicksComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'add-book',
        loadComponent: () => import('./pages/add-book/add-book.component').then(m => m.AddBookComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'edit-book/:id',
        loadComponent: () => import('./pages/edit-book/edit-book.component').then(m => m.EditBookComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'book/:id',
        loadComponent: () => import('./pages/book-detail/book-detail.component').then(m => m.BookDetailComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
]; 