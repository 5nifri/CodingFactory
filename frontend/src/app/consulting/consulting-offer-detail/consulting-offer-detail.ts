import { Component, inject, computed, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of } from 'rxjs';
import { ConsultingService } from '../consulting.service';
import { ConsultationRequestService } from '../consultation-request.service';
import { AuthService } from '../../core/services/auth.service';
import { ConsultationRequest } from '../consulting.model';

@Component({
  selector: 'app-consulting-offer-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './consulting-offer-detail.html',
  styleUrl: './consulting-offer-detail.scss'
})
export class ConsultingOfferDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultingService = inject(ConsultingService);
  private requestService = inject(ConsultationRequestService);
  authService = inject(AuthService);

  private readonly baseUrl = 'http://localhost:8080';  // ← backend base URL

  private offerId = toSignal(
    this.route.paramMap.pipe(map(params => Number(params.get('id')))),
    { initialValue: 0 }
  );

  private result = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.consultingService.getById(id).pipe(catchError(() => of(null)));
      })
    ),
    { initialValue: undefined }
  );

  loading = computed(() => this.result() === undefined);
  error = computed(() => this.result() === null ? "Impossible de charger cette offre." : null);
  offer = computed(() => this.result() ?? null);

  // Resolve image URL (relative to full URL)
  imageUrl = computed(() => {
    const img = this.offer()?.image;
    if (!img) return null;
    return img.startsWith('http') ? img : `${this.baseUrl}${img}`;
  });

  message = signal('');
  submitting = signal(false);
  submitError = signal<string | null>(null);

  private requestTrigger = signal(0);
  existingRequest = signal<ConsultationRequest | null>(null);
  existingRequestChecked = signal(false);

  constructor() {
    effect(() => {
      const id = this.offerId();
      this.requestTrigger();
      if (!id) return;

      if (!this.authService.isLoggedIn()) {
        this.existingRequest.set(null);
        this.existingRequestChecked.set(true);
        return;
      }

      this.requestService.getMyRequests().subscribe({
        next: (requests) => {
          const match = requests.find(r => r.consultingId === id) ?? null;
          this.existingRequest.set(match);
          this.existingRequestChecked.set(true);
        },
        error: () => {
          this.existingRequest.set(null);
          this.existingRequestChecked.set(true);
        }
      });
    });
  }

  onSubmit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const offer = this.offer();
    if (!offer || !this.message().trim()) return;

    this.submitting.set(true);
    this.submitError.set(null);

    this.requestService.create(offer.id, this.message().trim()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.message.set('');
        this.requestTrigger.update(v => v + 1);
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set("Échec de l'envoi de la demande.");
      }
    });
  }
}
