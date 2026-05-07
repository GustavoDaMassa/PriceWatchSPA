import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `<div class="skeleton" [style.height]="height()" [style.width]="width()"></div>`,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite;
      border-radius: 4px;

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    }
  `],
})
export class SkeletonComponent {
  height = input<string>('16px');
  width = input<string>('100%');
}
