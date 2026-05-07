import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { ProfileOverviewComponent } from './profile-overview.component';
import { UsersApiService } from '../../../core/services/api/users-api.service';
import { AuthApiService } from '../../../core/services/api/auth-api.service';

describe('ProfileOverviewComponent', () => {
  let fixture: ComponentFixture<ProfileOverviewComponent>;
  let usersApi: jasmine.SpyObj<UsersApiService>;

  const mockProfile = { id: '1', name: 'Test', email: 'a@b.com', isEmailVerified: true, createdAt: new Date().toISOString() };

  beforeEach(async () => {
    usersApi = jasmine.createSpyObj('UsersApiService', ['getProfile']);
    usersApi.getProfile.and.returnValue(of(mockProfile));

    await TestBed.configureTestingModule({
      imports: [ProfileOverviewComponent, TranslateModule.forRoot()],
      providers: [
        provideAnimationsAsync(),
        { provide: UsersApiService, useValue: usersApi },
        { provide: AuthApiService, useValue: jasmine.createSpyObj('AuthApiService', ['resendVerification']) },
        RouterLink,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileOverviewComponent);
    fixture.detectChanges();
  });

  it('should load and display user profile', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(usersApi.getProfile).toHaveBeenCalled();
    expect(fixture.componentInstance.profile()?.name).toBe('Test');
  }));
});
