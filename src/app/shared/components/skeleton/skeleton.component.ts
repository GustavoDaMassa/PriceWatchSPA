import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `<div class="skeleton" [style.height]="height()" [style.width]="width()"></div>`,
  styles: [`
    .skeleton {
      --sk-base: rgba(0, 0, 0, 0.08);
      --sk-shine: rgba(0, 0, 0, 0.04);
      background: linear-gradient(90deg, var(--sk-base) 25%, var(--sk-shine) 50%, var(--sk-base) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
      border-radius: 4px;

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    }

    :host-context(html.dark) .skeleton {
      --sk-base: rgba(255, 255, 255, 0.07);
      --sk-shine: rgba(255, 255, 255, 0.12);
    }
  `],
})
export class SkeletonComponent {
  height = input<string>('16px');
  width = input<string>('100%');
}
