import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { FormationService } from '../formation.service';
import { Formation } from '../formation.model';

@Component({
  selector: 'app-e-formation-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './e-formation-home.html',
  styleUrl: './e-formation-home.scss'
})
export class EFormationHome {
  private formationService = inject(FormationService);
  fallbackImage = 'assets/img/portfolio/app-1.jpg';

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

  getImage(formation: Formation): string {
    return formation.imageUrl || this.fallbackImage;
  }
}
