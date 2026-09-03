import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminCategoryService } from 'src/app/core/services/admin-category.service';
import { Category } from 'src/app/core/models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, ReactiveFormsModule],
  templateUrl: './category-list.component.html'
})
export class CategoryListComponent {
  private categoryService = inject(AdminCategoryService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  deletingId = signal<number | null>(null);

  searchControl = new FormControl('', { nonNullable: true });
  searchTerm = signal('');

  filteredCategories = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.categories();
    return this.categories().filter(c =>
      c.name.toLowerCase().includes(term) ||
      (c.description?.toLowerCase() ?? '').includes(term)
    );
  });

  constructor() {
    this.load();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(value => this.searchTerm.set(value));
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les catégories.');
        this.loading.set(false);
      }
    });
  }

  // Clear search input
  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchTerm.set('');
  }

  onDelete(category: Category): void {
    if (!category.id) return;
    if (!confirm(`Supprimer la catégorie "${category.name}" ?`)) return;

    this.deletingId.set(category.id);
    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.categories.update(list => list.filter(c => c.id !== category.id));
        this.deletingId.set(null);
      },
      error: (err) => {
        this.deletingId.set(null);
        alert(err?.error?.message ?? 'Suppression impossible.');
      }
    });
  }
}
