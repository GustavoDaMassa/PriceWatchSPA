import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
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
    MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule,
    TranslateModule, EmptyStateComponent,
  ],
  template: `
    <div class="ml-page-header">
      <h1>{{ 'LISTS.TITLE' | translate }}</h1>
      <button class="ml-btn-primary" (click)="openForm()">
        <mat-icon>add</mat-icon>{{ 'LISTS.NEW' | translate }}
      </button>
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (lists().length === 0) {
      <app-empty-state [message]="'LISTS.EMPTY' | translate" icon="list" />
    } @else {
      <div class="ml-lists">
        @for (list of lists(); track list.id) {
          <div class="ml-list-row">
            <div class="ml-list-icon-wrap">
              <mat-icon>list</mat-icon>
            </div>
            <div class="ml-list-info">
              <a [routerLink]="['/lists', list.id]" class="ml-list-name">{{ list.name }}</a>
              @if (list.description) {
                <span class="ml-list-desc">{{ list.description }}</span>
              }
            </div>
            <div class="ml-list-actions">
              <a [routerLink]="['/lists', list.id, 'analysis']" class="ml-action-link">
                <mat-icon>analytics</mat-icon>
                {{ 'LISTS.ANALYSIS' | translate }}
              </a>
              <button class="ml-icon-btn" [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu>
                <button mat-menu-item (click)="openForm(list)">
                  <mat-icon>edit</mat-icon>{{ 'LISTS.EDIT' | translate }}
                </button>
                <button mat-menu-item (click)="confirmDelete(list)" class="danger">
                  <mat-icon>delete</mat-icon>{{ 'LISTS.DELETE' | translate }}
                </button>
              </mat-menu>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .ml-page-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
    }
    .ml-page-header h1 { margin: 0; font-size: 20px; font-weight: 300; color: #333; }
    .ml-btn-primary {
      display: flex; align-items: center; gap: 4px;
      background: #FFE600; color: #333; border: none; border-radius: 4px;
      padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
      &:hover { background: #f0d800; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .center { display: flex; justify-content: center; padding: 48px; }

    .ml-lists { display: flex; flex-direction: column; gap: 4px; }

    .ml-list-row {
      background: white; border-radius: 4px; padding: 16px;
      display: flex; align-items: center; gap: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.08);
      transition: box-shadow 0.15s;
      &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.14); }
    }

    .ml-list-icon-wrap {
      width: 40px; height: 40px; border-radius: 4px;
      background: #EAF0FB; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { color: #3483FA; }
    }

    .ml-list-info { flex: 1; min-width: 0; }
    .ml-list-name {
      display: block; font-size: 15px; font-weight: 500; color: #3483FA;
      text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      &:hover { text-decoration: underline; }
    }
    .ml-list-desc { display: block; font-size: 13px; color: #666; margin-top: 2px; }

    .ml-list-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .ml-action-link {
      display: flex; align-items: center; gap: 4px;
      color: #3483FA; font-size: 13px; text-decoration: none;
      padding: 6px 10px; border-radius: 4px;
      &:hover { background: #EAF0FB; }
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .ml-icon-btn {
      background: none; border: none; cursor: pointer; color: #666;
      display: flex; align-items: center; justify-content: center;
      padding: 4px; border-radius: 4px;
      &:hover { background: #f5f5f5; }
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }

    .danger { color: #F23D4F; }
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

  ngOnInit(): void { this.loadLists(); }

  loadLists(): void {
    this.loading.set(true);
    this.listsApi.getLists().subscribe({
      next: data => { this.lists.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
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
        error: (err: HttpErrorResponse) =>
          this.toast.error(err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
      });
    });
  }
}
