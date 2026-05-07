import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { VerifyEmailComponent } from './verify-email.component';
import { AuthApiService } from '../../../core/services/api/auth-api.service';

describe('VerifyEmailComponent', () => {
  let fixture: ComponentFixture<VerifyEmailComponent>;
  let authApi: jasmine.SpyObj<AuthApiService>;

  const setupWithParams = async (params: Record<string, string>) => {
    authApi = jasmine.createSpyObj('AuthApiService', ['verifyEmail']);
    await TestBed.configureTestingModule({
      imports: [VerifyEmailComponent, TranslateModule.forRoot()],
      providers: [
        provideAnimationsAsync(),
        { provide: AuthApiService, useValue: authApi },
        { provide: ActivatedRoute, useValue: { queryParams: of(params) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VerifyEmailComponent);
  };

  it('should call verifyEmail with query params and show success', fakeAsync(async () => {
    await setupWithParams({ email: 'a@b.com', token: 'abc123' });
    authApi.verifyEmail.and.returnValue(of({ message: 'ok' }));
    fixture.detectChanges();
    tick();
    expect(authApi.verifyEmail).toHaveBeenCalledWith({ email: 'a@b.com', token: 'abc123' });
    expect(fixture.componentInstance.status()).toBe('success');
  }));

  it('should show error state on failure', fakeAsync(async () => {
    await setupWithParams({ email: 'a@b.com', token: 'bad' });
    authApi.verifyEmail.and.returnValue(throwError(() => ({ status: 400 })));
    fixture.detectChanges();
    tick();
    expect(fixture.componentInstance.status()).toBe('error');
  }));
});
