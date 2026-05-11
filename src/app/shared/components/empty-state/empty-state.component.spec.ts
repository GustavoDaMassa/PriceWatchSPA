import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EmptyStateComponent] }).compileComponents();
    fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('message', 'Nenhum item.');
    fixture.detectChanges();
  });

  it('should display the message', () => {
    expect(fixture.nativeElement.textContent).toContain('Nenhum item.');
  });

  it('should not render subtitle when not provided', () => {
    expect(fixture.nativeElement.querySelector('.empty-subtitle')).toBeNull();
  });

  it('should render subtitle when provided', () => {
    fixture.componentRef.setInput('subtitle', 'Crie uma lista para começar.');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.empty-subtitle');
    expect(el).toBeTruthy();
    expect(el.textContent).toContain('Crie uma lista para começar.');
  });
});
