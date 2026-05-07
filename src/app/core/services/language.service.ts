import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'pt-BR' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly STORAGE_KEY = 'pw_lang';

  current = signal<Language>(this.loadLanguage());

  init(): void {
    this.translate.use(this.current());
  }

  switch(lang: Language): void {
    this.current.set(lang);
    this.translate.use(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  private loadLanguage(): Language {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Language | null;
    if (stored === 'pt-BR' || stored === 'en') return stored;
    return navigator.language.startsWith('pt') ? 'pt-BR' : 'en';
  }
}
