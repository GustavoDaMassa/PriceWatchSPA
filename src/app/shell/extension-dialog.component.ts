import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

// TODO: atualizar com a URL real após publicação na Chrome Web Store
const EXTENSION_STORE_URL = 'https://chromewebstore.google.com/detail/pricewatch';

@Component({
  selector: 'app-extension-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div class="ext-header">
      <mat-icon class="ext-icon">extension</mat-icon>
      <div>
        <h2 mat-dialog-title>{{ 'EXTENSION.TITLE' | translate }}</h2>
        <p class="ext-subtitle">{{ 'EXTENSION.SUBTITLE' | translate }}</p>
      </div>
    </div>

    <mat-dialog-content>
      <p class="ext-desc">{{ 'EXTENSION.DESC' | translate }}</p>

      <ol class="ext-steps">
        <li>
          <strong>{{ 'EXTENSION.STEP1_TITLE' | translate }}</strong>
          <span>{{ 'EXTENSION.STEP1_DESC' | translate }}</span>
        </li>
        <li>
          <strong>{{ 'EXTENSION.STEP2_TITLE' | translate }}</strong>
          <span>{{ 'EXTENSION.STEP2_DESC' | translate }}</span>
        </li>
        <li>
          <strong>{{ 'EXTENSION.STEP3_TITLE' | translate }}</strong>
          <span>{{ 'EXTENSION.STEP3_DESC' | translate }}</span>
        </li>
      </ol>

      <div class="ext-tip">
        <mat-icon>lightbulb</mat-icon>
        <span>{{ 'EXTENSION.TIP' | translate }}</span>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">
        {{ 'COMMON.CLOSE' | translate }}
      </button>
      <button mat-flat-button class="ext-install-btn" (click)="openStore()">
        <mat-icon>open_in_new</mat-icon>
        {{ 'EXTENSION.INSTALL_BTN' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .ext-header {
      display: flex; align-items: center; gap: 16px;
      padding: 24px 24px 0;
    }
    .ext-icon {
      font-size: 40px; width: 40px; height: 40px;
      color: #3483FA; flex-shrink: 0;
    }
    h2[mat-dialog-title] { margin: 0 0 4px; font-size: 18px; font-weight: 600; color: #333; }
    .ext-subtitle { margin: 0; font-size: 13px; color: #666; }

    .ext-desc { margin: 0 0 20px; font-size: 14px; color: #555; line-height: 1.5; }

    .ext-steps {
      margin: 0 0 20px; padding-left: 20px;
      display: flex; flex-direction: column; gap: 12px;

      li {
        font-size: 14px; color: #333; line-height: 1.5;
        display: flex; flex-direction: column; gap: 2px;

        strong { font-weight: 600; }
        span { color: #555; }
      }
    }

    .ext-tip {
      display: flex; align-items: flex-start; gap: 8px;
      background: #FFF9E6; border: 1px solid #FFE600;
      border-radius: 4px; padding: 10px 12px;
      font-size: 13px; color: #555; line-height: 1.4;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #E6A817; flex-shrink: 0; }
    }

    .ext-install-btn {
      background: #FFE600 !important; color: #333 !important; font-weight: 600 !important;
      mat-icon { font-size: 18px; width: 18px; height: 18px; margin-right: 4px; }
    }
  `],
})
export class ExtensionDialogComponent {
  protected readonly ref = inject(MatDialogRef<ExtensionDialogComponent>);

  openStore(): void {
    window.open(EXTENSION_STORE_URL, '_blank', 'noopener');
  }
}
