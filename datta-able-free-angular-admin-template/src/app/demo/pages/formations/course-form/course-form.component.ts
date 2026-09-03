import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, catchError, of } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminCourseService } from 'src/app/core/services/admin-course.service';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { CourseRequest } from 'src/app/core/models/course.model';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './course-form.component.html'
})
export class CourseFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(AdminCourseService);
  private uploadService = inject(FileUploadService);
  submitAttempted = signal(false);
  durationHours = signal(0);
  durationMinutes = signal(0);
  formationId = Number(this.route.snapshot.paramMap.get('id'));
  courseId = Number(this.route.snapshot.paramMap.get('courseId')) || null;
  isEditMode = this.courseId !== null;

  // No GET /api/courses/{id} endpoint exists on the backend, so in edit mode
  // we fetch the whole formation's course list and find the one we need.
  private existingCourse = toSignal(
    this.isEditMode
      ? this.courseService.getByFormation(this.formationId).pipe(
        map(courses => courses.find(c => c.id === this.courseId) ?? null),
        catchError(() => of(null))
      )
      : of(null),
    { initialValue: undefined }
  );

  loadingExisting = computed(() => this.isEditMode && this.existingCourse() === undefined);

  model = signal<CourseRequest>({
    title: '',
    description: '',
    orderIndex: 1,
    videoUrl: null,
    materialUrl: null,
    duration: ''
  });

  private initialized = false;

  constructor() {
    effect(() => {
      const existing = this.existingCourse();
      if (this.isEditMode && existing && !this.initialized) {
        this.initialized = true;
        this.model.set({
          title: existing.title,
          description: existing.description,
          orderIndex: existing.orderIndex, // keep existing for update
          videoUrl: existing.videoUrl,
          materialUrl: existing.materialUrl,
          duration: existing.duration
        });
        // Parse and set hours/minutes signals
        const { hours, minutes } = this.parseDuration(existing.duration);
        this.durationHours.set(hours);
        this.durationMinutes.set(minutes);
      }
    });
  }

  uploadingVideo = signal(false);
  uploadingMaterial = signal(false);
  submitting = signal(false);
  submitError = signal<string | null>(null);

  updateField<K extends keyof CourseRequest>(field: K, value: CourseRequest[K]): void {
    this.model.update(m => ({ ...m, [field]: value }));
  }

  onVideoFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingVideo.set(true);
    this.uploadService.uploadCourseFile(file, 'video').subscribe({   // ← added 'video'
      next: (res) => {
        this.updateField('videoUrl', res.url);
        this.uploadingVideo.set(false);
      },
      error: () => {
        this.uploadingVideo.set(false);
        alert("Échec de l'upload de la vidéo.");
      }
    });
  }

  onMaterialFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingMaterial.set(true);
    this.uploadService.uploadCourseFile(file, 'material').subscribe({   // ← added 'material'
      next: (res) => {
        this.updateField('materialUrl', res.url);
        this.uploadingMaterial.set(false);
      },
      error: () => {
        this.uploadingMaterial.set(false);
        alert("Échec de l'upload du support.");
      }
    });
  }

  onSubmit(): void {
    this.submitAttempted.set(true);
    this.submitting.set(true);
    this.submitError.set(null);

    // Build duration string from current hours/minutes
    const duration = this.buildDurationString(this.durationHours(), this.durationMinutes());
    // Update the model with the formatted duration
    this.updateField('duration', duration);

    const m = this.model();
    if (!m.title.trim()) {
      this.submitting.set(false);
      this.submitError.set('Veuillez corriger les erreurs indiquées dans le formulaire.');
      return;
    }

    // For create, set orderIndex to a dummy value (will be overridden by backend)
    // For update, the existing orderIndex is kept.
    // No UI input for orderIndex – we keep it as is.

    const request$ = this.isEditMode
      ? this.courseService.update(this.courseId!, this.model())
      : this.courseService.create(this.formationId, this.model());

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/formations', this.formationId, 'courses']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.message ?? "Échec de l'enregistrement.");
      }
    });
  }

  private parseDuration(duration: string | null): { hours: number, minutes: number } {
    if (!duration) return { hours: 0, minutes: 0 };
    let hours = 0, minutes = 0;
    const hourMatch = duration.match(/(\d+)\s*heures?/);
    const minuteMatch = duration.match(/(\d+)\s*minutes?/);
    if (hourMatch) hours = parseInt(hourMatch[1], 10);
    if (minuteMatch) minutes = parseInt(minuteMatch[1], 10);
    return { hours, minutes };
  }

  private buildDurationString(hours: number, minutes: number): string | null {
    if (hours === 0 && minutes === 0) return null;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} heure${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    return parts.join(' et ');
  }

}
