import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ConsultationRequestService } from '../consultation-request.service';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.scss'
})
export class MyRequests {
  private requestService = inject(ConsultationRequestService);

  private result = toSignal(
    this.requestService.getMyRequests().pipe(catchError(() => of(null))),
    { initialValue: undefined }
  );

  loading = () => this.result() === undefined;
  error = () => this.result() === null ? 'Impossible de charger vos demandes.' : null;
  requests = () => this.result() ?? [];
}
