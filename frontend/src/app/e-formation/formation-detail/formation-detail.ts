import { Component, inject, computed, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of, forkJoin } from 'rxjs';
import { FormationService } from '../formation.service';
import { EnrollmentService } from '../enrollment.service';
import { ProgressService } from '../progress.service';
import { AuthService } from '../../core/services/auth.service';
import { Formation, Course, Enrollment } from '../formation.model';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './formation-detail.html',
  styleUrl: './formation-detail.scss'
})
export class FormationDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formationService = inject(FormationService);
  private enrollmentService = inject(EnrollmentService);
  private progressService = inject(ProgressService);
  authService = inject(AuthService);
  fallbackImage = 'assets/img/portfolio/app-1.jpg';

  private formationId = toSignal(
    this.route.paramMap.pipe(map(params => Number(params.get('id')))),
    { initialValue: 0 }
  );

  private result = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return forkJoin({
          formation: this.formationService.getFormationById(id),
          courses: this.formationService.getCoursesByFormation(id)
        }).pipe(catchError(() => of(null)));
      })
    ),
    { initialValue: undefined }
  );

  loading = computed(() => this.result() === undefined);
  error = computed(() => this.result() === null ? 'Impossible de charger cette formation.' : null);
  formation = computed<Formation | null>(() => this.result()?.formation ?? null);
  courses = computed<Course[]>(() => this.result()?.courses ?? []);

  // The current enrollment row for this formation (if any), refetched whenever the id changes or an action succeeds
  private enrollmentTrigger = signal(0);
  currentEnrollment = signal<Enrollment | null>(null);
  enrollmentChecked = signal(false); // avoids flashing "S'inscrire" before we know the real state

  completedCourseIds = signal<Set<number>>(new Set());
  completingCourseId = signal<number | null>(null);

  actionLoading = signal(false);
  actionError = signal<string | null>(null);

  isEnrolled = computed(() => this.currentEnrollment()?.status === 'ACTIVE');
  isCompleted = computed(() => this.currentEnrollment()?.status === 'COMPLETED');
  progress = computed(() => this.currentEnrollment()?.progress ?? 0);
  isStudentOrGuest = computed(() => !this.authService.isLoggedIn() || this.authService.isStudent());

  constructor() {
    // fetch/refetch the current enrollment for this formation
    effect(() => {
      const id = this.formationId();
      this.enrollmentTrigger(); // dependency: re-run when we manually bump this after enroll/unenroll
      if (!id) return;

      if (!this.authService.isLoggedIn()) {
        this.currentEnrollment.set(null);
        this.enrollmentChecked.set(true);
        return;
      }

      this.enrollmentService.getMyEnrollments().subscribe({
        next: (enrollments) => {
          const match = enrollments.find(e => e.formationId === id) ?? null;
          this.currentEnrollment.set(match);
          this.enrollmentChecked.set(true);
        },
        error: () => {
          this.currentEnrollment.set(null);
          this.enrollmentChecked.set(true);
        }
      });
    });

    // whenever we have an enrollment, fetch which courses are already completed
    effect(() => {
      const enrollment = this.currentEnrollment();
      if (!enrollment) {
        this.completedCourseIds.set(new Set());
        return;
      }

      this.progressService.getCompletedCourseIds(enrollment.id).subscribe({
        next: (ids) => this.completedCourseIds.set(new Set(ids)),
        error: () => this.completedCourseIds.set(new Set())
      });
    });
  }

  onEnrollClick(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.isStudent()) {
      this.actionError.set('Seuls les étudiants peuvent s\'inscrire à une formation.');
      return;
    }

    const id = this.formationId();
    const wasEnrolled = this.isEnrolled();

    this.actionLoading.set(true);
    this.actionError.set(null);

    const onSuccess = () => {
      this.actionLoading.set(false);
      this.enrollmentTrigger.update(v => v + 1);
    };

    const onError = () => {
      this.actionError.set(
        wasEnrolled ? 'Échec de la désinscription.' : "Échec de l'inscription."
      );
      this.actionLoading.set(false);
    };

    if (wasEnrolled) {
      this.enrollmentService.unenroll(id).subscribe({ next: onSuccess, error: onError });
    } else {
      this.enrollmentService.enroll(id).subscribe({ next: onSuccess, error: onError });
    }
  }

  isCourseCompleted(courseId: number): boolean {
    return this.completedCourseIds().has(courseId);
  }

  onConsultCourse(course: Course): void {
    if (this.isCourseCompleted(course.id)) {
      return; // already completed, nothing to update — the <a> tag's own href/target still opens it
    }

    this.completingCourseId.set(course.id);
    this.actionError.set(null);

    this.progressService.completeCourse(course.id).subscribe({
      next: () => {
        this.completingCourseId.set(null);
        this.completedCourseIds.update(set => new Set(set).add(course.id));
        this.enrollmentTrigger.update(v => v + 1); // refresh overall % and possibly flip status to COMPLETED
      },
      error: () => {
        this.completingCourseId.set(null);
        this.actionError.set('Impossible de marquer ce cours comme consulté.');
      }
    });
  }

  getImage(formation: Formation): string {
    return formation.imageUrl || this.fallbackImage;
  }
}
