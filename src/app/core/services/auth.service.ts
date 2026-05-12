import { computed, Injectable, signal } from '@angular/core';
import { AuthResponse, CurrentUser } from '../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'pw_user';

  currentUser = signal<CurrentUser | null>(this.loadUser());
  isAuthenticated = computed(() => this.currentUser() !== null);

  login(response: AuthResponse): void {
    const user: CurrentUser = { name: response.name, email: response.email, token: response.token, isEmailVerified: response.isEmailVerified };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  markEmailVerified(): void {
    const user = this.currentUser();
    if (!user) return;
    const updated = { ...user, isEmailVerified: true };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.currentUser.set(updated);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  private loadUser(): CurrentUser | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
