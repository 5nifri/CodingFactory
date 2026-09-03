import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminCourseService } from 'src/app/core/services/admin-course.service';
import { CourseResponse } from 'src/app/core/models/course.model';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, DragDropModule],
  templateUrl: './courses-list.component.html'
})
export class CoursesListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(AdminCourseService);

  formationId = Number(this.route.snapshot.paramMap.get('id'));

  courses = signal<CourseResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  deletingId = signal<number | null>(null);
  savingOrder = signal(false);

  hasOrderChanged = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.courseService.getByFormation(this.formationId).subscribe({
      next: (courses) => {
        // Sort by orderIndex to ensure correct initial order
        this.courses.set(courses.sort((a, b) => a.orderIndex - b.orderIndex));
        this.hasOrderChanged.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les cours.');
        this.loading.set(false);
      }
    });
  }

  drop(event: CdkDragDrop<CourseResponse[]>): void {
    const current = this.courses();
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    this.courses.set([...current]); // trigger signal update
    this.hasOrderChanged.set(true);
  }

  saveOrder(): void {
    if (!this.hasOrderChanged()) return;

    this.savingOrder.set(true);
    const ids = this.courses().map(c => c.id);

    this.courseService.reorder(this.formationId, ids).subscribe({
      next: () => {
        this.savingOrder.set(false);
        this.hasOrderChanged.set(false);
        // Update local orderIndex to match new order
        this.courses.update(list => list.map((c, i) => ({ ...c, orderIndex: i + 1 })));
      },
      error: () => {
        this.savingOrder.set(false);
        alert('Échec de la sauvegarde de l\'ordre.');
      }
    });
  }

  onDelete(course: CourseResponse): void {
    if (!confirm(`Supprimer le cours "${course.title}" ?`)) return;

    this.deletingId.set(course.id);
    this.courseService.delete(course.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        // Refresh the list to get updated order indices from backend
        this.load(); // <- added
      },
      error: (err) => {
        this.deletingId.set(null);
        alert(err?.error?.message ?? 'Suppression impossible.');
      }
    });
  }

  goBack(): void {
    // Navigate to the specific formation's detail page
    this.router.navigate(['/formations', this.formationId]);
  }
}
