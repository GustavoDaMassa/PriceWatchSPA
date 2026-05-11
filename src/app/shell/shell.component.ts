import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../core/services/auth.service';
import { NotificationPollingService } from '../core/services/notification-polling.service';
import { LanguageService } from '../core/services/language.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule,
    TranslateModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit, OnDestroy {
  protected readonly auth = inject(AuthService);
  protected readonly polling = inject(NotificationPollingService);
  protected readonly lang = inject(LanguageService);
  private readonly router = inject(Router);

  searchQuery = signal('');

  ngOnInit(): void {
    this.polling.start();
  }

  ngOnDestroy(): void {
    this.polling.stop();
  }

  goToItems(): void {
    const q = this.searchQuery().trim();
    this.router.navigate(['/items'], q ? { queryParams: { q } } : {});
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleLang(): void {
    this.lang.switch(this.lang.current() === 'pt-BR' ? 'en' : 'pt-BR');
  }
}
