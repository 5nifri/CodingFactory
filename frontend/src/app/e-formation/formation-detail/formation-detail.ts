import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of, forkJoin } from 'rxjs';
import { FormationService } from '../formation.service';
import { Formation, Course } from '../formation.model';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './formation-detail.html',
  styleUrl: './formation-detail.scss'
})
export class FormationDetail {
  private route = inject(ActivatedRoute);
  private formationService = inject(FormationService);
  fallbackImage = 'assets/img/portfolio/app-1.jpg';

  // undefined = loading, null = error, object = success
  private result = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return forkJoin({
          formation: this.formationService.getFormationById(id),
          courses: this.formationService.getCoursesByFormation(id)
        }).pipe(
          catchError(() => of(null))
        );
      })
    ),
    { initialValue: undefined }
  );

  loading = computed(() => this.result() === undefined);
  error = computed(() => this.result() === null ? 'Impossible de charger cette formation.' : null);
  formation = computed<Formation | null>(() => this.result()?.formation ?? null);
  courses = computed<Course[]>(() => this.result()?.courses ?? []);

  getImage(formation: Formation): string {
    return formation.imageUrl || this.fallbackImage;
  }
}
