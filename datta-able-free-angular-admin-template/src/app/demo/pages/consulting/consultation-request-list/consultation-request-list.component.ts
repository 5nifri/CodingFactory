import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';          // ← added Router
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminConsultationRequestService } from 'src/app/core/services/admin-consultation-request.service';
import { ConsultationRequest, RequestStatus } from 'src/app/core/models/consulting.model';

@Component({
  selector: 'app-consultation-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, ReactiveFormsModule],
  templateUrl: './consultation-request-list.component.html'
})
export class ConsultationRequestListComponent {
  private requestService = inject(AdminConsultationRequestService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);          // ← inject Router

  requests = signal<ConsultationRequest[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  updatingId = signal<number | null>(null);
  statusFilter = signal<RequestStatus | 'ALL'>('ALL');

  // Search
  searchControl = new FormControl('', { nonNullable: true });
  searchTerm = signal('');

  // Optional consulting filter from query params
  consultingIdFilter = signal<number | null>(null);

  filteredRequests = computed(() => {
    let result = this.requests();
    const filter = this.statusFilter();
    const term = this.searchTerm().toLowerCase().trim();
    const consultingId = this.consultingIdFilter();

    if (filter !== 'ALL') {
      result = result.filter(r => r.status === filter);
    }
    if (consultingId !== null) {
      result = result.filter(r => r.consultingId === consultingId);
    }
    if (term) {
      result = result.filter(r =>
        r.userFullName.toLowerCase().includes(term) ||
        r.userEmail.toLowerCase().includes(term) ||
        r.consultingTitle.toLowerCase().includes(term) ||
        r.message.toLowerCase().includes(term)
      );
    }
    return result;
  });

  constructor() {
    this.load();

    // Watch for query param changes (e.g., from consulting offer detail)
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        const cid = Number(params['consultingId']);
        this.consultingIdFilter.set(cid || null);
      });

    // Search debounce
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(value => this.searchTerm.set(value));
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.requestService.getAll().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les demandes de consulting.');
        this.loading.set(false);
      }
    });
  }

  setFilter(status: RequestStatus | 'ALL'): void {
    this.statusFilter.set(status);
  }

  clearConsultingFilter(): void {
    this.consultingIdFilter.set(null);
  }

  updateStatus(request: ConsultationRequest, status: RequestStatus): void {
    if (this.updatingId()) return;
    this.updatingId.set(request.id);
    this.requestService.updateStatus(request.id, status).subscribe({
      next: (updated) => {
        this.requests.update(list => list.map(r => r.id === updated.id ? updated : r));
        this.updatingId.set(null);
      },
      error: (err) => {
        this.updatingId.set(null);
        alert(err?.error?.message ?? 'Échec de la mise à jour du statut.');
      }
    });
  }

  statusBadgeClass(status: RequestStatus): string {
    switch (status) {
      case 'PENDING': return 'bg-warning';
      case 'ACCEPTED': return 'bg-info';
      case 'COMPLETED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
    }
  }

  goToDetail(id: number): void {
    this.router.navigate(['/consulting/requests', id], {
      state: { returnUrl: '/consulting/requests' }
    });
  }
}
