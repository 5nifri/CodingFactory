import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormationService } from '../../core/services/formation.service';
import { EnrollmentService } from '../../core/services/enrollment';
import { AuthService } from '../../core/services/auth.service';
import { Formation, Course } from '../../core/models/formation.model';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatChipsModule,
    MatProgressSpinnerModule, MatListModule, MatIconModule
  ],
  templateUrl: './formation-detail.html',
  styleUrl: './formation-detail.scss'
})
export class FormationDetail implements OnInit {

  formation = signal<Formation | null>(null);
  courses = signal<Course[]>([]);
  loading = signal(true);
  error = signal(false);
  enrolling = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private enrollmentService: EnrollmentService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set(true);
      this.loading.set(false);
      return;
    }
    this.loadFormation(id);
  }

  private loadFormation(id: number): void {
    this.formationService.getFormationById(id).subscribe({
      next: (formation) => {
        this.formation.set(formation);
        this.loadCourses(id);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  private loadCourses(formationId: number): void {
    this.formationService.getCoursesByFormation(formationId).subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  enroll(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const formationId = this.formation()?.id;
    if (!formationId) return;

    this.enrolling.set(true);

    this.enrollmentService.enroll(formationId).subscribe({
      next: () => {
        this.enrolling.set(false);
        this.snackBar.open('Successfully enrolled!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.enrolling.set(false);
        const message = err?.error?.message || 'Enrollment failed. You may already be enrolled.';
        this.snackBar.open(message, 'Close', { duration: 4000 });
      }
    });
  }
}
