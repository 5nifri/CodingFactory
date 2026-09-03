import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminFormationService } from 'src/app/core/services/admin-formation.service';
import { FormationResponse } from 'src/app/core/models/formation.model';
import { resolveFormationImageUrl } from 'src/app/core/utils/image-url.util';

@Component({
  selector: 'app-formations-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, ReactiveFormsModule],
  templateUrl: './formations-list.component.html'
})
export class FormationsListComponent {
  private formationService = inject(AdminFormationService);

  formations = signal<FormationResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  deletingId = signal<number | null>(null);

  // Search
  searchControl = new FormControl('', { nonNullable: true });
  searchTerm = signal('');

  // Status filter: ALL | PUBLISHED | DRAFT
  statusFilter = signal<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  filteredFormations = computed(() => {
    let result = this.formations();
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();

    if (term) {
      result = result.filter(f =>
        f.title.toLowerCase().includes(term) ||
        f.description.toLowerCase().includes(term) ||
        f.categoryName.toLowerCase().includes(term)
      );
    }

    if (status === 'PUBLISHED') result = result.filter(f => f.published);
    if (status === 'DRAFT') result = result.filter(f => !f.published);

    return result;
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
    this.formationService.getAllForAdmin().subscribe({
      next: (formations) => {
        this.formations.set(formations);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les formations.');
        this.loading.set(false);
      }
    });
  }

  setFilter(status: 'ALL' | 'PUBLISHED' | 'DRAFT'): void {
    this.statusFilter.set(status);
  }

  getImage(imageUrl: string | null): string {
    return resolveFormationImageUrl(imageUrl, 'assets/img/portfolio/app-1.jpg', 'http://localhost:8080');
  }

  onDelete(formation: FormationResponse): void {
    if (!confirm(`Supprimer la formation "${formation.title}" ?`)) return;

    this.deletingId.set(formation.id);
    this.formationService.delete(formation.id).subscribe({
      next: () => {
        this.formations.update(list => list.filter(f => f.id !== formation.id));
        this.deletingId.set(null);
      },
      error: (err) => {
        this.deletingId.set(null);
        alert(err?.error?.message ?? 'Suppression impossible.');
      }
    });
  }
}
