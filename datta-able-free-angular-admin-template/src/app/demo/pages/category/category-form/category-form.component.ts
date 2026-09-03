import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminCategoryService } from 'src/app/core/services/admin-category.service';
import { Category, CategoryRequest } from 'src/app/core/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './category-form.component.html'
})
export class CategoryFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(AdminCategoryService);
  submitAttempted = signal(false);
  categoryId = Number(this.route.snapshot.paramMap.get('id')) || null;
  isEditMode = this.categoryId !== null;

  private existingCategory = toSignal(
    this.isEditMode
      ? this.categoryService.getById(this.categoryId!).pipe(catchError(() => of(null)))
      : of(null),
    { initialValue: undefined }
  );

  loadingExisting = signal(this.isEditMode);

  model = signal<CategoryRequest>({
    name: '',
    description: ''
  });

  private initialized = false;

  constructor() {
    effect(() => {
      const existing = this.existingCategory();
      if (existing === undefined) return;

      this.loadingExisting.set(false);

      if (this.isEditMode && existing && !this.initialized) {
        this.initialized = true;
        this.model.set({
          name: existing.name,
          description: existing.description ?? ''
        });
      }
    });
  }

  submitting = signal(false);
  submitError = signal<string | null>(null);

  updateField<K extends keyof CategoryRequest>(field: K, value: CategoryRequest[K]): void {
    this.model.update(m => ({ ...m, [field]: value }));
  }

  onSubmit(): void {
    this.submitAttempted.set(true);  // ← ADD THIS

    if (!this.model().name.trim()) {
      this.submitError.set('Le nom de la catégorie est requis.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const request$ = this.isEditMode
      ? this.categoryService.update(this.categoryId!, this.model())
      : this.categoryService.create(this.model());

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/categories']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.message ?? "Échec de l'enregistrement. Veuillez vérifier les champs.");
      }
    });
  }
}
