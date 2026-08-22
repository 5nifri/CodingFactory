import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormationService } from '../../core/services/formation.service';
import { Formation } from '../../core/models/formation.model';

@Component({
  selector: 'app-formation-list',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule,
    MatChipsModule, MatProgressSpinnerModule
  ],
  templateUrl: './formation-list.html',
  styleUrl: './formation-list.scss'
})
export class FormationList implements OnInit {

  formations = signal<Formation[]>([]);
  loading = signal(true);
  error = signal(false);

  constructor(
    private formationService: FormationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formationService.getPublishedFormations().subscribe({
      next: (data) => {
        this.formations.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  viewDetail(id: number): void {
    this.router.navigate(['/formations', id]);
  }
}
