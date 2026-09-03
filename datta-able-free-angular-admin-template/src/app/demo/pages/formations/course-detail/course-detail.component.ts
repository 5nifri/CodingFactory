import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminCourseService } from 'src/app/core/services/admin-course.service';
import { AdminFormationService } from 'src/app/core/services/admin-formation.service';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { CourseResponse } from 'src/app/core/models/course.model';
import {PdfViewerComponent} from "src/app/demo/pages/formations/course-detail/pdf-viewer.component";


@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule , PdfViewerComponent],
  templateUrl: './course-detail.component.html'
})
export class CourseDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(AdminCourseService);
  private formationService = inject(AdminFormationService);
  private uploadService = inject(FileUploadService);

  courseId = Number(this.route.snapshot.paramMap.get('courseId'));
  formationId = Number(this.route.snapshot.paramMap.get('id'));

  course = signal<CourseResponse | null>(null);
  formationTitle = signal<string>('Chargement...');
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.courseService.getById(this.courseId).subscribe({
      next: (data) => {
        this.course.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les détails du cours.');
        this.loading.set(false);
      }
    });

    this.formationService.getById(this.formationId).subscribe({
      next: (formation) => {
        this.formationTitle.set(formation.title);
      },
      error: () => {
        this.formationTitle.set('Formation #' + this.formationId);
      }
    });
  }

  // ✅ Resolved URLs (full absolute URLs)
  get videoUrl(): string {
    return this.uploadService.resolveUrl(this.course()?.videoUrl);
  }

  get materialUrl(): string {
    return this.uploadService.resolveUrl(this.course()?.materialUrl);
  }

  isVideoFile(url: string | null): boolean {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  }

  getPdfViewerUrl(url: string): string {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }

  orderBadgeClass(order: number): string {
    return order === 1 ? 'bg-primary' : 'bg-secondary';
  }

  goBack(): void {
    this.router.navigate(['/formations', this.formationId, 'courses']);
  }
}
