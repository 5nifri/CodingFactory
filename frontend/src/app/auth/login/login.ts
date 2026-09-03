import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.error = null;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        if (this.authService.isAdmin()) {
          const token = this.authService.getToken();
          if (token) {
            window.location.href = `http://localhost:4201/login?token=${encodeURIComponent(token)}`;
          } else {
            // Fallback: redirect to admin login if token is missing (shouldn't happen)
            window.location.href = 'http://localhost:4201/login';
          }
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Connexion échouée. Vérifiez vos identifiants.';
      }
    });
  }
}
