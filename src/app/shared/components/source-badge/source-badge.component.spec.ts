import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SourceBadgeComponent } from './source-badge.component';

describe('SourceBadgeComponent', () => {
  let fixture: ComponentFixture<SourceBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SourceBadgeComponent] }).compileComponents();
    fixture = TestBed.createComponent(SourceBadgeComponent);
  });

  it('should display "Mercado Livre" for source 0', () => {
    fixture.componentRef.setInput('source', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Mercado Livre');
  });

  it('should display "Kabum" for source 1', () => {
    fixture.componentRef.setInput('source', 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Kabum');
  });

  it('should display "Manual" for source 2', () => {
    fixture.componentRef.setInput('source', 2);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Manual');
  });
});
