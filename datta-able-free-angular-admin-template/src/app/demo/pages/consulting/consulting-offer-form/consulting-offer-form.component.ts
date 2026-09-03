import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminConsultingOfferService } from 'src/app/core/services/admin-consulting-offer.service';
import { CategoryService } from 'src/app/core/services/category.service';          // ← ADD
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { ImageSuggestionService, ImageSuggestion } from 'src/app/core/services/image-suggestion.service';
import { suggestIcon } from 'src/app/core/utils/icon-suggestion.util';
import { Consulting } from 'src/app/core/models/consulting.model';
import { Category } from 'src/app/core/models/formation.model';                     // ← ADD
import { IconPickerComponent } from './icon-picker.component';

@Component({
  selector: 'app-consulting-offer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, IconPickerComponent],
  templateUrl: './consulting-offer-form.component.html'
})
export class ConsultingOfferFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offerService = inject(AdminConsultingOfferService);
  private categoryService = inject(CategoryService);                               // ← ADD
  private fileUploadService = inject(FileUploadService);
  private imageSuggestionService = inject(ImageSuggestionService);
  submitAttempted = signal(false);
  offerId = Number(this.route.snapshot.paramMap.get('id')) || null;
  isEditMode = this.offerId !== null;

  // ── Categories dropdown ──────────────────────────────────────────────
  categories = toSignal(
    this.categoryService.getAll().pipe(catchError(() => of([] as Category[]))),
    { initialValue: [] as Category[] }
  );
  // ─────────────────────────────────────────────────────────────────────

  private existingOffer = toSignal(
    this.isEditMode
      ? this.offerService.getById(this.offerId!).pipe(catchError(() => of(null)))
      : of(null),
    { initialValue: undefined }
  );

  loadingExisting = computed(() => this.isEditMode && this.existingOffer() === undefined);

  model = signal<Omit<Consulting, 'id'>>({
    title: '',
    description: '',
    category: '',
    image: '',
    icon: ''
  });

  private initialized = false;

  constructor() {
    effect(() => {
      const existing = this.existingOffer();
      if (this.isEditMode && existing && !this.initialized) {
        this.initialized = true;
        this.model.set({
          title: existing.title,
          description: existing.description,
          category: existing.category ?? '',
          image: existing.image ?? '',
          icon: existing.icon ?? ''
        });
      }
    });
  }

  submitting = signal(false);
  submitError = signal<string | null>(null);

  // --- Image upload state ---
  uploadingImage = signal(false);
  imageUploadError = signal<string | null>(null);
  isDragging = signal(false);

  imagePreviewUrl = computed(() => {
    const image = this.model().image;
    return image ? this.fileUploadService.resolveUrl(image) : null;
  });

  // --- Free image search (Pexels) state ---
  imageSuggestions = signal<ImageSuggestion[]>([]);
  searchingImages = signal(false);
  imageSearchError = signal<string | null>(null);

  updateField<K extends keyof Omit<Consulting, 'id'>>(field: K, value: Omit<Consulting, 'id'>[K]): void {
    this.model.update(m => ({ ...m, [field]: value }));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  removeImage(): void {
    this.updateField('image', '');
    this.imageUploadError.set(null);
  }

  private handleFile(file: File): void {
    this.imageUploadError.set(null);

    if (!file.type.startsWith('image/')) {
      this.imageUploadError.set('Veuillez sélectionner un fichier image valide (jpg, jpeg, png, webp).');
      return;
    }

    this.uploadingImage.set(true);

    this.fileUploadService.uploadConsultingImage(file).subscribe({
      next: (res) => {
        this.updateField('image', res.url);
        this.uploadingImage.set(false);
      },
      error: (err) => {
        this.uploadingImage.set(false);
        this.imageUploadError.set(err?.error?.message ?? "Échec du téléversement de l'image.");
      }
    });
  }

  searchImages(): void {
    const { title, category } = this.model();
    const query = [title, category].filter(Boolean).join(' ').trim();

    if (!query) {
      this.imageSearchError.set('Ajoutez un titre pour rechercher une image correspondante.');
      return;
    }

    this.searchingImages.set(true);
    this.imageSearchError.set(null);
    this.imageSuggestions.set([]);

    this.imageSuggestionService.search(query).subscribe({
      next: (results) => {
        this.searchingImages.set(false);
        this.imageSuggestions.set(results);
        if (results.length === 0) {
          this.imageSearchError.set('Aucune image trouvée pour cette recherche.');
        }
      },
      error: (err) => {
        this.searchingImages.set(false);
        this.imageSearchError.set(err?.error?.message ?? "Échec de la recherche d'images.");
      }
    });
  }

  selectSuggestedImage(suggestion: ImageSuggestion): void {
    this.updateField('image', suggestion.url);
    this.imageSuggestions.set([]);
  }

  dismissImageSuggestions(): void {
    this.imageSuggestions.set([]);
    this.imageSearchError.set(null);
  }

  suggestIconForOffer(): void {
    const { title, description } = this.model();
    this.updateField('icon', suggestIcon(title, description));
  }

  onSubmit(): void {
    this.submitAttempted.set(true);  // ← ADD THIS
    this.submitting.set(true);
    this.submitError.set(null);

    const m = this.model();
    if (!m.title.trim() || !m.description.trim() || !m.category) {
      this.submitting.set(false);
      this.submitError.set('Veuillez corriger les erreurs indiquées dans le formulaire.');
      return;
    }

    const request$ = this.isEditMode
      ? this.offerService.update(this.offerId!, this.model())
      : this.offerService.create(this.model());

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/consulting']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.message ?? "Échec de l'enregistrement. Veuillez vérifier les champs.");
      }
    });
  }
}
