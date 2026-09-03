import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminFormationService } from 'src/app/core/services/admin-formation.service';
import { FormationResponse } from 'src/app/core/models/formation.model';
import { resolveFormationImageUrl } from 'src/app/core/utils/image-url.util';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './formation-detail.component.html'
})
export class FormationDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formationService = inject(AdminFormationService);

  formationId = Number(this.route.snapshot.paramMap.get('id'));
  private readonly backendOrigin = 'http://localhost:8080';

  private result = toSignal(
    this.formationService.getById(this.formationId).pipe(catchError(() => of(null))),
    { initialValue: undefined }
  );

  formation = signal<FormationResponse | null>(null);

  constructor() {
    effect(() => {
      const res = this.result();
      if (res !== undefined) this.formation.set(res);
    });
  }

  loading = computed(() => this.result() === undefined);
  error = computed(() => this.result() === null ? 'Impossible de charger cette formation.' : null);

  imageUrl = computed(() => {
    const f = this.formation();
    return f?.imageUrl ? resolveFormationImageUrl(f.imageUrl, '', this.backendOrigin) : null;
  });

  goBack(): void {
    this.router.navigate(['/formations']);
  }
}
