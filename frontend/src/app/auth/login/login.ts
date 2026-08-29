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
          // Admins aren't expected to log in here — this is just a safety
          // net that sends them to the real admin app instead of /e-formation.
          window.location.href = 'http://localhost:4201';
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
