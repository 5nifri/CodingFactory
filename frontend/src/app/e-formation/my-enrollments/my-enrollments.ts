import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { EnrollmentService } from '../enrollment.service';

@Component({
  selector: 'app-my-enrollments',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './my-enrollments.html',
  styleUrl: './my-enrollments.scss'
})
export class MyEnrollments {
  private enrollmentService = inject(EnrollmentService);

  private result = toSignal(
    this.enrollmentService.getMyEnrollments().pipe(catchError(() => of(null))),
    { initialValue: undefined }
  );

  loading = () => this.result() === undefined;
  error = () => this.result() === null ? 'Impossible de charger vos formations.' : null;
  enrollments = () => this.result() ?? [];
}
