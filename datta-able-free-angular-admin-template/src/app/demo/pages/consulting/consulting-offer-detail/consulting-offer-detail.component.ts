import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminConsultingOfferService } from 'src/app/core/services/admin-consulting-offer.service';
import { AdminConsultationRequestService } from 'src/app/core/services/admin-consultation-request.service';
import { ConsultingOffer } from 'src/app/core/models/consulting.model';
import { ConsultationRequest, RequestStatus } from 'src/app/core/models/consulting.model';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-consulting-offer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, ReactiveFormsModule],
  templateUrl: './consulting-offer-detail.component.html'
})
export class ConsultingOfferDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offerService = inject(AdminConsultingOfferService);
  private requestService = inject(AdminConsultationRequestService);
  private fileUploadService = inject(FileUploadService);

  offerId = Number(this.route.snapshot.paramMap.get('id'));

  private offerResult = toSignal(
    this.offerService.getById(this.offerId).pipe(catchError(() => of(null))),
    { initialValue: undefined }
  );

  private requestsResult = toSignal(
    this.requestService.getByConsultingId(this.offerId).pipe(catchError(() => of([] as ConsultationRequest[]))),
    { initialValue: [] as ConsultationRequest[] }
  );

  offer = signal<ConsultingOffer | null>(null);
  requests = signal<ConsultationRequest[]>([]);

  // Search for requests
  requestSearchControl = new FormControl('', { nonNullable: true });
  requestSearchTerm = signal('');

  // Delete state
  deleting = signal(false);

  constructor() {
    effect(() => {
      const res = this.offerResult();
      if (res !== undefined) this.offer.set(res);
    });
    effect(() => {
      const res = this.requestsResult();
      if (res !== undefined) this.requests.set(res);
    });

    this.requestSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(value => this.requestSearchTerm.set(value));
  }

  loading = computed(() => this.offerResult() === undefined);
  error = computed(() => this.offerResult() === null ? 'Impossible de charger cette offre.' : null);

  imageUrl = computed(() => {
    const img = this.offer()?.image;
    return img ? this.fileUploadService.resolveUrl(img) : null;
  });

  pendingCount = computed(() => this.requests().filter(r => r.status === 'PENDING').length);

  filteredRequests = computed(() => {
    const term = this.requestSearchTerm().toLowerCase().trim();
    if (!term) return this.requests();
    return this.requests().filter(r =>
      r.userFullName.toLowerCase().includes(term) ||
      r.userEmail.toLowerCase().includes(term) ||
      r.message.toLowerCase().includes(term)
    );
  });

  statusBadgeClass(status: RequestStatus): string {
    switch (status) {
      case 'PENDING': return 'bg-warning';
      case 'ACCEPTED': return 'bg-info';
      case 'COMPLETED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
    }
  }

  deleteOffer(): void {
    if (!this.offer()) return;
    if (!confirm(`Supprimer l'offre "${this.offer()!.title}" ? Cette action est irréversible.`)) return;

    this.deleting.set(true);
    this.offerService.delete(this.offerId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.router.navigate(['/consulting']);
      },
      error: (err) => {
        this.deleting.set(false);
        alert(err?.error?.message ?? 'Échec de la suppression. Veuillez réessayer.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/consulting']);
  }
}
