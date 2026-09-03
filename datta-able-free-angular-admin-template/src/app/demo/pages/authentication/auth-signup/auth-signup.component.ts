import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminAuthService } from 'src/app/core/services/admin-auth.service';

@Component({
  selector: 'app-auth-signup',
  imports: [CommonModule, RouterModule, SharedModule, FormField],
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export class AuthSignupComponent {
  private cd = inject(ChangeDetectorRef);
  private authService = inject(AdminAuthService);
  private router = inject(Router);

  submitted = signal(false);
  error = signal('');
  showPassword = signal(false);

  registerModel = signal<{ firstName: string; lastName: string; email: string; password: string }>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.firstName, { message: 'First name is required' });
    required(schemaPath.lastName, { message: 'Last name is required' });
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    this.submitted.set(true);
    this.error.set('');

    const data = this.registerModel();

    this.authService.register(data).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.error.set('Inscription échouée. Cet email est peut-être déjà utilisé.');
        this.cd.detectChanges();
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
