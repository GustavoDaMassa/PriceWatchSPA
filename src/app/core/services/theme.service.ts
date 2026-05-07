import { inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly STORAGE_KEY = 'pw_theme';

  isDark = signal<boolean>(this.loadTheme());

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    this.applyTheme(next);
    localStorage.setItem(this.STORAGE_KEY, next ? 'dark' : 'light');
  }

  init(): void {
    this.applyTheme(this.isDark());
  }

  private applyTheme(dark: boolean): void {
    const html = this.document.documentElement;
    dark ? html.classList.add('dark') : html.classList.remove('dark');
  }

  private loadTheme(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
