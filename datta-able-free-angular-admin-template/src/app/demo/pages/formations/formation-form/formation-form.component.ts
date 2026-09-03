import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminFormationService } from 'src/app/core/services/admin-formation.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { FormationRequest } from 'src/app/core/models/formation.model';
import { resolveFormationImageUrl } from 'src/app/core/utils/image-url.util';
import { Component, inject, signal, computed, effect } from '@angular/core';


@Component({
  selector: 'app-formation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './formation-form.component.html'
})
export class FormationFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formationService = inject(AdminFormationService);
  private categoryService = inject(CategoryService);
  private fileUploadService = inject(FileUploadService);
  submitAttempted = signal(false);
  // Backend serves uploaded files from /uploads/**, mounted at the API
  // origin (see WebConfig.addResourceHandlers) — not the Angular dev
  // server origin, so previews need the full backend URL prefixed.
  private readonly backendOrigin = 'http://localhost:8080';

  formationId = Number(this.route.snapshot.paramMap.get('id')) || null;
  isEditMode = this.formationId !== null;

  categories = toSignal(
    this.categoryService.getAll().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  private existingFormation = toSignal(
    this.isEditMode
      ? this.formationService.getById(this.formationId!).pipe(catchError(() => of(null)))
      : of(null),
    { initialValue: undefined }
  );

  loadingExisting = computed(() => this.isEditMode && this.existingFormation() === undefined);

  model = signal<FormationRequest>({
    title: '',
    description: '',
    duration: '',
    price: 0,
    imageUrl: '',
    published: false,
    categoryId: 0
  });

  private initialized = false;

  constructor() {
    effect(() => {
      const existing = this.existingFormation();
      if (this.isEditMode && existing && !this.initialized) {
        this.initialized = true;
        this.model.set({
          title: existing.title,
          description: existing.description,
          duration: existing.duration,
          price: existing.price,
          imageUrl: existing.imageUrl,
          published: existing.published,
          categoryId: existing.categoryId
        });
      }
    });
  }

  submitting = signal(false);
  submitError = signal<string | null>(null);

  uploading = signal(false);
  uploadError = signal<string | null>(null);

  updateField<K extends keyof FormationRequest>(field: K, value: FormationRequest[K]): void {
    this.model.update(m => ({ ...m, [field]: value }));
  }

  /**
   * Full URL usable in an <img [src]> preview, whether imageUrl is a
   * relative server path from our own upload endpoint (e.g.
   * "/uploads/formations/xyz.png") or a full external URL someone pasted
   * in manually.
   */
  imagePreviewUrl = computed(() => {
    const url = this.model().imageUrl;
    if (!url) return null;
    return resolveFormationImageUrl(url, '', this.backendOrigin) || null;
  });

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set(null);

    this.fileUploadService.uploadFormationImage(file).subscribe({
      next: (response) => {
        this.updateField('imageUrl', response.url);
        this.uploading.set(false);
      },
      error: () => {
        this.uploadError.set("Échec de l'envoi de l'image. Vérifiez le format (jpg, jpeg, png, webp).");
        this.uploading.set(false);
      }
    });

    // allow selecting the same file again later without the browser
    // suppressing the change event
    input.value = '';
  }

  onSubmit(): void {
    this.submitAttempted.set(true);  // ← ADD THIS
    this.submitting.set(true);
    this.submitError.set(null);

    const m = this.model();
    if (!m.title.trim() || !m.description.trim() || !m.duration.trim() || m.categoryId === 0 || m.price < 0) {
      this.submitting.set(false);
      this.submitError.set('Veuillez corriger les erreurs indiquées dans le formulaire.');
      return;
    }

    const request$ = this.isEditMode
      ? this.formationService.update(this.formationId!, this.model())
      : this.formationService.create(this.model());

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/formations']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.message ?? "Échec de l'enregistrement. Veuillez vérifier les champs.");
      }
    });
  }
}
