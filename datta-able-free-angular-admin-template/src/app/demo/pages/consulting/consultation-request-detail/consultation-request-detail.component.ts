import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminConsultationRequestService } from 'src/app/core/services/admin-consultation-request.service';
import { ConsultationRequest, RequestStatus } from 'src/app/core/models/consulting.model';
import { Location } from '@angular/common';  // <-- import Location

@Component({
  selector: 'app-consultation-request-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './consultation-request-detail.component.html'
})
export class ConsultationRequestDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(AdminConsultationRequestService);
  private location = inject(Location);  // <-- inject Location

  requestId = Number(this.route.snapshot.paramMap.get('id'));

  private result = toSignal(
    this.requestService.getById(this.requestId).pipe(catchError(() => of(null))),
    { initialValue: undefined }
  );

  request = signal<ConsultationRequest | null>(null);
  updating = signal(false);

  constructor() {
    effect(() => {
      const res = this.result();
      if (res !== undefined) this.request.set(res);
    });
  }

  loading = computed(() => this.result() === undefined);
  error = computed(() => this.result() === null ? 'Impossible de charger cette demande.' : null);

  statusBadgeClass(status: RequestStatus): string {
    switch (status) {
      case 'PENDING': return 'bg-warning';
      case 'ACCEPTED': return 'bg-info';
      case 'COMPLETED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
    }
  }

  availableActions(status: RequestStatus): { label: string; status: RequestStatus; btnClass: string }[] {
    switch (status) {
      case 'PENDING':
        return [
          { label: 'Accepter la demande', status: 'ACCEPTED', btnClass: 'btn-success' },
          { label: 'Rejeter', status: 'REJECTED', btnClass: 'btn-danger' }
        ];
      case 'ACCEPTED':
        return [
          { label: 'Marquer comme terminée', status: 'COMPLETED', btnClass: 'btn-primary' },
          { label: 'Rejeter', status: 'REJECTED', btnClass: 'btn-danger' },
          { label: 'Remettre en attente', status: 'PENDING', btnClass: 'btn-warning' }
        ];
      case 'REJECTED':
        return [
          { label: 'Accepter', status: 'ACCEPTED', btnClass: 'btn-success' },
          { label: 'Remettre en attente', status: 'PENDING', btnClass: 'btn-warning' }
        ];
      case 'COMPLETED':
        return [
          { label: 'Rouvrir (Acceptée)', status: 'ACCEPTED', btnClass: 'btn-info' }
        ];
    }
  }

  updateStatus(status: RequestStatus): void {
    if (this.updating()) return;
    this.updating.set(true);
    this.requestService.updateStatus(this.requestId, status).subscribe({
      next: (updated) => {
        this.request.set(updated);
        this.updating.set(false);
      },
      error: () => {
        this.updating.set(false);
        alert('Échec de la mise à jour du statut.');
      }
    });
  }

  goBack(): void {
    // Try to go back in history; if there's no previous page, fallback to the list.
    // Using location.back() will navigate to the previous page.
    // We also check if the previous URL is known; but it's simpler to just use back().
    // However, if the user came from an external link, we might want to go to the list.
    // We'll use a combination: try to go back, but if there's no state, go to list.
    // For safety, we can check if the previous route is /consulting/requests or /consulting/:id.
    // We'll use the router's navigation history: the last successful navigation.
    // A simple approach: go back if possible, else navigate to the list.
    // The location.back() will work in most cases.
    this.location.back();
    // If you want a fallback, you could wrap in a setTimeout and check if navigation occurred.
    // But for simplicity, we'll just use back().
  }
}
