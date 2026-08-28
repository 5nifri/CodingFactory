import { Component, inject, computed, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of, forkJoin } from 'rxjs';
import { FormationService } from '../formation.service';
import { EnrollmentService } from '../enrollment.service';
import { ProgressService } from '../progress.service';
import { AuthService } from '../../core/services/auth.service';
import { Course, Formation } from '../formation.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type ContentType = 'youtube' | 'vimeo' | 'video' | 'unknown';

@Component({
  selector: 'app-course-view',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './course-view.html',
  styleUrl: './course-view.scss'
})
export class CourseView {
  private route = inject(ActivatedRoute);
  private formationService = inject(FormationService);
  private enrollmentService = inject(EnrollmentService);
  private progressService = inject(ProgressService);
  private sanitizer = inject(DomSanitizer);
  authService = inject(AuthService);

  private result = toSignal(
    this.route.paramMap.pipe(
      switchMap(p => {
        const formationId = Number(p.get('formationId'));
        const courseId = Number(p.get('courseId'));
        if (!formationId || !courseId) return of(null);

        return forkJoin({
          formation: this.formationService.getFormationById(formationId),
          courses: this.formationService.getCoursesByFormation(formationId)
        }).pipe(
          map(({ formation, courses }) => {
            const course = courses.find(c => c.id === courseId) ?? null;
            return course ? { formation, course, courses } : null;
          }),
          catchError(() => of(null))
        );
      })
    ),
    { initialValue: undefined }
  );

  loading = computed(() => this.result() === undefined);
  error = computed(() => this.result() === null ? 'Cours introuvable ou accès refusé.' : null);
  formation = computed<Formation | null>(() => this.result()?.formation ?? null);
  course = computed<Course | null>(() => this.result()?.course ?? null);
  allCourses = computed<Course[]>(() => this.result()?.courses ?? []);

  // Sorted by orderIndex for navigation
  orderedCourses = computed(() =>
    [...this.allCourses()].sort((a, b) => a.orderIndex - b.orderIndex)
  );

  prevCourse = computed<Course | null>(() => {
    const list = this.orderedCourses();
    const currentId = this.course()?.id;
    const idx = list.findIndex(c => c.id === currentId);
    return idx > 0 ? list[idx - 1] : null;
  });

  nextCourse = computed<Course | null>(() => {
    const list = this.orderedCourses();
    const currentId = this.course()?.id;
    const idx = list.findIndex(c => c.id === currentId);
    return idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  });

  completing = signal(false);
  completed = signal(false);
  actionError = signal<string | null>(null);
  completedCourseIds = signal<Set<number>>(new Set());

  constructor() {
    // Load whether this course is already completed
    effect(() => {
      const f = this.formation();
      const c = this.course();
      if (!f || !c || !this.authService.isLoggedIn()) {
        this.completed.set(false);
        return;
      }

      this.enrollmentService.getMyEnrollments().subscribe({
        next: (enrollments) => {
          const enrollment = enrollments.find(e => e.formationId === f.id);
          if (!enrollment) {
            this.completed.set(false);
            return;
          }

          this.progressService.getCompletedCourseIds(enrollment.id).subscribe({
            next: (ids) => this.completed.set(ids.includes(c.id)),
            error: () => this.completed.set(false)
          });
        },
        error: () => this.completed.set(false)
      });
    });
  }

  // ---- Video helpers ----

  videoType = computed<ContentType>(() => {
    const url = this.course()?.videoUrl;
    if (!url) return 'unknown';
    return this.detectContentType(url);
  });

  youtubeEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.course()?.videoUrl;
    if (!url || this.videoType() !== 'youtube') return null;
    const id = this.extractYoutubeId(url);
    if (!id) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${id}`
    );
  });

  vimeoEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.course()?.videoUrl;
    if (!url || this.videoType() !== 'vimeo') return null;
    const id = this.extractVimeoId(url);
    if (!id) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://player.vimeo.com/video/${id}`
    );
  });

  directVideoUrl = computed(() => {
    const url = this.course()?.videoUrl;
    if (!url || this.videoType() !== 'video') return null;
    return this.toAbsoluteUrl(url);
  });

  materialAbsoluteUrl = computed(() => {
    const url = this.course()?.materialUrl;
    return url ? this.toAbsoluteUrl(url) : null;
  });

  // ---- Actions ----

  markAsCompleted(): void {
    const c = this.course();
    if (!c || this.completed() || this.completing()) return;

    this.completing.set(true);
    this.actionError.set(null);

    this.progressService.completeCourse(c.id).subscribe({
      next: () => {
        this.completed.set(true);
        this.completing.set(false);
      },
      error: () => {
        this.completing.set(false);
        this.actionError.set('Impossible de marquer ce cours comme terminé.');
      }
    });
  }

  // ---- Helpers ----

  private detectContentType(url: string): ContentType {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('vimeo.com')) return 'vimeo';
    if (
      lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') ||
      lower.includes('/uploads/')
    ) return 'video';
    return 'unknown';
  }

  private extractYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  private extractVimeoId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  }

  private toAbsoluteUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
  }
}
