import { Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-price-display',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <span class="price">
      {{ value() | currency: currency() : 'symbol' : '1.2-2' : locale() }}
    </span>
  `,
  styles: [`.price { font-weight: 600; }`],
})
export class PriceDisplayComponent {
  private readonly translate = inject(TranslateService);

  value = input.required<number>();
  currency = input<string>('BRL');

  locale(): string {
    return this.translate.currentLang === 'en' ? 'en-US' : 'pt-BR';
  }
}
