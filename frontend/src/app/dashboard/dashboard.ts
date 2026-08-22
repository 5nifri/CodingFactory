import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EnrollmentService } from '../core/services/enrollment';
import { RouterLink } from '@angular/router';
import { Enrollment } from '../core/models/formation.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatChipsModule,
    MatProgressBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  enrollments = signal<Enrollment[]>([]);
  loading = signal(true);
  error = signal(false);

  constructor(
    private enrollmentService: EnrollmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.enrollmentService.getMyEnrollments().subscribe({
      next: (data) => {
        this.enrollments.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  goToFormation(formationId: number): void {
    this.router.navigate(['/formations', formationId]);
  }

  statusColor(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'primary';
      case 'ACTIVE': return 'accent';
      default: return 'warn';
    }
  }
}
