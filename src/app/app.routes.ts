import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'lists',
        loadComponent: () => import('./features/lists/list-overview/list-overview.component').then(m => m.ListOverviewComponent),
      },
      {
        path: 'lists/:id',
        loadComponent: () => import('./features/lists/list-detail/list-detail.component').then(m => m.ListDetailComponent),
      },
      {
        path: 'lists/:id/analysis',
        loadComponent: () => import('./features/lists/list-analysis/list-analysis.component').then(m => m.ListAnalysisComponent),
      },
      {
        path: 'items',
        loadComponent: () => import('./features/items/items.component').then(m => m.ItemsComponent),
      },
      {
        path: 'items/:productId/history',
        loadComponent: () => import('./features/products/price-history/price-history.component').then(m => m.PriceHistoryComponent),
      },
      {
        path: 'lists/:id/products/:productId/history',
        loadComponent: () => import('./features/products/price-history/price-history.component').then(m => m.PriceHistoryComponent),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile-overview/profile-overview.component').then(m => m.ProfileOverviewComponent),
      },
      {
        path: 'profile/change-password',
        loadComponent: () => import('./features/profile/change-password/change-password.component').then(m => m.ChangePasswordComponent),
      },
      {
        path: 'profile/change-email',
        loadComponent: () => import('./features/profile/change-email/change-email.component').then(m => m.ChangeEmailComponent),
      },
      {
        path: 'profile/delete-account',
        loadComponent: () => import('./features/profile/delete-account/delete-account.component').then(m => m.DeleteAccountComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
