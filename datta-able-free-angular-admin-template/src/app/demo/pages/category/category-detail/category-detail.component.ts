import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminCategoryService } from 'src/app/core/services/admin-category.service';
import { Category } from 'src/app/core/models/category.model';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './category-detail.component.html'
})
export class CategoryDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(AdminCategoryService);

  categoryId = Number(this.route.snapshot.paramMap.get('id'));

  private result = toSignal(
    this.categoryService.getById(this.categoryId).pipe(catchError(() => of(null))),
    { initialValue: undefined }
  );

  category = signal<Category | null>(null);

  constructor() {
    effect(() => {
      const res = this.result();
      if (res !== undefined) this.category.set(res);
    });
  }

  loading = computed(() => this.result() === undefined);
  error = computed(() => this.result() === null ? 'Impossible de charger cette catégorie.' : null);

  goBack(): void {
    this.router.navigate(['/categories']);
  }
}
