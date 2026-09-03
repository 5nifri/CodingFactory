import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminConsultingOfferService } from 'src/app/core/services/admin-consulting-offer.service';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { ConsultingOffer } from 'src/app/core/models/consulting.model';

@Component({
  selector: 'app-consulting-offer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, ReactiveFormsModule],
  templateUrl: './consulting-offer-list.component.html'
})
export class ConsultingOfferListComponent {
  private offerService = inject(AdminConsultingOfferService);
  private fileUploadService = inject(FileUploadService);

  offers = signal<ConsultingOffer[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  deletingId = signal<number | null>(null);

  searchControl = new FormControl('', { nonNullable: true });
  searchTerm = signal('');

  filteredOffers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.offers();
    return this.offers().filter(o =>
      o.title.toLowerCase().includes(term) ||
      (o.category?.toLowerCase() ?? '').includes(term) ||
      o.description.toLowerCase().includes(term)
    );
  });

  constructor() {
    this.load();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(value => this.searchTerm.set(value));
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.offerService.getAll().subscribe({
      next: (offers) => {
        this.offers.set(offers);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les offres de consulting.');
        this.loading.set(false);
      }
    });
  }

  getImage(imageUrl: string | null): string {
    if (!imageUrl) return 'assets/img/portfolio/default-placeholder.jpg';
    return this.fileUploadService.resolveUrl(imageUrl);
  }

  onDelete(offer: ConsultingOffer): void {
    if (!offer.id) return;
    if (!confirm(`Supprimer l'offre "${offer.title}" ?`)) return;

    this.deletingId.set(offer.id);
    this.offerService.delete(offer.id).subscribe({
      next: () => {
        this.offers.update(list => list.filter(o => o.id !== offer.id));
        this.deletingId.set(null);
      },
      error: (err) => {
        this.deletingId.set(null);
        alert(err?.error?.message ?? 'Suppression impossible.');
      }
    });
  }
}
