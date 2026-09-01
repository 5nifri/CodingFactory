import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { FormationService } from '../formation.service';
import { Formation } from '../formation.model';
import { AuthService } from '../../core/services/auth.service';
import { RecommendationService } from '../../core/services/recommendation.service';
import { resolveFormationImageUrl } from '../../core/utils/image-url.util';

@Component({
  selector: 'app-e-formation-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './e-formation-home.html',
  styleUrl: './e-formation-home.scss'
})
export class EFormationHome {
  private formationService = inject(FormationService);
  private recommendationService = inject(RecommendationService);
  private authService = inject(AuthService);

  fallbackImage = 'assets/img/portfolio/app-1.jpg';

  isLoggedIn = this.authService.isLoggedIn;

  // undefined = still loading, null = error, Formation[] = success
  private result = toSignal(
    this.formationService.getPublishedFormations().pipe(
      catchError(() => of(null))
    ),
    { initialValue: undefined }
  );

  formations = computed(() => this.result() ?? []);
  loading = computed(() => this.result() === undefined);
  error = computed(() => this.result() === null ? 'Impossible de charger les formations.' : null);

  // Recommendations: only fetched for logged-in visitors. undefined = loading,
  // null = error or "not available" (both treated the same: hide the section),
  // RecommendedFormation[] = success with at least one formation.
  private recommendationResult = toSignal(
    this.recommendationService.getMyRecommendations().pipe(
      catchError(() => of(null))
    ),
    { initialValue: undefined }
  );

  recommendations = computed(() => {
    const result = this.recommendationResult();
    if (!result || !result.available || result.formations.length === 0) {
      return [];
    }
    return result.formations;
  });

  // The whole section is hidden for guests, while loading, or when there's
  // nothing to recommend — no partial/empty-state UI for this section,
  // per the "hide entirely" contract decided for the ML integration.
  showRecommendations = computed(() =>
    this.isLoggedIn() && this.recommendations().length > 0
  );

  getImage(formation: Formation): string {
    return resolveFormationImageUrl(formation.imageUrl, this.fallbackImage);
  }

  getRecommendationImage(imageUrl: string | null): string {
    return resolveFormationImageUrl(imageUrl, this.fallbackImage);
  }

  matchPercent(score: number): number {
    return Math.round(score * 100);
  }
}
