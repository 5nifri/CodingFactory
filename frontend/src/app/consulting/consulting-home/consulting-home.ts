import { Component, inject, computed, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ConsultingService } from '../consulting.service';

const DEFAULT_ICON = 'bi-briefcase';

@Component({
  selector: 'app-consulting-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './consulting-home.html',
  styleUrl: './consulting-home.scss'
})
export class ConsultingHome {

  private consultingService = inject(ConsultingService);
  private readonly backendOrigin = 'http://localhost:8080';

  // ---- Filters ----
  searchTerm = signal('');
  categoryFilter = signal<string>('');
  sortBy = signal<'title' | 'category'>('title');

  // ---- Pagination ----
  currentPage = signal(1);
  itemsPerPage = 9;

  private result = toSignal(
    this.consultingService.getAll().pipe(
      catchError(() => of(null))
    ),
    { initialValue: undefined }
  );

  loading = computed(() => this.result() === undefined);
  error = computed(() => this.result() === null ? 'Impossible de charger les offres.' : null);
  offers = computed(() => this.result() ?? []);

  // ---- Filtered & sorted list ----
  filteredAndSortedOffers = computed(() => {
    let list = this.offers();
    const term = this.searchTerm().toLowerCase().trim();
    const category = this.categoryFilter();
    const sort = this.sortBy();

    if (term) {
      list = list.filter(o =>
        o.title.toLowerCase().includes(term) ||
        (o.description?.toLowerCase() ?? '').includes(term) ||
        (o.category?.toLowerCase() ?? '').includes(term)
      );
    }

    if (category) {
      list = list.filter(o => o.category === category);
    }

    if (sort === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'category') {
      list = [...list].sort((a, b) => (a.category ?? '').localeCompare(b.category ?? ''));
    }

    return list;
  });

  // ---- Paginated items ----
  totalItems = computed(() => this.filteredAndSortedOffers().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));

  paginatedOffers = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAndSortedOffers().slice(start, end);
  });

  // ---- Reset page when filters change ----
  constructor() {
    effect(() => {
      // Trigger on any filter change
      this.searchTerm();
      this.categoryFilter();
      this.sortBy();
      // Reset to first page
      this.currentPage.set(1);
    });
  }

  // ---- Categories ----
  categories = computed(() => {
    const cats = new Set<string>();
    this.offers().forEach(o => {
      if (o.category) cats.add(o.category);
    });
    return Array.from(cats).sort();
  });

  // ---- Pagination methods ----
  goToPage(page: number): void {
    const total = this.totalPages();
    if (page < 1 || page > total) return;
    this.currentPage.set(page);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  // ---- Helpers ----
  resolveImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${this.backendOrigin}${path}`;
  }

  resolveIcon(icon: string | null | undefined): string {
    return icon && icon.trim() ? icon : DEFAULT_ICON;
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.categoryFilter.set('');
    this.sortBy.set('title');
    // currentPage will be reset by the effect
  }
}
