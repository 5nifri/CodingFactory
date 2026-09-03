import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadService } from 'src/app/core/services/file-upload.service';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pdf-viewer-container">
      @if (resolvedUrl) {
        <a [href]="resolvedUrl" target="_blank" class="btn btn-outline-primary">
          <i class="feather icon-download"></i> Télécharger le PDF
        </a>
      } @else {
        <span class="text-muted">Aucun support fourni</span>
      }
    </div>
  `,
  styles: [`
    .pdf-viewer-container {
      padding: 0.5rem 0;
    }
  `]
})
export class PdfViewerComponent {
  @Input() set url(value: string | null | undefined) {
    this.resolvedUrl = value ? this.uploadService.resolveUrl(value) : '';
  }

  private uploadService = inject(FileUploadService);

  resolvedUrl = '';
}
