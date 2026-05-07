import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { ProductSource, PRODUCT_SOURCE_LABELS } from '../../models/tracked-product.model';

@Component({
  selector: 'app-source-badge',
  standalone: true,
  imports: [MatChipsModule],
  template: `<mat-chip [class]="'source-' + source()">{{ label() }}</mat-chip>`,
  styles: [`
    .source-0 { background-color: #FFE600; color: #333; }
    .source-1 { background-color: #e65100; color: #fff; }
    .source-2 { background-color: #546e7a; color: #fff; }
  `],
})
export class SourceBadgeComponent {
  source = input.required<ProductSource>();
  label = computed(() => PRODUCT_SOURCE_LABELS[this.source()]);
}
