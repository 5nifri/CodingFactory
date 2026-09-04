import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  private authService = inject(AuthService);

  // Expose auth state to the template
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isStudent(): boolean {
    return this.authService.isStudent();
  }
}
