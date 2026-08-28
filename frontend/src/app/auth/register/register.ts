import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) return;

    this.loading = true;
    this.error = null;
    this.success = null;

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Compte créé. Vous pouvez vous connecter.';
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Inscription échouée. Cet email est peut-être déjà utilisé.';
      }
    });
  }
}
