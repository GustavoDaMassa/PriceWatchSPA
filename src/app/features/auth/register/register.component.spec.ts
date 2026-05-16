import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthApiService } from '../../../core/services/api/auth-api.service';
import { ToastService } from '../../../core/services/toast.service';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let authApi: jasmine.SpyObj<AuthApiService>;
  let router: Router;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    authApi = jasmine.createSpyObj('AuthApiService', ['register']);
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideAnimationsAsync(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: AuthApiService, useValue: authApi },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
  });

  it('should render name, email and password inputs', () => {
    const el = fixture.nativeElement;
    expect(el.querySelector('input[formControlName="name"]')).toBeTruthy();
    expect(el.querySelector('input[type="email"]')).toBeTruthy();
    expect(el.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('should call register and navigate to login on success', fakeAsync(() => {
    authApi.register.and.returnValue(of({ message: 'ok' }));
    fixture.componentInstance.form.setValue({ name: 'Test', email: 'a@b.com', password: '123456' });
    fixture.componentInstance.submit();
    tick();
    expect(authApi.register).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Test', email: 'a@b.com', password: '123456' }));
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  }));

  it('should show error toast on failure', fakeAsync(() => {
    authApi.register.and.returnValue(throwError(() => ({ status: 400, error: { detail: 'Email já existe' } })));
    fixture.componentInstance.form.setValue({ name: 'Test', email: 'a@b.com', password: '123456' });
    fixture.componentInstance.submit();
    tick();
    expect(toast.error).toHaveBeenCalledWith('Email já existe');
  }));
});
