import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ConsultingService } from '../consulting.service';

@Component({
  selector: 'app-consulting-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './consulting-home.html',
  styleUrl: './consulting-home.scss'
})
export class ConsultingHome {
  private consultingService = inject(ConsultingService);

  private result = toSignal(
    this.consultingService.getAll().pipe(catchError(() => of(null))),
    { initialValue: undefined }
  );

  loading = computed(() => this.result() === undefined);
  error = computed(() => this.result() === null ? 'Impossible de charger les offres.' : null);
  offers = computed(() => this.result() ?? []);
}
