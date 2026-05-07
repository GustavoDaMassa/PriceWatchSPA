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
});
