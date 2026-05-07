import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { PriceDisplayComponent } from './price-display.component';

describe('PriceDisplayComponent', () => {
  let fixture: ComponentFixture<PriceDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceDisplayComponent],
      providers: [
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: LOCALE_ID, useValue: 'en-US' },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PriceDisplayComponent);
  });

  it('should render a price value', () => {
    fixture.componentRef.setInput('value', 199.9);
    fixture.componentRef.setInput('currency', 'USD');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBeTruthy();
  });
});
