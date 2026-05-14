import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ProductCardComponent } from './product-card.component';
import { TrackedProduct } from '../../models/tracked-product.model';

const BASE_PRODUCT: TrackedProduct = {
  id: 'P1',
  name: 'Notebook Gamer',
  url: 'https://ml.com/1',
  imageUrl: 'https://img.com/1.jpg',
  source: 0,
  targetPrice: 3000,
  currentPrice: 2800,
  lowestPrice: 2500,
  isActive: true,
  nextCheckAt: new Date().toISOString(),
};

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;
  let component: ProductCardComponent;
  let overlayContainer: OverlayContainer;

  async function setup(overrides: Partial<{
    product: TrackedProduct;
    selected: boolean;
    selectionMode: boolean;
    historyRoute: (string | number)[];
    showAssignToList: boolean;
    showInListBadge: boolean;
  }> = {}) {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [
        provideAnimationsAsync(),
        provideTranslateService({ fallbackLang: 'en' }),
        provideRouter([]),
      ],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('product', overrides.product ?? BASE_PRODUCT);
    fixture.componentRef.setInput('historyRoute', overrides.historyRoute ?? ['/items', BASE_PRODUCT.id, 'history']);
    if (overrides.selected !== undefined) fixture.componentRef.setInput('selected', overrides.selected);
    if (overrides.selectionMode !== undefined) fixture.componentRef.setInput('selectionMode', overrides.selectionMode);
    if (overrides.showAssignToList !== undefined) fixture.componentRef.setInput('showAssignToList', overrides.showAssignToList);
    if (overrides.showInListBadge !== undefined) fixture.componentRef.setInput('showInListBadge', overrides.showInListBadge);

    fixture.detectChanges();
  }

  // ── rendering ──────────────────────────────────────────────────────────────

  it('displays the product name', async () => {
    await setup();
    const el = fixture.debugElement.query(By.css('.ml-card-name'));
    expect(el.nativeElement.textContent.trim()).toBe('Notebook Gamer');
  });

  it('renders the image when imageUrl is set', async () => {
    await setup();
    const img = fixture.debugElement.query(By.css('.ml-card-img img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.src).toContain('1.jpg');
  });

  it('renders the placeholder icon when imageUrl is absent', async () => {
    await setup({ product: { ...BASE_PRODUCT, imageUrl: undefined } });
    expect(fixture.debugElement.query(By.css('.ml-card-img img'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.ml-no-img'))).toBeTruthy();
  });

  it('shows the target price block when targetPrice is greater than 0', async () => {
    await setup();
    expect(fixture.debugElement.query(By.css('.ml-card-target'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.ml-card-dist'))).toBeTruthy();
  });

  it('hides the target price block when targetPrice is 0', async () => {
    await setup({ product: { ...BASE_PRODUCT, targetPrice: 0 } });
    expect(fixture.debugElement.query(By.css('.ml-card-target'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.ml-card-dist'))).toBeNull();
  });

  it('applies the below class when currentPrice is at or below target', async () => {
    await setup({ product: { ...BASE_PRODUCT, currentPrice: 2800, targetPrice: 3000 } });
    const dist = fixture.debugElement.query(By.css('.ml-card-dist'));
    expect(dist.classes['below']).toBeTrue();
  });

  it('does not apply the below class when currentPrice is above target', async () => {
    await setup({ product: { ...BASE_PRODUCT, currentPrice: 3200, targetPrice: 3000 } });
    const dist = fixture.debugElement.query(By.css('.ml-card-dist'));
    expect(dist.classes['below']).toBeFalsy();
  });

  it('shows active status badge when product is active', async () => {
    await setup({ product: { ...BASE_PRODUCT, isActive: true } });
    const badge = fixture.debugElement.query(By.css('.ml-badge'));
    expect(badge.classes['active']).toBeTrue();
  });

  it('shows paused status badge when product is inactive', async () => {
    await setup({ product: { ...BASE_PRODUCT, isActive: false } });
    const badge = fixture.debugElement.query(By.css('.ml-badge'));
    expect(badge.classes['active']).toBeFalsy();
  });

  it('shows in-list badge when showInListBadge is true and product has listId', async () => {
    await setup({ product: { ...BASE_PRODUCT, listId: 'L1' }, showInListBadge: true });
    expect(fixture.debugElement.query(By.css('.ml-badge-list'))).toBeTruthy();
  });

  it('hides in-list badge when showInListBadge is false', async () => {
    await setup({ product: { ...BASE_PRODUCT, listId: 'L1' }, showInListBadge: false });
    expect(fixture.debugElement.query(By.css('.ml-badge-list'))).toBeNull();
  });

  // ── selection mode ─────────────────────────────────────────────────────────

  it('shows checkbox when selectionMode is true', async () => {
    await setup({ selectionMode: true });
    expect(fixture.debugElement.query(By.css('.ml-card-checkbox'))).toBeTruthy();
  });

  it('hides checkbox when selectionMode is false', async () => {
    await setup({ selectionMode: false });
    expect(fixture.debugElement.query(By.css('.ml-card-checkbox'))).toBeNull();
  });

  it('shows footer when selectionMode is false', async () => {
    await setup({ selectionMode: false });
    expect(fixture.debugElement.query(By.css('.ml-card-footer'))).toBeTruthy();
  });

  it('hides footer when selectionMode is true', async () => {
    await setup({ selectionMode: true });
    expect(fixture.debugElement.query(By.css('.ml-card-footer'))).toBeNull();
  });

  it('applies ml-selected class when selected is true', async () => {
    await setup({ selected: true });
    const card = fixture.debugElement.query(By.css('.ml-card'));
    expect(card.classes['ml-selected']).toBeTrue();
  });

  it('applies ml-selectable class when selectionMode is true', async () => {
    await setup({ selectionMode: true });
    const card = fixture.debugElement.query(By.css('.ml-card'));
    expect(card.classes['ml-selectable']).toBeTrue();
  });

  // ── card-level events ──────────────────────────────────────────────────────

  it('emits cardClick when card is clicked in normal mode', async () => {
    await setup({ selectionMode: false });
    const spy = jasmine.createSpy();
    component.cardClick.subscribe(spy);
    fixture.debugElement.query(By.css('.ml-card')).triggerEventHandler('click', null);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('emits selectionChange when card is clicked in selection mode', async () => {
    await setup({ selectionMode: true });
    const spy = jasmine.createSpy();
    component.selectionChange.subscribe(spy);
    fixture.debugElement.query(By.css('.ml-card')).triggerEventHandler('click', null);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  // ── menu actions ───────────────────────────────────────────────────────────

  function openMenu(): void {
    const trigger = fixture.debugElement.queryAll(By.css('.ml-footer-btn'))[1];
    trigger.nativeElement.click();
    fixture.detectChanges();
  }

  function menuItems(): NodeListOf<Element> {
    return overlayContainer.getContainerElement().querySelectorAll('[mat-menu-item]');
  }

  it('emits editClick when the edit menu item is clicked', fakeAsync(async () => {
    await setup();
    const spy = jasmine.createSpy();
    component.editClick.subscribe(spy);

    openMenu();
    tick();

    (menuItems()[0] as HTMLElement).click();
    tick();

    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('emits toggleActiveClick when the toggle-active menu item is clicked', fakeAsync(async () => {
    await setup({ showAssignToList: false });
    const spy = jasmine.createSpy();
    component.toggleActiveClick.subscribe(spy);

    openMenu();
    tick();

    const items = menuItems();
    (items[items.length - 2] as HTMLElement).click(); // second-to-last = toggle active
    tick();

    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('emits removeClick when the remove menu item is clicked', fakeAsync(async () => {
    await setup({ showAssignToList: false });
    const spy = jasmine.createSpy();
    component.removeClick.subscribe(spy);

    openMenu();
    tick();

    const items = menuItems();
    (items[items.length - 1] as HTMLElement).click(); // last = remove
    tick();

    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('shows the assign-to-list item when showAssignToList is true', fakeAsync(async () => {
    await setup({ showAssignToList: true });

    openMenu();
    tick();

    expect(menuItems().length).toBe(4); // edit, assign, toggle, remove
  }));

  it('hides the assign-to-list item when showAssignToList is false', fakeAsync(async () => {
    await setup({ showAssignToList: false });

    openMenu();
    tick();

    expect(menuItems().length).toBe(3); // edit, toggle, remove
  }));

  it('emits assignToListClick when the assign-to-list menu item is clicked', fakeAsync(async () => {
    await setup({ showAssignToList: true });
    const spy = jasmine.createSpy();
    component.assignToListClick.subscribe(spy);

    openMenu();
    tick();

    (menuItems()[1] as HTMLElement).click(); // second item = assign to list
    tick();

    expect(spy).toHaveBeenCalledTimes(1);
  }));
});
