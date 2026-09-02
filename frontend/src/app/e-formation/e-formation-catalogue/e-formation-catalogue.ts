import { Component, inject, computed } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormationService } from '../formation.service';
import { Category } from '../formation.model';
import { SortMode } from '../formation-search.model';
import { resolveFormationImageUrl } from '../../core/utils/image-url.util';

const PAGE_SIZE = 9;

function parseSort(value: string | null): SortMode {
  return value === 'POPULAR' || value === 'RECOMMENDED' ? value : 'RECENT';
}

@Component({
  selector: 'app-e-formation-catalogue',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './e-formation-catalogue.html',
  styleUrl: './e-formation-catalogue.scss'
})
export class EFormationCatalogue {
  private formationService = inject(FormationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  fallbackImage = 'assets/img/portfolio/app-1.jpg';

  // The URL is the single source of truth for filters — this makes "afficher
  // tous" links, back/forward navigation, and sharing a filtered link all work
  // for free, and mirrors the ?view=all query-param approach used elsewhere.
  private params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap
  });

  sort = computed<SortMode>(() => parseSort(this.params().get('sort')));
  categoryId = computed<number | null>(() => {
    const raw = this.params().get('categoryId');
    return raw ? Number(raw) : null;
  });
  page = computed<number>(() => Number(this.params().get('page') ?? 0));

  searchControl = new FormControl(this.route.snapshot.queryParamMap.get('q') ?? '', { nonNullable: true });

  private categoriesResult = toSignal(
    this.formationService.getCategories().pipe(catchError(() => of([] as Category[]))),
    { initialValue: [] as Category[] }
  );
  categories = computed(() => this.categoriesResult());

  // Re-fetches every time the URL's query params change.
  private result = toSignal(
    this.route.queryParamMap.pipe(
      switchMap(qp =>
        this.formationService.searchFormations({
          q: qp.get('q') ?? undefined,
          categoryId: qp.get('categoryId') ? Number(qp.get('categoryId')) : undefined,
          sort: parseSort(qp.get('sort')),
          page: qp.get('page') ? Number(qp.get('page')) : 0,
          size: PAGE_SIZE
        }).pipe(catchError(() => of(null)))
      )
    ),
    { initialValue: undefined }
  );

  formations = computed(() => this.result()?.formations ?? []);
  totalPages = computed(() => this.result()?.totalPages ?? 0);
  totalElements = computed(() => this.result()?.totalElements ?? 0);
  loading = computed(() => this.result() === undefined);
  error = computed(() => this.result() === null ? 'Impossible de charger les formations.' : null);

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(value => this.updateParams({ q: value || null, page: 0 }));
  }

  getImage(imageUrl: string): string {
    return resolveFormationImageUrl(imageUrl, this.fallbackImage);
  }

  selectCategory(categoryId: number | null): void {
    this.updateParams({ categoryId, page: 0 });
  }

  selectSort(sort: SortMode): void {
    this.updateParams({ sort, page: 0 });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages() || page === this.page()) return;
    this.updateParams({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateParams(changes: Record<string, string | number | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: changes,
      queryParamsHandling: 'merge'
    });
  }
}
