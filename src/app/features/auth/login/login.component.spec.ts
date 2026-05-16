import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthApiService } from '../../../core/services/api/auth-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let authApi: jasmine.SpyObj<AuthApiService>;
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    authApi = jasmine.createSpyObj('AuthApiService', ['login']);
    auth = jasmine.createSpyObj('AuthService', ['login']);
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideAnimationsAsync(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: AuthApiService, useValue: authApi },
        { provide: AuthService, useValue: auth },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  it('should render email and password inputs', () => {
    const el = fixture.nativeElement;
    expect(el.querySelector('input[type="email"]')).toBeTruthy();
    expect(el.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('should disable submit when form is invalid', () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(btn.disabled).toBeTrue();
  });

  it('should call login and navigate to dashboard on success', fakeAsync(() => {
    const res = { token: 'jwt', email: 'a@b.com', name: 'Test', isEmailVerified: true };
    authApi.login.and.returnValue(of(res));
    fixture.componentInstance.form.setValue({ email: 'a@b.com', password: '123456' });
    fixture.componentInstance.submit();
    tick();
    expect(authApi.login).toHaveBeenCalledWith({ email: 'a@b.com', password: '123456' });
    expect(auth.login).toHaveBeenCalledWith(res);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should show error toast on failure', fakeAsync(() => {
    authApi.login.and.returnValue(throwError(() => ({ status: 401, error: { detail: 'Credenciais inválidas' } })));
    fixture.componentInstance.form.setValue({ email: 'a@b.com', password: 'wrong' });
    fixture.componentInstance.submit();
    tick();
    expect(toast.error).toHaveBeenCalledWith('Credenciais inválidas');
  }));
});
