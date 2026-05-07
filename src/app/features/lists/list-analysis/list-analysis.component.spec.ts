import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ListAnalysisComponent } from './list-analysis.component';
import { ListsApiService } from '../../../core/services/api/lists-api.service';

describe('ListAnalysisComponent', () => {
  let fixture: ComponentFixture<ListAnalysisComponent>;
  let listsApi: jasmine.SpyObj<ListsApiService>;

  const mockAnalysis = [
    { productId: 'P1', productName: 'Prod A', currentPrice: 80, targetPrice: 100, distancePercent: -20 },
    { productId: 'P2', productName: 'Prod B', currentPrice: 120, targetPrice: 100, distancePercent: 20 },
  ];

  beforeEach(async () => {
    listsApi = jasmine.createSpyObj('ListsApiService', ['getAnalysis']);
    listsApi.getAnalysis.and.returnValue(of(mockAnalysis));

    await TestBed.configureTestingModule({
      imports: [ListAnalysisComponent],
      providers: [
        provideAnimationsAsync(),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'L1' } } } },
        { provide: ListsApiService, useValue: listsApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListAnalysisComponent);
    fixture.detectChanges();
  });

  it('should load and display analysis items', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(listsApi.getAnalysis).toHaveBeenCalledWith('L1');
    expect(fixture.componentInstance.items().length).toBe(2);
  }));

  it('should identify items below target (distancePercent <= 0)', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const belowTarget = fixture.componentInstance.items().filter(i => i.distancePercent <= 0);
    expect(belowTarget.length).toBe(1);
  }));
});
