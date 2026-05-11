import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ListsApiService } from '../../../core/services/api/lists-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ProductList } from '../../../shared/models/product-list.model';
import { ListFormDialogComponent } from '../list-form-dialog/list-form-dialog.component';

@Component({
  selector: 'app-list-overview',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule,
    TranslateModule, EmptyStateComponent,
  ],
  template: `
    <div class="page-header">
      <div class="page-header-text">
        <h1>{{ 'LISTS.TITLE' | translate }}</h1>
        @if (lists().length > 0) {
          <span class="page-count">{{ lists().length }}</span>
        }
      </div>
      <button mat-flat-button class="btn-primary" (click)="openForm()">
        <mat-icon>add</mat-icon>
        {{ 'LISTS.NEW' | translate }}
      </button>
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (lists().length === 0) {
      <app-empty-state
        [message]="'LISTS.EMPTY' | translate"
        [subtitle]="'LISTS.EMPTY_SUBTITLE' | translate"
        icon="list" />
    } @else {
      <div class="lists-grid">
        @for (list of lists(); track list.id) {
          <mat-card class="list-card">
            <mat-card-header>
              <mat-card-title>{{ list.name }}</mat-card-title>
              @if (list.description) {
                <mat-card-subtitle>{{ list.description }}</mat-card-subtitle>
              }
            </mat-card-header>
            <mat-card-actions align="end">
              <a mat-button [routerLink]="['/lists', list.id]">
                <mat-icon>inventory_2</mat-icon>
                {{ 'PRODUCTS.TITLE' | translate }}
              </a>
              <a mat-button [routerLink]="['/lists', list.id, 'analysis']">
                <mat-icon>analytics</mat-icon>
                {{ 'LISTS.ANALYSIS' | translate }}
              </a>
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu>
                <button mat-menu-item (click)="openForm(list)">
                  <mat-icon>edit</mat-icon>{{ 'LISTS.EDIT' | translate }}
                </button>
                <button mat-menu-item (click)="confirmDelete(list)" class="text-danger">
                  <mat-icon>delete</mat-icon>{{ 'LISTS.DELETE' | translate }}
                </button>
              </mat-menu>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      max-width: 760px;
      margin-left: auto;
      margin-right: auto;
    }
    .page-header-text { display: flex; align-items: center; gap: 10px; }
    .page-header h1 { margin: 0; font-size: var(--pw-font-size-xl, 1.5rem); font-weight: var(--pw-font-weight-semibold, 600); letter-spacing: -0.01em; }
    .page-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 7px;
      border-radius: 12px;
      background: var(--pw-border-accent);
      color: #fff;
      font-size: var(--pw-font-size-xs, 0.75rem);
      font-weight: var(--pw-font-weight-semibold, 600);
    }
    .btn-primary { background-color: var(--pw-btn-bg) !important; color: var(--pw-btn-color) !important; font-weight: 600; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .lists-grid {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .list-card {
      background: var(--pw-card-bg);
      color: var(--pw-card-color);
      width: 100%;
      max-width: 760px;
      border-left: 3px solid var(--pw-border-accent);
      transition: box-shadow 0.15s ease;
    }
    .list-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important; }
    .list-card mat-card-title,
    .list-card mat-card-subtitle,
    .list-card mat-icon,
    .list-card a,
    .list-card button { color: var(--pw-card-color) !important; }
    .text-danger { color: var(--pw-error) !important; }
  `],
})
export class ListOverviewComponent implements OnInit {
  private readonly listsApi = inject(ListsApiService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  lists = signal<ProductList[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    this.loading.set(true);
    this.listsApi.getLists().subscribe({
      next: data => { this.lists.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  openForm(list?: ProductList): void {
    this.dialog.open(ListFormDialogComponent, { width: '480px', data: list ?? null })
      .afterClosed().subscribe(saved => { if (saved) this.loadLists(); });
  }

  confirmDelete(list: ProductList): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('LISTS.CONFIRM_DELETE'),
        message: this.translate.instant('LISTS.CONFIRM_DELETE_MSG'),
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.listsApi.deleteList(list.id).subscribe({
        next: () => { this.toast.success(list.name); this.loadLists(); },
        error: (err: HttpErrorResponse) => this.toast.error(err.error?.message ?? this.translate.instant('COMMON.ERROR_GENERIC')),
      });
    });
  }
}
