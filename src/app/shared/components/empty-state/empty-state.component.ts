import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon() }}</mat-icon>
      <p class="empty-message">{{ message() }}</p>
      @if (subtitle()) {
        <p class="empty-subtitle">{{ subtitle() }}</p>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 56px 16px;
      color: var(--pw-text-secondary);

      mat-icon { font-size: 56px; width: 56px; height: 56px; margin-bottom: 8px; opacity: 0.5; }
    }
    .empty-message { margin: 0; font-size: 1rem; font-weight: 500; color: var(--pw-text-primary); }
    .empty-subtitle { margin: 0; font-size: var(--pw-font-size-sm, 0.875rem); color: var(--pw-text-secondary); }
  `],
})
export class EmptyStateComponent {
  message = input.required<string>();
  icon = input<string>('inbox');
  subtitle = input<string>();
}
