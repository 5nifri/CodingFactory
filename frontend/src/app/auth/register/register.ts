import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { catchError, of } from 'rxjs';

const CATEGORY_TO_INTEREST: Record<string, string> = {
  'Intelligence Artificielle': 'AI',
  'DevOps': 'DEVOPS',
  'Cybersécurité': 'CYBERSECURITY',
  'ERP': 'ERP',
  'Development': 'DEVELOPMENT',
  'Data Science': 'DATA_SCIENCE',
  'Mobile': 'MOBILE'
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit {
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  loading = false;
  error: string | null = null;
  success: string | null = null;

  availableOptions = signal<{ name: string; interestFlag: string }[]>([]);
  selectedInterests = signal<string[]>([]);

  ngOnInit(): void {
    this.categoryService.getAll().pipe(
      catchError(() => of([]))
    ).subscribe(categories => {
      const mapped = categories
        .map(c => c.name)
        .filter(name => CATEGORY_TO_INTEREST[name])
        .map(name => ({
          name,
          interestFlag: CATEGORY_TO_INTEREST[name]
        }));
      this.availableOptions.set(mapped);
    });
  }

  isInterestSelected(flag: string): boolean {
    return this.selectedInterests().includes(flag);
  }

  toggleInterest(flag: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedInterests.update(list => [...list, flag]);
    } else {
      this.selectedInterests.update(list => list.filter(f => f !== flag));
    }
  }

  onSubmit(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.error = 'Tous les champs sont obligatoires.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const payload = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      interests: this.selectedInterests()
    };

    console.log('Register payload:', payload); // <-- check in console

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        const message = err?.error?.message || err?.message || 'Inscription échouée. Veuillez réessayer.';
        this.error = message;
      }
    });
  }
}
