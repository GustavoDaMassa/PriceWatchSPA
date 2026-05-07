import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceDisplayComponent } from './price-display.component';

describe('PriceDisplayComponent', () => {
  let fixture: ComponentFixture<PriceDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PriceDisplayComponent] }).compileComponents();
    fixture = TestBed.createComponent(PriceDisplayComponent);
  });

  it('should render a price value', () => {
    fixture.componentRef.setInput('value', 199.9);
    fixture.componentRef.setInput('currency', 'BRL');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBeTruthy();
  });
});
