import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ConsultingService } from '../consulting.service';

const DEFAULT_ICON = 'bi-briefcase';

@Component({
  selector: 'app-consulting-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './consulting-home.html',
  styleUrl: './consulting-home.scss'
})
export class ConsultingHome {

  private consultingService = inject(ConsultingService);

  // Backend serves uploaded files from /uploads/**, mounted at the API
  // origin — not this app's origin — so image paths need it prefixed.
  private readonly backendOrigin = 'http://localhost:8080';

  private result = toSignal(
    this.consultingService.getAll().pipe(
      catchError(() => of(null))
    ),
    { initialValue: undefined }
  );

  loading = computed(() => this.result() === undefined);

  error = computed(() =>
    this.result() === null
      ? 'Impossible de charger les offres.'
      : null
  );

  offers = computed(() => this.result() ?? []);

  /**
   * Resolves a possibly-relative image path (e.g. "/uploads/consulting/xyz.png")
   * to a full URL usable in <img [src]>. Already-absolute URLs (including
   * Pexels stock photo URLs) pass through unchanged.
   */
  resolveImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${this.backendOrigin}${path}`;
  }

  /**
   * Offers without an admin-chosen icon fall back to a generic one, rather
   * than rendering an empty icon slot.
   */
  resolveIcon(icon: string | null | undefined): string {
    return icon && icon.trim() ? icon : DEFAULT_ICON;
  }
}
