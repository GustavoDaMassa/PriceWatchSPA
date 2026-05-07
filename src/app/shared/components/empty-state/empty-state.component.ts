import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon() }}</mat-icon>
      <p>{{ message() }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 48px 16px;
      color: var(--pw-text-secondary);

      mat-icon { font-size: 48px; width: 48px; height: 48px; }
      p { margin: 0; font-size: 0.95rem; }
    }
  `],
})
export class EmptyStateComponent {
  message = input.required<string>();
  icon = input<string>('inbox');
}
