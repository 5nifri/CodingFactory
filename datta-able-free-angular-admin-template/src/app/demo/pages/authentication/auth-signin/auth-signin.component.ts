import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminAuthService } from 'src/app/core/services/admin-auth.service';

@Component({
  selector: 'app-auth-signin',
  imports: [CommonModule, RouterModule, SharedModule, FormField],
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export class AuthSigninComponent {
  private cd = inject(ChangeDetectorRef);
  private authService = inject(AdminAuthService);
  private router = inject(Router);

  submitted = signal(false);
  error = signal('');
  showPassword = signal(false);

  loginModal = signal<{ email: string; password: string }>({
    email: '',
    password: ''
  });

  loginForm = form(this.loginModal, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    this.submitted.set(true);
    this.error.set('');

    const credentials = this.loginModal();

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err?.message === 'NOT_ADMIN') {
          this.error.set('Ce compte n\'a pas les droits administrateur.');
        } else {
          this.error.set('Email ou mot de passe incorrect.');
        }
        this.cd.detectChanges();
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
